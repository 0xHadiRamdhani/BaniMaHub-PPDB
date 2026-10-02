import { randomBytes } from "node:crypto";
import { createPublicRegistration, deleteDocument, getPublicRegistrationStatus, uploadRegistrationDocument } from "@/app/lib/firebase-server";

export const runtime = "nodejs";

const maxFileSize = 2 * 1024 * 1024;
const documentFields = ["kk", "ijazah", "photo"] as const;

function isAllowedFile(file: FormDataEntryValue | null): file is File {
    return file instanceof File && file.size > 0 && file.size <= maxFileSize
        && ["application/pdf", "image/jpeg", "image/png"].includes(file.type);
}

export async function GET(request: Request) {
    const number = new URL(request.url).searchParams.get("number")?.trim().toUpperCase();
    if (!number || !/^BM26-[A-F0-9]{16}$/.test(number)) {
        return Response.json({ error: "Nomor pendaftaran tidak valid." }, { status: 400 });
    }
    try {
        const data = await getPublicRegistrationStatus(number);
        if (!data) return Response.json({ error: "Nomor pendaftaran tidak ditemukan." }, { status: 404 });
        return Response.json({ registration: { number: data.registration_number, name: data.name, status: data.status } }, { headers: { "Cache-Control": "private, no-store" } });
    } catch (error) {
        console.error("Failed to look up registration in Firebase", error);
        return Response.json({ error: "Status pendaftaran belum dapat diperiksa." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    let form: FormData;
    try {
        form = await request.formData();
    } catch {
        return Response.json({ error: "Format permintaan tidak valid." }, { status: 400 });
    }
    const fields = ["name", "nisn", "birth", "phone", "parentName", "parentPhone", "major"] as const;
    const values = Object.fromEntries(fields.map((field) => [field, form.get(field)?.toString().trim() ?? ""]));
    const files = Object.fromEntries(documentFields.map((field) => [field, form.get(field)])) as Record<typeof documentFields[number], FormDataEntryValue | null>;
    if (fields.some((field) => !values[field])) return Response.json({ error: "Lengkapi semua data pendaftaran." }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.birth)) return Response.json({ error: "Tanggal lahir tidak valid." }, { status: 400 });
    if (!/^(RPL - Teknik Komputer|TBSM - Teknik Otomotif)$/.test(values.major)) return Response.json({ error: "Pilihan jurusan tidak valid." }, { status: 400 });
    if (values.name.length > 120 || values.parentName.length > 120) return Response.json({ error: "Nama maksimal 120 karakter." }, { status: 400 });
    if (values.phone.length < 8 || values.phone.length > 20 || values.parentPhone.length < 8 || values.parentPhone.length > 20) return Response.json({ error: "Nomor telepon harus terdiri dari 8 sampai 20 karakter." }, { status: 400 });
    if (documentFields.some((field) => !isAllowedFile(files[field]))) return Response.json({ error: "Setiap dokumen wajib berupa PDF/JPG/PNG maksimal 2 MB." }, { status: 400 });

    const number = `BM26-${randomBytes(8).toString("hex").toUpperCase()}`;
    const paths: string[] = [];
    let stage = "menyimpan data pendaftaran";
    let documentsPending = false;
    const documentPaths: Record<string, string> = {};
    try {
        const record = {
            registration_number: number,
            name: values.name,
            nisn: values.nisn,
            birth_date: values.birth,
            phone: values.phone,
            parent_name: values.parentName,
            parent_phone: values.parentPhone,
            major: values.major,
            status: "Menunggu verifikasi",
            created_at: new Date().toISOString(),
        };
        const nameSlug = values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "pendaftar";
        for (const field of documentFields) {
            const file = files[field];
            if (!(file instanceof File) || file.size === 0) continue; // Lewati jika tidak ada file

            stage = `mengunggah dokumen ${field}`;
            const ext = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() ?? "png" : "png";
            const prefix = field === "ijazah" ? "skl" : field;
            const fileName = `${prefix}-${nameSlug}.${ext}`; // contoh: skl-namapeserta.png
            const path = `${number}/${fileName}`;
            try {
                const uploaded = await uploadRegistrationDocument(path, file);
                if (uploaded.storagePath) {
                    paths.push(uploaded.storagePath);
                    documentPaths[`${field}_path`] = uploaded.storagePath;
                }
                if (uploaded.imageUrl) documentPaths[`${field}_url`] = uploaded.imageUrl;
            } catch (error) {
                documentsPending = true;
                console.error(`Registration document ${field} could not be uploaded`, error);
            }
        }
        stage = "menyimpan data pendaftaran ke Firestore";
        await createPublicRegistration(number, { ...record, ...documentPaths, documents_pending: documentsPending });
        return Response.json({ number, documentsPending }, { status: 201 });
    } catch (error) {
        console.error(`Failed to create Firebase registration while ${stage}`, error);
        await Promise.allSettled(paths.map(deleteDocument));
        const message = error instanceof Error ? error.message : "";
        const firestoreStatus = message.match(/Public Firestore registration write failed \((\d{3})\)/)?.[1];
        if (firestoreStatus === "400") return Response.json({ error: "Format data ditolak Firestore. Periksa firestore.rules yang sudah diterbitkan dan pastikan semua data sesuai format." }, { status: 400 });
        if (firestoreStatus === "401" || firestoreStatus === "403") return Response.json({ error: "Firestore menolak pendaftaran. Pastikan firestore.rules terbaru sudah diterapkan pada proyek Firebase yang benar." }, { status: 503 });
        if (firestoreStatus === "404") return Response.json({ error: "Database Firestore default belum tersedia pada proyek Firebase ini." }, { status: 503 });
        return Response.json({ error: "Data pendaftaran atau dokumen gagal disimpan. Silakan coba lagi." }, { status: 500 });
    }
}
