import { hasAdminSession } from "@/app/lib/admin-auth";
import {
    createFirebaseAuthUser,
    deleteFirebaseAuthUser,
    deleteFirestoreAdmin,
    listAllAdmins,
    saveFirestoreAdmin,
    updateFirebaseAuthUser,
    updateFirestoreAdmin,
} from "@/app/lib/firebase-server";

export const runtime = "nodejs";

const VALID_ROLES = ["Super Admin", "Administrator", "Petugas Koperasi"] as const;

export async function GET(request: Request) {
    if (!(await hasAdminSession(request))) {
        return Response.json({ error: "Silakan login untuk melihat daftar admin." }, { status: 401 });
    }

    try {
        const admins = await listAllAdmins();
        return Response.json({ admins }, { headers: { "Cache-Control": "private, no-store" } });
    } catch (error) {
        console.error("Gagal memuat daftar admin:", error);
        return Response.json({ error: "Gagal memuat daftar admin." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!(await hasAdminSession(request))) {
        return Response.json({ error: "Silakan login untuk menambahkan admin." }, { status: 401 });
    }

    let body: {
        name?: unknown;
        email?: unknown;
        password?: unknown;
        role?: unknown;
        phone?: unknown;
    };

    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "Format data tidak valid." }, { status: 400 });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role = typeof body.role === "string" && VALID_ROLES.includes(body.role as (typeof VALID_ROLES)[number])
        ? body.role
        : "Administrator";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    if (!name || name.length < 2) {
        return Response.json({ error: "Nama admin minimal 2 karakter." }, { status: 400 });
    }

    if (!email || !email.includes("@") || !email.includes(".")) {
        return Response.json({ error: "Format email admin tidak valid." }, { status: 400 });
    }

    if (!password || password.length < 6) {
        return Response.json({ error: "Password admin minimal 6 karakter." }, { status: 400 });
    }

    try {
        // 1. Buat user di Firebase Authentication
        const authUser = await createFirebaseAuthUser({
            email,
            password,
            displayName: name,
        });

        if (!authUser.localId) {
            throw new Error("UID akun tidak ditemukan dari Firebase Auth.");
        }

        const createdAt = new Date().toISOString();
        const adminData = {
            uid: authUser.localId,
            name,
            email,
            role,
            status: "Aktif",
            phone,
            created_at: createdAt,
        };

        // 2. Simpan profil lengkap di Firestore collection 'admins'
        await saveFirestoreAdmin(authUser.localId, adminData);

        return Response.json(
            {
                success: true,
                message: "Akun admin berhasil dibuat.",
                admin: adminData,
            },
            { status: 201, headers: { "Cache-Control": "private, no-store" } }
        );
    } catch (error) {
        console.error("Gagal membuat admin:", error);
        const rawMessage = error instanceof Error ? error.message : "";
        let friendlyMessage = "Gagal membuat akun admin baru.";

        if (rawMessage.includes("EMAIL_EXISTS")) {
            friendlyMessage = "Email sudah terdaftar untuk akun admin lain.";
        } else if (rawMessage.includes("INVALID_EMAIL")) {
            friendlyMessage = "Alamat email tidak valid.";
        } else if (rawMessage.includes("WEAK_PASSWORD")) {
            friendlyMessage = "Password terlalu lemah, gunakan kombinasi huruf dan angka.";
        }

        return Response.json({ error: friendlyMessage, details: rawMessage }, { status: 400 });
    }
}

export async function PATCH(request: Request) {
    if (!(await hasAdminSession(request))) {
        return Response.json({ error: "Silakan login untuk mengubah data admin." }, { status: 401 });
    }

    let body: {
        uid?: unknown;
        name?: unknown;
        role?: unknown;
        status?: unknown;
        phone?: unknown;
        password?: unknown;
    };

    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "Format data tidak valid." }, { status: 400 });
    }

    const uid = typeof body.uid === "string" ? body.uid.trim() : "";
    if (!uid) {
        return Response.json({ error: "UID admin wajib disertakan." }, { status: 400 });
    }

    try {
        const firestoreUpdates: Record<string, unknown> = {};
        const authUpdates: { displayName?: string; password?: string; disabled?: boolean } = {};

        if (typeof body.name === "string" && body.name.trim().length >= 2) {
            firestoreUpdates.name = body.name.trim();
            authUpdates.displayName = body.name.trim();
        }

        if (typeof body.role === "string" && VALID_ROLES.includes(body.role as (typeof VALID_ROLES)[number])) {
            firestoreUpdates.role = body.role;
        }

        if (typeof body.phone === "string") {
            firestoreUpdates.phone = body.phone.trim();
        }

        if (body.status === "Aktif" || body.status === "Nonaktif") {
            // Safety check: Jangan izinkan menonaktifkan akun Super Admin utama
            if (body.status === "Nonaktif") {
                const currentAdmins = await listAllAdmins();
                const target = currentAdmins.find((a) => a.uid === uid);
                if (target?.email === "smkbm@ppdb.admin") {
                    return Response.json(
                        { error: "Akun Super Admin utama tidak dapat dinonaktifkan." },
                        { status: 403 }
                    );
                }
            }

            firestoreUpdates.status = body.status;
            authUpdates.disabled = body.status === "Nonaktif";
        }

        if (typeof body.password === "string" && body.password.length >= 6) {
            authUpdates.password = body.password;
        }

        // Jalankan update ke Auth dan Firestore secara paralel
        await Promise.all([
            Object.keys(authUpdates).length > 0 ? updateFirebaseAuthUser(uid, authUpdates) : Promise.resolve(),
            Object.keys(firestoreUpdates).length > 0 ? updateFirestoreAdmin(uid, firestoreUpdates) : Promise.resolve(),
        ]);

        return Response.json(
            {
                success: true,
                message: "Data admin berhasil diperbarui.",
            },
            { headers: { "Cache-Control": "private, no-store" } }
        );
    } catch (error) {
        console.error("Gagal memperbarui admin:", error);
        return Response.json({ error: "Gagal memperbarui data admin." }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!(await hasAdminSession(request))) {
        return Response.json({ error: "Silakan login untuk menghapus admin." }, { status: 401 });
    }

    let uid = new URL(request.url).searchParams.get("uid")?.trim();
    if (!uid) {
        try {
            const body = await request.json();
            if (typeof body?.uid === "string") uid = body.uid.trim();
        } catch {
            // ignore JSON parse error
        }
    }

    if (!uid) {
        return Response.json({ error: "UID admin wajib disertakan." }, { status: 400 });
    }

    try {
        const currentAdmins = await listAllAdmins();
        const target = currentAdmins.find((a) => a.uid === uid);

        if (!target) {
            return Response.json({ error: "Akun admin tidak ditemukan." }, { status: 404 });
        }

        // Safety check: Proteksi Super Admin Utama
        if (target.email === "smkbm@ppdb.admin") {
            return Response.json(
                { error: "Akun Super Admin utama terlindungi dan tidak dapat dihapus." },
                { status: 403 }
            );
        }

        // Hapus dari Auth dan Firestore
        await Promise.allSettled([
            deleteFirebaseAuthUser(uid),
            deleteFirestoreAdmin(uid),
        ]);

        return Response.json(
            {
                success: true,
                message: `Akun admin ${target.name} (${target.email}) berhasil dihapus.`,
            },
            { headers: { "Cache-Control": "private, no-store" } }
        );
    } catch (error) {
        console.error("Gagal menghapus admin:", error);
        return Response.json({ error: "Gagal menghapus akun admin." }, { status: 500 });
    }
}
