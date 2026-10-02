import { randomBytes } from "node:crypto";
import { createRegistrationWithPublicStatus, decodeDocument, deleteDocument, deleteRegistration, deleteRegistrationWithPublicStatus, getDocumentDownloadUrl, getRegistration, listRegistrations, updateRegistration, updateRegistrationWithPublicStatus, uploadRegistrationDocument } from "@/app/lib/firebase-server";
import { hasAdminSession } from "@/app/lib/admin-auth";

export const runtime = "nodejs";

const statuses = ["Menunggu verifikasi", "Diterima", "Revisi berkas"];
const majors = ["RPL - Teknik Komputer", "TBSM - Teknik Otomotif"];
const documentFields = [["kk", "kk_path"], ["ijazah", "ijazah_path"], ["photo", "photo_path"]] as const;
const maxFileSize = 2 * 1024 * 1024;

export async function GET(request: Request) {
    if (!await hasAdminSession(request)) return Response.json({ error: "Silakan login untuk melihat data pendaftar." }, { status: 401 });
    try {
        const number = new URL(request.url).searchParams.get("number")?.trim().toUpperCase();
        if (number) {
            const document = await getRegistration(number);
            if (!document) return Response.json({ error: "Pendaftar tidak ditemukan." }, { status: 404 });
            const data = decodeDocument(document);
            const documents = await Promise.all([
                ["Kartu Keluarga", data.kk_url, data.kk_path], ["Ijazah / SKL", data.ijazah_url, data.ijazah_path], ["Pas foto", data.photo_url, data.photo_path],
            ].map(async ([name, imageUrl, storagePath]) => ({ name, url: typeof imageUrl === "string" ? imageUrl : typeof storagePath === "string" ? await getDocumentDownloadUrl(storagePath) : null })));
            const registration = Object.fromEntries(["registration_number", "name", "nisn", "birth_date", "phone", "parent_name", "parent_phone", "major", "status", "created_at"].map((key) => [key, data[key]]));
            return Response.json({ registration, documents }, { headers: { "Cache-Control": "private, no-store" } });
        }
        const data = await listRegistrations();
        const registrations = data.map((row) => Object.fromEntries(["registration_number", "name", "nisn", "phone", "parent_name", "parent_phone", "major", "status", "created_at"].map((key) => [key, row[key]])));
        return Response.json({ registrations }, { headers: { "Cache-Control": "private, no-store" } });
    } catch (error) {
        console.error("Failed to load Firebase registrations", error);
        if (error instanceof Error && error.message.includes("FIREBASE_SERVICE_ACCOUNT_")) {
            return Response.json({ error: "Akses data admin gagal membaca konfigurasi service account Firebase. Periksa FIREBASE_SERVICE_ACCOUNT_JSON atau FIREBASE_SERVICE_ACCOUNT_FILE." }, { status: 503 });
        }
        return Response.json({ error: "Data pendaftar belum dapat dimuat." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!await hasAdminSession(request)) return Response.json({ error: "Silakan login untuk menambahkan pendaftar." }, { status: 401 });
    let form: FormData;
    try { form = await request.formData(); } catch { return Response.json({ error: "Format permintaan tidak valid." }, { status: 400 }); }
    const fields = ["name", "nisn", "birth_date", "phone", "parent_name", "parent_phone", "major"] as const;
    const values = Object.fromEntries(fields.map((field) => [field, form.get(field)?.toString().trim() ?? ""]));
    if (fields.some((field) => !values[field])) return Response.json({ error: "Lengkapi semua data wajib pendaftar." }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.birth_date) || Number.isNaN(Date.parse(values.birth_date))) return Response.json({ error: "Tanggal lahir tidak valid." }, { status: 400 });
    if (!majors.includes(values.major)) return Response.json({ error: "Pilihan jurusan tidak valid." }, { status: 400 });
    const files = documentFields.map(([field, pathField]) => {
        const entry = form.get(field);
        const file = entry instanceof File && entry.size > 0 ? entry : null;
        return { field, pathField, file };
    });
    if (files.some(({ file }) => file && (file.size > maxFileSize || !["application/pdf", "image/jpeg", "image/png"].includes(file.type)))) return Response.json({ error: "Dokumen harus PDF/JPG/PNG dan berukuran maksimal 2 MB." }, { status: 400 });

    const number = `BM26-${randomBytes(8).toString("hex").toUpperCase()}`;
    const uploaded: string[] = [];
    let created = false;
    try {
        const record = { registration_number: number, ...values, status: "Menunggu verifikasi", created_at: new Date().toISOString() };
        await createRegistrationWithPublicStatus(number, record);
        created = true;
        const nameSlug = values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "pendaftar";
        const documentPaths: Record<string, string> = {};
        for (const { field, pathField, file } of files) {
            if (!file) continue;
            const ext = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() ?? "png" : "png";
            const prefix = field === "ijazah" ? "skl" : field;
            const fileName = `${prefix}-${nameSlug}.${ext}`; // contoh: skl-namapeserta.png
            const path = `${number}/${fileName}`;
            const result = await uploadRegistrationDocument(path, file);
            if (result.storagePath) {
                uploaded.push(result.storagePath);
                documentPaths[pathField] = result.storagePath;
            }
            const imageField = pathField.replace("_path", "_url");
            if (result.imageUrl) documentPaths[imageField] = result.imageUrl;
        }
        if (Object.keys(documentPaths).length) await updateRegistration(number, documentPaths);
        return Response.json({ registration: record }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
    } catch (error) {
        console.error("Failed to add Firebase registration", error);
        await Promise.allSettled(uploaded.map(deleteDocument));
        if (created) await deleteRegistration(number).catch(() => undefined);
        return Response.json({ error: "Data pendaftar gagal disimpan." }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    if (!await hasAdminSession(request)) return Response.json({ error: "Silakan login untuk mengubah data pendaftar." }, { status: 401 });
    let body: { number?: unknown; status?: unknown };
    try { body = await request.json(); } catch { return Response.json({ error: "Format permintaan tidak valid." }, { status: 400 }); }
    if (typeof body.number !== "string" || !/^BM26-[A-F0-9]{16}$/.test(body.number)
        || typeof body.status !== "string" || !statuses.includes(body.status)) return Response.json({ error: "Nomor atau status pendaftar tidak valid." }, { status: 400 });
    try {
        if (!await getRegistration(body.number)) return Response.json({ error: "Pendaftar tidak ditemukan." }, { status: 404 });
        await updateRegistrationWithPublicStatus(body.number, { status: body.status });
        return Response.json({ registration: { registration_number: body.number, status: body.status } }, { headers: { "Cache-Control": "private, no-store" } });
    } catch (error) {
        console.error("Failed to update Firebase registration", error);
        return Response.json({ error: "Status pendaftar gagal diperbarui." }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!await hasAdminSession(request)) return Response.json({ error: "Silakan login untuk menghapus data pendaftar." }, { status: 401 });
    const number = new URL(request.url).searchParams.get("number")?.trim().toUpperCase();
    if (!number || !/^BM26-[A-F0-9]{16}$/.test(number)) return Response.json({ error: "Nomor pendaftaran tidak valid." }, { status: 400 });
    try {
        const document = await getRegistration(number);
        if (!document) return Response.json({ error: "Pendaftar tidak ditemukan." }, { status: 404 });
        const data = decodeDocument(document);

        // Hapus file dari Firebase Storage (jika ada)
        const storagePaths = ["kk_path", "ijazah_path", "photo_path"]
            .map((field) => data[field])
            .filter((path): path is string => typeof path === "string");
        await Promise.allSettled(storagePaths.map(deleteDocument));

        // Hapus dokumen Firestore (registrations + registration_status) secara atomik
        await deleteRegistrationWithPublicStatus(number);
        return Response.json({ deleted: number }, { headers: { "Cache-Control": "private, no-store" } });
    } catch (error) {
        console.error("Failed to delete Firebase registration", error);
        return Response.json({ error: "Data pendaftar gagal dihapus." }, { status: 500 });
    }
}
