import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const adminCookieName = "ppdb_admin_session";
// Session bertahan 365 hari (permanen sampai admin klik Logout)
export const adminSessionLifetime = 365 * 24 * 60 * 60;

const fallbackSessionSecret = "ppdb-smk-bani-masum-admin-session-secret-key-2026";

function signingKey() {
    return process.env.ADMIN_SESSION_SECRET || fallbackSessionSecret;
}

export function createAdminSession() {
    const key = signingKey();
    const payload = `${Date.now() + adminSessionLifetime * 1000}.${randomBytes(16).toString("hex")}`;
    const signature = createHmac("sha256", key).update(payload).digest("base64url");
    return `${payload}.${signature}`;
}

export function isValidAdminSession(token: string | undefined) {
    const key = signingKey();
    if (!key || !token) return false;

    const [expiresAtText, nonce, signature, ...extra] = token.split(".");
    if (!expiresAtText || !nonce || !signature || extra.length) return false;
    const expiresAt = Number(expiresAtText);
    if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now()) return false;

    const payload = `${expiresAtText}.${nonce}`;
    const expected = createHmac("sha256", key).update(payload).digest();
    let provided: Buffer;
    try {
        provided = Buffer.from(signature, "base64url");
    } catch {
        return false;
    }
    return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export async function hasAdminSession(request?: Request) {
    const bearer = request?.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (bearer) {
        try {
            const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDfdGHGqqxpkeG_Pmbu_lN7kau6W9azdGc";
            const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: bearer }),
                cache: "no-store",
            });
            if (!response.ok) return false;
            const result = await response.json() as { users?: Array<{ localId?: string }> };
            return Boolean(result.users?.[0]?.localId);
        } catch {
            return false;
        }
    }
    const cookieStore = await cookies();
    return isValidAdminSession(cookieStore.get(adminCookieName)?.value);
}

export function adminCookieOptions(maxAge = adminSessionLifetime) {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge,
        expires: maxAge > 0 ? new Date(Date.now() + maxAge * 1000) : new Date(0),
    };
}
