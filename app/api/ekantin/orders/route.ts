import { randomBytes } from "node:crypto";
import {
    createEkantinOrder,
    deleteEkantinOrder,
    getEkantinOrder,
    getEkantinProduct,
    listEkantinOrders,
    updateEkantinOrder,
    updateEkantinProduct,
} from "@/app/lib/firebase-server";
import { hasAdminSession } from "@/app/lib/admin-auth";

export const runtime = "nodejs";

export const EKANTIN_ORDER_STATUSES = [
    "Menunggu Konfirmasi",
    "Diproses Koperasi",
    "Siap Diambil / Diantar",
    "Selesai",
    "Dibatalkan",
] as const;

function formatOrderRecord(raw: Record<string, unknown>) {
    const itemsRaw = Array.isArray(raw.items) ? raw.items : [];
    const items = itemsRaw.map((item) => {
        const obj = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;
        return {
            product_id: String(obj.product_id || ""),
            name: String(obj.name || ""),
            price: Number(obj.price) || 0,
            qty: Number(obj.qty) || 1,
            variant: String(obj.variant || "Standar"),
            image_url: String(obj.image_url || ""),
            seller: String(obj.seller || "Koperasi Sekolah"),
        };
    });

    return {
        invoice: String(raw.invoice || ""),
        buyer_name: String(raw.buyer_name || ""),
        buyer_class: String(raw.buyer_class || ""),
        buyer_phone: String(raw.buyer_phone || ""),
        delivery_method: String(raw.delivery_method || "Ambil di Koperasi"),
        payment_method: String(raw.payment_method || "QRIS Koperasi"),
        notes: String(raw.notes || ""),
        admin_notes: String(raw.admin_notes || ""),
        status: String(raw.status || "Menunggu Konfirmasi"),
        subtotal: Number(raw.subtotal) || 0,
        service_fee: Number(raw.service_fee) || 0,
        total: Number(raw.total) || 0,
        items,
        created_at: String(raw.created_at || new Date().toISOString()),
    };
}

export async function GET(request: Request) {
    const url = new URL(request.url);
    const singleInvoice = url.searchParams.get("invoice")?.trim().toUpperCase();
    const multiInvoices = url.searchParams.get("invoices")?.trim();

    try {
        // Public lookup by single invoice number
        if (singleInvoice) {
            const doc = await getEkantinOrder(singleInvoice);
            if (!doc) {
                return Response.json({ error: "Nomor pesanan (Invoice) tidak ditemukan di Firebase." }, { status: 404 });
            }
            return Response.json({ order: formatOrderRecord(doc) }, { headers: { "Cache-Control": "private, no-store" } });
        }

        // Public lookup by comma-separated invoices (for student's own order history on device)
        if (multiInvoices) {
            const invoiceList = multiInvoices
                .split(",")
                .map((s) => s.trim().toUpperCase())
                .filter(Boolean)
                .slice(0, 25);
            const docs = await Promise.all(invoiceList.map((inv) => getEkantinOrder(inv)));
            const orders = docs.filter((d): d is Record<string, unknown> => d !== null).map(formatOrderRecord);
            return Response.json({ orders }, { headers: { "Cache-Control": "private, no-store" } });
        }

        // Full order list for Admin E-Kantin
        if (!(await hasAdminSession(request))) {
            return Response.json({ error: "Silakan login sebagai Admin untuk melihat seluruh pesanan E-Kantin." }, { status: 401 });
        }

        const rows = await listEkantinOrders();
        const orders = rows.map(formatOrderRecord);
        return Response.json({ orders }, { headers: { "Cache-Control": "private, no-store" } });
    } catch (error) {
        console.error("Failed to load E-Kantin orders from Firebase:", error);
        return Response.json({ error: "Gagal memuat data pesanan dari Firebase." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    let body: Record<string, unknown>;
    try {
        body = (await request.json()) as Record<string, unknown>;
    } catch {
        return Response.json({ error: "Format permintaan tidak valid." }, { status: 400 });
    }

    const buyerName = String(body.buyer_name || "").trim();
    const buyerClass = String(body.buyer_class || "").trim();
    const buyerPhone = String(body.buyer_phone || "").trim();
    const deliveryMethod = String(body.delivery_method || "Ambil di Koperasi").trim();
    const paymentMethod = String(body.payment_method || "QRIS Koperasi").trim();
    const notes = String(body.notes || "").trim();
    const itemsRaw = Array.isArray(body.items) ? body.items : [];

    if (!buyerName || !buyerClass) {
        return Response.json({ error: "Nama pemesan dan kelas / ruangan wajib diisi." }, { status: 400 });
    }
    if (itemsRaw.length === 0) {
        return Response.json({ error: "Keranjang pesanan masih kosong." }, { status: 400 });
    }

    const items = itemsRaw.map((item) => {
        const obj = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;
        return {
            product_id: String(obj.product_id || ""),
            name: String(obj.name || ""),
            price: Math.max(0, Number(obj.price) || 0),
            qty: Math.max(1, Math.floor(Number(obj.qty) || 1)),
            variant: String(obj.variant || "Standar"),
            image_url: String(obj.image_url || ""),
            seller: String(obj.seller || "Koperasi Sekolah"),
        };
    });

    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const serviceFee = deliveryMethod === "Antar ke Kelas" ? 2000 : 0;
    const total = subtotal + serviceFee;

    const invoice = `EK-${Date.now().toString().slice(-5)}${randomBytes(1).toString("hex").toUpperCase()}`;
    const record: Record<string, unknown> = {
        invoice,
        buyer_name: buyerName,
        buyer_class: buyerClass,
        buyer_phone: buyerPhone,
        delivery_method: deliveryMethod,
        payment_method: paymentMethod,
        notes,
        admin_notes: "",
        status: "Menunggu Konfirmasi",
        subtotal,
        service_fee: serviceFee,
        total,
        items,
        created_at: new Date().toISOString(),
    };

    try {
        await createEkantinOrder(invoice, record);

        // Update product stock & sold count in Firebase asynchronously
        await Promise.allSettled(
            items.map(async (item) => {
                if (!item.product_id) return;
                const prod = await getEkantinProduct(item.product_id);
                if (!prod) return;
                const currentStock = Number.isFinite(Number(prod.stock)) ? Number(prod.stock) : 0;
                const currentSold = Number(prod.sold) || 0;
                const nextStock = Math.max(0, currentStock - item.qty);
                await updateEkantinProduct(item.product_id, {
                    stock: nextStock,
                    sold: currentSold + item.qty,
                    available: nextStock > 0,
                });
            })
        );

        return Response.json({ order: formatOrderRecord(record) }, { status: 201 });
    } catch (error) {
        console.error("Failed to create E-Kantin order in Firebase:", error);
        return Response.json({ error: "Gagal menyimpan pesanan ke Firebase." }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    let body: Record<string, unknown>;
    try {
        body = (await request.json()) as Record<string, unknown>;
    } catch {
        return Response.json({ error: "Format permintaan tidak valid." }, { status: 400 });
    }

    const isAdmin = await hasAdminSession(request);
    const invoice = String(body.invoice || "").trim().toUpperCase();
    const status = typeof body.status === "string" ? body.status.trim() : "";

    if (!invoice) {
        return Response.json({ error: "Nomor invoice wajib disertakan." }, { status: 400 });
    }
    if (status && !EKANTIN_ORDER_STATUSES.includes(status as (typeof EKANTIN_ORDER_STATUSES)[number])) {
        return Response.json({ error: "Status pesanan tidak valid." }, { status: 400 });
    }

    // Non-admin (student) is only allowed to confirm receipt ("Selesai") or cancel if still waiting
    if (!isAdmin && status !== "Selesai" && status !== "Dibatalkan") {
        return Response.json({ error: "Silakan login sebagai Admin untuk mengubah tahapan status koperasi." }, { status: 401 });
    }

    try {
        const existing = await getEkantinOrder(invoice);
        if (!existing) {
            return Response.json({ error: "Pesanan tidak ditemukan di Firebase." }, { status: 404 });
        }

        const updates: Record<string, unknown> = {};
        if (status) updates.status = status;
        if (isAdmin && typeof body.admin_notes === "string") {
            updates.admin_notes = body.admin_notes.trim();
        }

        if (Object.keys(updates).length === 0) {
            return Response.json({ error: "Tidak ada perubahan yang dikirim." }, { status: 400 });
        }

        await updateEkantinOrder(invoice, updates);
        return Response.json({ order: formatOrderRecord({ ...existing, ...updates }) });
    } catch (error) {
        console.error("Failed to update E-Kantin order in Firebase:", error);
        return Response.json({ error: "Gagal memperbarui status pesanan di Firebase." }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!(await hasAdminSession(request))) {
        return Response.json({ error: "Silakan login sebagai Admin untuk menghapus pesanan." }, { status: 401 });
    }

    const invoice = new URL(request.url).searchParams.get("invoice")?.trim().toUpperCase();
    if (!invoice) {
        return Response.json({ error: "Nomor invoice tidak valid." }, { status: 400 });
    }

    try {
        const existing = await getEkantinOrder(invoice);
        if (!existing) {
            return Response.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
        }
        await deleteEkantinOrder(invoice);
        return Response.json({ deleted: invoice });
    } catch (error) {
        console.error("Failed to delete E-Kantin order from Firebase:", error);
        return Response.json({ error: "Gagal menghapus pesanan dari Firebase." }, { status: 500 });
    }
}
