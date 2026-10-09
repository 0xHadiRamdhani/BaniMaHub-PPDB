import { cookies } from "next/headers";
import {
    adminCookieName,
    adminCookieOptions,
    createAdminSession,
    hasAdminSession,
} from "@/app/lib/admin-auth";

export async function GET() {
    return Response.json({ authenticated: await hasAdminSession() }, { headers: { "Cache-Control": "no-store" } });
}

const attempts = new Map<string, { count: number; resetAt: number }>();
const maxAttempts = 5;
const cooldownMs = 15 * 60 * 1000;

function getClientKey(request: Request) {
    return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function recordFailedAttempt(clientKey: string, attempt: { count: number; resetAt: number } | undefined, now: number) {
    const current = attempt && attempt.resetAt > now ? attempt : { count: 0, resetAt: now + cooldownMs };
    current.count += 1;
    attempts.set(clientKey, current);
}

export async function POST(request: Request) {
    let credentials: { email?: unknown; password?: unknown };
    try {
        credentials = await request.json();
    } catch {
        return Response.json({ error: "Format permintaan tidak valid." }, { status: 400 });
    }

    const clientKey = getClientKey(request);
    const now = Date.now();
    const attempt = attempts.get(clientKey);
    if (attempt && attempt.resetAt > now && attempt.count >= maxAttempts) {
        return Response.json({ error: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." }, { status: 429 });
    }

    const email = typeof credentials.email === "string" ? credentials.email.trim().toLowerCase() : "";
    const password = typeof credentials.password === "string" ? credentials.password : "";
    const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDfdGHGqqxpkeG_Pmbu_lN7kau6W9azdGc";

    try {
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(firebaseApiKey)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, returnSecureToken: true }),
            cache: "no-store",
        });
        if (!response.ok) {
            recordFailedAttempt(clientKey, attempt, now);
            return Response.json({ error: "Email atau password salah." }, { status: 401 });
        }
    } catch {
        return Response.json({ error: "Layanan autentikasi admin sedang tidak tersedia." }, { status: 503 });
    }

    attempts.delete(clientKey);
    const cookieStore = await cookies();
    cookieStore.set(adminCookieName, createAdminSession(), adminCookieOptions());
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.set(adminCookieName, "", adminCookieOptions(0));
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
