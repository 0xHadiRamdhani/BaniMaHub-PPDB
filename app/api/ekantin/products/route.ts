import { randomBytes } from "node:crypto";
import {
    deleteDocument,
    deleteEkantinProduct,
    getDocumentDownloadUrl,
    getEkantinProduct,
    listEkantinProducts,
    saveEkantinProduct,
    updateEkantinProduct,
    uploadRegistrationDocument,
} from "@/app/lib/firebase-server";
import { hasAdminSession } from "@/app/lib/admin-auth";

export const runtime = "nodejs";

const validCategories = ["makanan", "minuman", "alat-tulis", "seragam", "atribut"];
const maxFileSize = 3 * 1024 * 1024; // 3 MB

const STARTER_CATALOG = [
    {
        id: "PRD-SERAGAM-RPL",
        name: "Seragam Wearpack Praktik RPL & TBSM",
        category: "seragam",
        price: 165000,
        original_price: 185000,
        rating: 4.9,
        sold: 0,
        stock: 25,
        seller: "Unit Produksi & Koperasi SMK",
        badge: "Wajib Praktik",
        estimate: "Ambil di Koperasi",
        description:
            "Wearpack praktik resmi SMK Bani Ma'sum berbahan American Drill tebal, adem, dilengkapi bordir logo sekolah & jurusan.",
        variants: ["Ukuran M", "Ukuran L", "Ukuran XL", "Ukuran XXL"],
        image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80",
        available: true,
    },
    {
        id: "PRD-BOWL-TERIYAKI",
        name: "Paket Nasi Ayam Bakar / Geprek Koperasi",
        category: "makanan",
        price: 15000,
        original_price: 18000,
        rating: 4.9,
        sold: 0,
        stock: 40,
        seller: "Kantin Sehat Bani Ma'sum",
        badge: "Best Seller",
        estimate: "Siap 10 Menit",
        description:
            "Nasi hangat porsi kenyang dengan ayam pilihan, lalapan segar, tahu/tempe, dan sambal khas kantin sekolah yang higienis.",
        variants: ["Ayam Geprek Level 1", "Ayam Geprek Level 3", "Ayam Bakar Madu"],
        image_url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
        available: true,
    },
    {
        id: "PRD-ATK-STARTER",
        name: "Paket Alat Tulis & Buku Catatan Ujian",
        category: "alat-tulis",
        price: 28000,
        original_price: 35000,
        rating: 4.8,
        sold: 0,
        stock: 50,
        seller: "Koperasi Siswa",
        badge: "Hemat 20%",
        estimate: "Siap 5 Menit",
        description:
            "Paket lengkap berisi 3 buku tulis kampus 58 lembar, 2 pulpen gel hitam, pensil 2B, penghapus, dan map plastik dokumen.",
        variants: ["Paket Standar", "Paket + Busur & Penggaris"],
        image_url: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=900&q=80",
        available: true,
    },
    {
        id: "PRD-ES-KOPI-SUSU",
        name: "Es Susu Cokelat & Matcha Segar Cup",
        category: "minuman",
        price: 8000,
        original_price: 10000,
        rating: 4.9,
        sold: 0,
        stock: 60,
        seller: "Booth Minuman Koperasi",
        badge: "Favorit Istirahat",
        estimate: "Siap 5 Menit",
        description:
            "Minuman segar cup sealed higienis dengan pilihan rasa Cokelat Belgia, Matcha Latte, atau Teh Tarik Susu.",
        variants: ["Cokelat Dingin", "Matcha Latte", "Teh Tarik Susu"],
        image_url: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=900&q=80",
        available: true,
    },
    {
        id: "PRD-ATRIBUT-SET",
        name: "Set Dasi, Topi, Sabuk & Bet Lokasi SMK",
        category: "atribut",
        price: 45000,
        original_price: 55000,
        rating: 5.0,
        sold: 0,
        stock: 35,
        seller: "Unit Produksi & Koperasi SMK",
        badge: "Atribut Resmi",
        estimate: "Ambil di Koperasi",
        description:
            "Paket atribut resmi upacara dan harian siswa SMK Bani Ma'sum: Topi bordir, dasi sekolah, ikat pinggang berlogo, dan bet lengkap.",
        variants: ["Set Lengkap Putra", "Set Lengkap Putri", "Hanya Topi & Dasi"],
        image_url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80",
        available: true,
    },
    {
        id: "PRD-SNACK-ROTI",
        name: "Roti Bakar Lumer & Risoles Mayo Hangat",
        category: "makanan",
        price: 10000,
        original_price: null,
        rating: 4.7,
        sold: 0,
        stock: 30,
        seller: "Kantin Sehat Bani Ma'sum",
        badge: "Hangat",
        estimate: "Siap 7 Menit",
        description:
            "Camilan pengganjal lapar saat jam istirahat: paket isi 3 risoles smoked beef mayones atau roti bakar cokelat keju lumer.",
        variants: ["Risoles Mayo (Isi 3)", "Roti Bakar Cokelat Keju"],
        image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80",
        available: true,
    },
    {
        id: "PRD-BATIK-SMK",
        name: "Kemeja Batik Identitas SMK Bani Ma'sum",
        category: "seragam",
        price: 125000,
        original_price: 140000,
        rating: 4.9,
        sold: 0,
        stock: 20,
        seller: "Unit Produksi & Koperasi SMK",
        badge: "Seragam Rabu-Kamis",
        estimate: "Ambil di Koperasi",
        description:
            "Kemeja batik resmi identitas siswa-siswi SMK Bani Ma'sum. Bahan katun primisima halus dan nyaman dipakai seharian.",
        variants: ["Lengan Panjang M", "Lengan Panjang L", "Lengan Panjang XL", "Lengan Pendek L"],
        image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80",
        available: true,
    },
    {
        id: "PRD-FLASHDISK-RPL",
        name: "Flashdisk 32GB USB 3.2 + Lanyard ID Card",
        category: "alat-tulis",
        price: 65000,
        original_price: 78000,
        rating: 4.8,
        sold: 0,
        stock: 18,
        seller: "Koperasi Tekno RPL",
        badge: "Rekomendasi RPL",
        estimate: "Siap 5 Menit",
        description:
            "Flashdisk original 32GB kecepatan tinggi untuk menyimpan tugas coding/praktik lab komputer, sudah termasuk tali lanyard ID Card sekolah.",
        variants: ["Bundling Lanyard Biru", "Bundling Lanyard Hitam"],
        image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
        available: true,
    },
];

async function formatProductRecord(raw: Record<string, unknown>) {
    let imageUrl = typeof raw.image_url === "string" && raw.image_url ? raw.image_url : "";
    if (!imageUrl && typeof raw.image_path === "string" && raw.image_path) {
        try {
            imageUrl = await getDocumentDownloadUrl(raw.image_path);
        } catch {
            imageUrl = "";
        }
    }
    const variantsRaw = raw.variants;
    const variants = Array.isArray(variantsRaw)
        ? variantsRaw.map((v) => String(v)).filter(Boolean)
        : typeof variantsRaw === "string" && variantsRaw.trim()
        ? variantsRaw.split(",").map((v) => v.trim()).filter(Boolean)
        : ["Standar"];

    return {
        id: String(raw.id || ""),
        name: String(raw.name || ""),
        category: validCategories.includes(String(raw.category)) ? String(raw.category) : "makanan",
        price: Number(raw.price) || 0,
        original_price: raw.original_price ? Number(raw.original_price) : null,
        rating: Number(raw.rating) || 5.0,
        sold: Number(raw.sold) || 0,
        stock: Number.isFinite(Number(raw.stock)) ? Number(raw.stock) : 0,
        seller: String(raw.seller || "Koperasi Sekolah"),
        badge: raw.badge ? String(raw.badge) : "",
        estimate: String(raw.estimate || "Siap 5 Menit"),
        description: String(raw.description || ""),
        variants: variants.length ? variants : ["Standar"],
        image_url: imageUrl,
        image_path: typeof raw.image_path === "string" ? raw.image_path : null,
        available: raw.available !== false && Number(raw.stock ?? 1) > 0,
        created_at: String(raw.created_at || new Date().toISOString()),
    };
}

export async function GET() {
    try {
        let rows = await listEkantinProducts();
        if (rows.length === 0) {
            const now = Date.now();
            const seeded: Array<Record<string, unknown>> = [];
            for (let i = 0; i < STARTER_CATALOG.length; i++) {
                const item = STARTER_CATALOG[i];
                const record = {
                    ...item,
                    created_at: new Date(now - i * 1000).toISOString(),
                };
                await saveEkantinProduct(item.id, record);
                seeded.push(record);
            }
            rows = seeded;
        }
        const products = await Promise.all(rows.map(formatProductRecord));
        return Response.json({ products }, { headers: { "Cache-Control": "private, no-store" } });
    } catch (error) {
        console.error("Failed to list E-Kantin products from Firebase:", error);
        return Response.json({ error: "Gagal memuat katalog produk E-Kantin." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!(await hasAdminSession(request))) {
        return Response.json({ error: "Silakan login sebagai Admin untuk mengelola produk E-Kantin." }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";

    // Check if JSON body (for seed_default or JSON product creation)
    if (contentType.includes("application/json")) {
        let body: Record<string, unknown>;
        try {
            body = (await request.json()) as Record<string, unknown>;
        } catch {
            return Response.json({ error: "Format JSON tidak valid." }, { status: 400 });
        }

        if (body.action === "seed_default") {
            try {
                const now = Date.now();
                const saved = [];
                for (let i = 0; i < STARTER_CATALOG.length; i++) {
                    const item = STARTER_CATALOG[i];
                    const record = {
                        ...item,
                        created_at: new Date(now - i * 1000).toISOString(),
                    };
                    await saveEkantinProduct(item.id, record);
                    saved.push(await formatProductRecord(record));
                }
                return Response.json({ products: saved, message: `${saved.length} produk awal berhasil disimpan ke Firebase.` }, { status: 201 });
            } catch (error) {
                console.error("Failed to seed starter E-Kantin products:", error);
                return Response.json({ error: "Gagal menyimpan katalog awal ke Firebase." }, { status: 500 });
            }
        }

        const name = String(body.name || "").trim();
        const category = String(body.category || "makanan").trim();
        const price = Number(body.price) || 0;
        if (!name || price <= 0) {
            return Response.json({ error: "Nama produk dan harga wajib diisi dengan benar." }, { status: 400 });
        }

        const id = `PRD-${randomBytes(4).toString("hex").toUpperCase()}`;
        const variants = Array.isArray(body.variants)
            ? body.variants.map((v) => String(v).trim()).filter(Boolean)
            : String(body.variants || "Standar")
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean);

        const record: Record<string, unknown> = {
            id,
            name,
            category: validCategories.includes(category) ? category : "makanan",
            price,
            original_price: body.original_price ? Number(body.original_price) : null,
            rating: Number(body.rating) || 5.0,
            sold: Number(body.sold) || 0,
            stock: Number.isFinite(Number(body.stock)) ? Number(body.stock) : 20,
            seller: String(body.seller || "Koperasi Sekolah").trim(),
            badge: String(body.badge || "").trim(),
            estimate: String(body.estimate || "Siap 5 Menit").trim(),
            description: String(body.description || "").trim(),
            variants: variants.length ? variants : ["Standar"],
            image_url: String(body.image_url || "").trim(),
            available: body.available !== false,
            created_at: new Date().toISOString(),
        };

        try {
            await saveEkantinProduct(id, record);
            return Response.json({ product: await formatProductRecord(record) }, { status: 201 });
        } catch (error) {
            console.error("Failed to create E-Kantin product:", error);
            return Response.json({ error: "Gagal menyimpan produk ke Firebase." }, { status: 500 });
        }
    }

    // Otherwise handle multipart/form-data (with optional image file upload)
    let form: FormData;
    try {
        form = await request.formData();
    } catch {
        return Response.json({ error: "Format form data tidak valid." }, { status: 400 });
    }

    const name = form.get("name")?.toString().trim() ?? "";
    const category = form.get("category")?.toString().trim() ?? "makanan";
    const price = Number(form.get("price") ?? 0);
    const originalPriceRaw = form.get("original_price")?.toString().trim() ?? "";
    const stock = Number(form.get("stock") ?? 20);
    const seller = form.get("seller")?.toString().trim() || "Koperasi Sekolah";
    const badge = form.get("badge")?.toString().trim() ?? "";
    const estimate = form.get("estimate")?.toString().trim() || "Siap 5 Menit";
    const description = form.get("description")?.toString().trim() ?? "";
    const variantsRaw = form.get("variants")?.toString().trim() || "Standar";
    let imageUrl = form.get("image_url")?.toString().trim() ?? "";
    const fileEntry = form.get("image_file");
    const file = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;

    if (!name || price <= 0) {
        return Response.json({ error: "Nama produk dan harga (Rp) wajib diisi." }, { status: 400 });
    }
    if (file && (file.size > maxFileSize || !["image/jpeg", "image/png", "image/webp"].includes(file.type))) {
        return Response.json({ error: "Foto produk harus berformat JPG/PNG/WEBP dan maksimal 3 MB." }, { status: 400 });
    }

    const id = `PRD-${randomBytes(4).toString("hex").toUpperCase()}`;
    let imagePath: string | null = null;

    try {
        if (file) {
            const ext = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() ?? "png" : "png";
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "produk";
            const path = `ekantin/${id}/produk-${slug}.${ext}`;
            const uploaded = await uploadRegistrationDocument(path, file);
            if (uploaded.imageUrl) imageUrl = uploaded.imageUrl;
            if (uploaded.storagePath) imagePath = uploaded.storagePath;
        }

        const variants = variantsRaw
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);

        const record: Record<string, unknown> = {
            id,
            name,
            category: validCategories.includes(category) ? category : "makanan",
            price,
            original_price: originalPriceRaw && Number(originalPriceRaw) > price ? Number(originalPriceRaw) : null,
            rating: 5.0,
            sold: 0,
            stock: Number.isFinite(stock) ? stock : 20,
            seller,
            badge,
            estimate,
            description,
            variants: variants.length ? variants : ["Standar"],
            image_url: imageUrl,
            image_path: imagePath,
            available: stock > 0,
            created_at: new Date().toISOString(),
        };

        await saveEkantinProduct(id, record);
        return Response.json({ product: await formatProductRecord(record) }, { status: 201 });
    } catch (error) {
        console.error("Failed to save E-Kantin product with file:", error);
        if (imagePath) await deleteDocument(imagePath).catch(() => undefined);
        return Response.json({ error: "Gagal menyimpan produk baru ke Firebase." }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    if (!(await hasAdminSession(request))) {
        return Response.json({ error: "Silakan login sebagai Admin untuk mengubah produk." }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";
    let id = "";
    const updates: Record<string, unknown> = {};

    if (contentType.includes("multipart/form-data")) {
        const form = await request.formData();
        id = form.get("id")?.toString().trim() ?? "";
        if (!id) return Response.json({ error: "ID produk tidak valid." }, { status: 400 });

        if (form.has("name")) updates.name = form.get("name")?.toString().trim() ?? "";
        if (form.has("category")) {
            const cat = form.get("category")?.toString().trim() ?? "";
            if (validCategories.includes(cat)) updates.category = cat;
        }
        if (form.has("price")) updates.price = Number(form.get("price") ?? 0);
        if (form.has("original_price")) {
            const orig = form.get("original_price")?.toString().trim() ?? "";
            updates.original_price = orig ? Number(orig) : null;
        }
        if (form.has("stock")) {
            const st = Number(form.get("stock") ?? 0);
            updates.stock = st;
            updates.available = st > 0;
        }
        if (form.has("seller")) updates.seller = form.get("seller")?.toString().trim() ?? "";
        if (form.has("badge")) updates.badge = form.get("badge")?.toString().trim() ?? "";
        if (form.has("estimate")) updates.estimate = form.get("estimate")?.toString().trim() ?? "";
        if (form.has("description")) updates.description = form.get("description")?.toString().trim() ?? "";
        if (form.has("variants")) {
            const v = (form.get("variants")?.toString() ?? "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            updates.variants = v.length ? v : ["Standar"];
        }
        if (form.has("image_url")) {
            const urlVal = form.get("image_url")?.toString().trim() ?? "";
            if (urlVal) updates.image_url = urlVal;
        }

        const fileEntry = form.get("image_file");
        const file = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;
        if (file) {
            if (file.size > maxFileSize || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                return Response.json({ error: "Foto produk harus JPG/PNG/WEBP maksimal 3 MB." }, { status: 400 });
            }
            const ext = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() ?? "png" : "png";
            const path = `ekantin/${id}/produk-${Date.now()}.${ext}`;
            const uploaded = await uploadRegistrationDocument(path, file);
            if (uploaded.imageUrl) updates.image_url = uploaded.imageUrl;
            if (uploaded.storagePath) updates.image_path = uploaded.storagePath;
        }
    } else {
        let body: Record<string, unknown>;
        try {
            body = (await request.json()) as Record<string, unknown>;
        } catch {
            return Response.json({ error: "Format permintaan tidak valid." }, { status: 400 });
        }
        id = String(body.id || "").trim();
        if (!id) return Response.json({ error: "ID produk wajib disertakan." }, { status: 400 });

        for (const key of ["name", "seller", "badge", "estimate", "description", "image_url"] as const) {
            if (typeof body[key] === "string") updates[key] = body[key].trim();
        }
        if (typeof body.category === "string" && validCategories.includes(body.category)) {
            updates.category = body.category;
        }
        if (body.price !== undefined) updates.price = Number(body.price) || 0;
        if (body.original_price !== undefined) updates.original_price = body.original_price ? Number(body.original_price) : null;
        if (body.stock !== undefined) updates.stock = Number(body.stock) || 0;
        if (typeof body.available === "boolean") updates.available = body.available;
        if (Array.isArray(body.variants)) {
            updates.variants = body.variants.map((v) => String(v).trim()).filter(Boolean);
        } else if (typeof body.variants === "string") {
            updates.variants = body.variants
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean);
        }
    }

    if (Object.keys(updates).length === 0) {
        return Response.json({ error: "Tidak ada data produk yang diubah." }, { status: 400 });
    }

    try {
        const existing = await getEkantinProduct(id);
        if (!existing) return Response.json({ error: "Produk tidak ditemukan di Firebase." }, { status: 404 });
        await updateEkantinProduct(id, updates);
        const merged = await formatProductRecord({ ...existing, ...updates });
        return Response.json({ product: merged });
    } catch (error) {
        console.error("Failed to update E-Kantin product:", error);
        return Response.json({ error: "Gagal memperbarui produk di Firebase." }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!(await hasAdminSession(request))) {
        return Response.json({ error: "Silakan login sebagai Admin untuk menghapus produk." }, { status: 401 });
    }
    const id = new URL(request.url).searchParams.get("id")?.trim();
    if (!id) return Response.json({ error: "ID produk tidak valid." }, { status: 400 });

    try {
        const existing = await getEkantinProduct(id);
        if (!existing) return Response.json({ error: "Produk tidak ditemukan." }, { status: 404 });
        if (typeof existing.image_path === "string" && existing.image_path) {
            await deleteDocument(existing.image_path).catch(() => undefined);
        }
        await deleteEkantinProduct(id);
        return Response.json({ deleted: id });
    } catch (error) {
        console.error("Failed to delete E-Kantin product:", error);
        return Response.json({ error: "Gagal menghapus produk dari Firebase." }, { status: 500 });
    }
}
