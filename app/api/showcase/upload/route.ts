import { uploadMediaImage } from "@/app/lib/firebase-server";
import { hasAdminSession } from "@/app/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
    if (!await hasAdminSession(request)) {
        return Response.json({ error: "Silakan login sebagai admin terlebih dahulu." }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file || !(file instanceof File)) {
            return Response.json({ error: "File foto tidak ditemukan." }, { status: 400 });
        }

        // Validate MIME type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg", "image/avif"];
        if (!allowedTypes.includes(file.type)) {
            return Response.json({ error: "Format file harus berupa gambar (JPG, PNG, WEBP, atau GIF)." }, { status: 400 });
        }

        // Validate Size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return Response.json({ error: "Ukuran file foto maksimal 10 MB." }, { status: 400 });
        }

        const imageUrl = await uploadMediaImage(file);
        return Response.json({ ok: true, imageUrl });
    } catch (error) {
        console.error("Failed to upload image in POST /api/showcase/upload:", error);
        const msg = error instanceof Error ? error.message : "Gagal mengunggah foto.";
        return Response.json({ error: msg }, { status: 500 });
    }
}
