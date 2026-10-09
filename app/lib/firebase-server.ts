import { createHash, createSign } from "node:crypto";
import { firebaseServiceAccount, imgbbApiKey } from "@/app/lib/private-config";

const projectId = "ppdb-smk-bm";
const bucketName = "ppdb-smk-bm.firebasestorage.app";
// firestoreBase → dipakai sebagai URL endpoint HTTP request
const firestoreBase = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
// firestoreDocPath → dipakai sebagai resource name di dalam body request (bukan URL)
// Format: "projects/{project}/databases/{database}/documents" (tanpa https://...)
const firestoreDocPath = `projects/${projectId}/databases/(default)/documents`;
const oauthTokenUrl = "https://oauth2.googleapis.com/token";


type ServiceAccount = { client_email: string; private_key: string; project_id?: string };
type FirestoreValue = { stringValue?: string; integerValue?: string; doubleValue?: number; booleanValue?: boolean; timestampValue?: string; nullValue?: string; mapValue?: { fields?: Record<string, FirestoreValue> }; arrayValue?: { values?: FirestoreValue[] } };

let cachedToken: { value: string; expiresAt: number } | undefined;

function serviceAccount(): ServiceAccount {
    const account = firebaseServiceAccount as ServiceAccount;
    if (!account.client_email || !account.private_key) throw new Error("Firebase service account is incomplete.");
    if (account.project_id !== projectId) throw new Error("Firebase service account project does not match.");
    return { ...account, private_key: account.private_key.replace(/\\n/g, "\n") };
}

async function accessToken() {
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
    const account = serviceAccount();
    const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
    const now = Math.floor(Date.now() / 1000);
    const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ iss: account.client_email, scope: "https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/devstorage.read_write", aud: oauthTokenUrl, iat: now, exp: now + 3600 })}`;
    const signer = createSign("RSA-SHA256");
    signer.update(unsigned);
    const assertion = `${unsigned}.${signer.sign(account.private_key).toString("base64url")}`;
    const response = await fetch(oauthTokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
        cache: "no-store",
    });
    const result = await response.json() as { access_token?: string; expires_in?: number; error?: string; error_description?: string };
    if (!response.ok || !result.access_token) {
        console.error("OAuth token response:", result);
        throw new Error(`Firebase OAuth token request failed (${response.status}): ${result.error_description || result.error || "Unknown"}`);
    }
    cachedToken = { value: result.access_token, expiresAt: Date.now() + (result.expires_in ?? 3600) * 1000 };
    return result.access_token;
}

async function firebaseRequest<T>(url: string, init: RequestInit = {}): Promise<T | null> {
    const token = await accessToken();
    const response = await fetch(url, {
        ...init,
        headers: { Authorization: `Bearer ${token}`, ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
        cache: "no-store",
    });
    if (response.status === 404) return null;
    if (!response.ok) {
        const detail = await response.text();
        console.error("Firebase API request failed", response.status, detail.slice(0, 1000));
        throw new Error(`Firebase API request failed (${response.status}).`);
    }
    if (response.status === 204 || init.method === "DELETE") return null;
    return await response.json() as T;
}

function encodeValue(value: unknown): FirestoreValue {
    if (value === null) return { nullValue: "NULL_VALUE" };
    if (typeof value === "string") return { stringValue: value };
    if (typeof value === "boolean") return { booleanValue: value };
    if (typeof value === "number") return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
    if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeValue) } };
    if (typeof value === "object") return { mapValue: { fields: Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, encodeValue(item)])) } };
    throw new Error("Unsupported Firestore value.");
}

function decodeValue(value: FirestoreValue): unknown {
    if ("stringValue" in value) return value.stringValue;
    if ("integerValue" in value) return Number(value.integerValue);
    if ("doubleValue" in value) return value.doubleValue;
    if ("booleanValue" in value) return value.booleanValue;
    if ("timestampValue" in value) return value.timestampValue;
    if ("nullValue" in value) return null;
    if (value.mapValue) return Object.fromEntries(Object.entries(value.mapValue.fields ?? {}).map(([key, item]) => [key, decodeValue(item)]));
    if (value.arrayValue) return (value.arrayValue.values ?? []).map(decodeValue);
    return null;
}

export function decodeDocument(document: { name: string; fields?: Record<string, FirestoreValue> }) {
    return Object.fromEntries(Object.entries(document.fields ?? {}).map(([key, value]) => [key, decodeValue(value)]));
}

export async function getRegistration(number: string) {
    return firebaseRequest<{ name: string; fields?: Record<string, FirestoreValue> }>(`${firestoreBase}/registrations/${encodeURIComponent(number)}`);
}

export async function createRegistration(number: string, data: Record<string, unknown>) {
    const fields = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, encodeValue(value)]));
    return firebaseRequest(`${firestoreBase}/registrations/${encodeURIComponent(number)}?currentDocument.exists=false`, { method: "PATCH", body: JSON.stringify({ fields }) });
}

export async function createRegistrationWithPublicStatus(number: string, data: Record<string, unknown>) {
    const fields = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, encodeValue(value)]));
    const statusFields = Object.fromEntries(Object.entries({ registration_number: number, name: data.name, status: data.status }).map(([key, value]) => [key, encodeValue(value)]));
    await firebaseRequest(`${firestoreBase}:commit`, {
        method: "POST",
        body: JSON.stringify({
            writes: [
                { update: { name: `${firestoreDocPath}/registrations/${encodeURIComponent(number)}`, fields }, currentDocument: { exists: false } },
                { update: { name: `${firestoreDocPath}/registration_status/${encodeURIComponent(number)}`, fields: statusFields }, currentDocument: { exists: false } },
            ]
        }),
    });
}

export async function updateRegistrationWithPublicStatus(number: string, data: Record<string, unknown>) {
    const fields = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, encodeValue(value)]));
    const statusFields = Object.fromEntries(Object.entries(data).filter(([key]) => key === "status").map(([key, value]) => [key, encodeValue(value)]));
    await firebaseRequest(`${firestoreBase}:commit`, {
        method: "POST",
        body: JSON.stringify({
            writes: [
                { update: { name: `${firestoreDocPath}/registrations/${encodeURIComponent(number)}`, fields }, updateMask: { fieldPaths: Object.keys(fields) } },
                { update: { name: `${firestoreDocPath}/registration_status/${encodeURIComponent(number)}`, fields: statusFields }, updateMask: { fieldPaths: Object.keys(statusFields) } },
            ]
        }),
    });
}

// Public form writes are authorized by Firestore Security Rules, not server IAM.
// The Firebase web API key identifies the project; it is not a secret.
export async function createPublicRegistration(number: string, data: Record<string, unknown>) {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDfdGHGqqxpkeG_Pmbu_lN7kau6W9azdGc";
    const fields = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, encodeValue(value)]));
    const status = { registration_number: number, name: data.name, status: data.status };
    const statusFields = Object.fromEntries(Object.entries(status).map(([key, value]) => [key, encodeValue(value)]));
    const registrationName = `${firestoreDocPath}/registrations/${encodeURIComponent(number)}`;
    const statusName = `${firestoreDocPath}/registration_status/${encodeURIComponent(number)}`;
    const response = await fetch(`${firestoreBase}:commit?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            writes: [
                { update: { name: registrationName, fields }, currentDocument: { exists: false } },
                { update: { name: statusName, fields: statusFields }, currentDocument: { exists: false } },
            ]
        }),
        cache: "no-store",
    });
    if (!response.ok) {
        const detail = await response.text();
        console.error("Public Firestore registration write failed", response.status, detail.slice(0, 1000));
        throw new Error(`Public Firestore registration write failed (${response.status}).`);
    }
}

export async function getPublicRegistrationStatus(number: string) {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDfdGHGqqxpkeG_Pmbu_lN7kau6W9azdGc";
    const response = await fetch(`${firestoreBase}/registration_status/${encodeURIComponent(number)}?key=${encodeURIComponent(apiKey)}`, { cache: "no-store" });
    if (response.status === 404) return null;
    if (!response.ok) {
        const detail = await response.text();
        console.error("Public Firestore status lookup failed", response.status, detail.slice(0, 1000));
        throw new Error(`Public Firestore status lookup failed (${response.status}).`);
    }
    const document = await response.json() as { name: string; fields?: Record<string, FirestoreValue> };
    return decodeDocument(document);
}

export async function updateRegistration(number: string, data: Record<string, unknown>) {
    const fields = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, encodeValue(value)]));
    const query = new URLSearchParams();
    for (const key of Object.keys(fields)) query.append("updateMask.fieldPaths", key);
    return firebaseRequest(`${firestoreBase}/registrations/${encodeURIComponent(number)}?${query}`, { method: "PATCH", body: JSON.stringify({ fields }) });
}

export async function deleteRegistration(number: string) {
    return firebaseRequest(`${firestoreBase}/registrations/${encodeURIComponent(number)}`, { method: "DELETE" });
}

export async function deleteRegistrationWithPublicStatus(number: string) {
    // Hapus kedua dokumen (registrations + registration_status) secara atomik
    await firebaseRequest(`${firestoreBase}:commit`, {
        method: "POST",
        body: JSON.stringify({
            writes: [
                { delete: `${firestoreDocPath}/registrations/${encodeURIComponent(number)}` },
                { delete: `${firestoreDocPath}/registration_status/${encodeURIComponent(number)}` },
            ],
        }),
    });
}

export async function listRegistrations() {
    const data = await firebaseRequest<Array<{ document?: { name: string; fields?: Record<string, FirestoreValue> } }>>(`${firestoreBase}:runQuery`, {
        method: "POST",
        body: JSON.stringify({ structuredQuery: { from: [{ collectionId: "registrations" }], orderBy: [{ field: { fieldPath: "created_at" }, direction: "DESCENDING" }], limit: 1000 } }),
    });
    return (data ?? []).flatMap((row) => row.document ? [decodeDocument(row.document)] : []);
}

export async function uploadDocument(path: string, file: File) {
    const token = await accessToken();
    const metadata = { name: path, contentType: file.type };
    const boundary = `firebase-${crypto.randomUUID()}`;
    const body = Buffer.concat([
        Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${file.type}\r\n\r\n`),
        Buffer.from(await file.arrayBuffer()),
        Buffer.from(`\r\n--${boundary}--`),
    ]);
    const response = await fetch(`https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(bucketName)}/o?uploadType=multipart`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": `multipart/related; boundary=${boundary}` }, body, cache: "no-store",
    });
    if (!response.ok) {
        const detail = await response.text();
        console.error("Firebase Storage upload failed", response.status, detail.slice(0, 1000));
        throw new Error(`Firebase Storage upload failed (${response.status}).`);
    }
}

export async function uploadRegistrationDocument(path: string, file: File) {
    // PDF → Firebase Storage (path disimpan ke Firestore sebagai *_path)
    if (file.type === "application/pdf") {
        await uploadDocument(path, file);
        return { storagePath: path };
    }

    // Gambar (JPG/PNG) → imgbb
    const apiKey = imgbbApiKey;
    const fileName = path.split("/").pop() || "image.png";
    const cleanName = fileName.replace(/\.[^/.]+$/, ""); // nama tanpa ekstensi (contoh: kk-hadi)

    console.log(`[ImgBB] Mengunggah gambar langsung (tanpa base64): name=${cleanName}, size=${file.size}, type=${file.type}`);

    // Mengirim file binary langsung ke FormData (tanpa base64 encoding)
    const form = new FormData();
    form.append("image", file, fileName);
    form.append("name", cleanName);

    let responseText = "";
    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
            method: "POST",
            body: form,
            cache: "no-store",
        });
        responseText = await response.text();
        console.log(`[ImgBB] HTTP status: ${response.status}, body: ${responseText.slice(0, 500)}`);

        const result = JSON.parse(responseText) as {
            success?: boolean;
            data?: {
                url?: string;
                display_url?: string;
                image?: { url?: string };
            };
            error?: { message?: string };
        };

        if (response.ok && result.success && result.data) {
            // Ambil URL utama (result.data.url) agar persis seperti di ImgBB (contoh: https://i.ibb.co.com/xq38XfY7/skl-hadikons.png)
            let imageUrl = result.data.url ?? result.data.image?.url ?? result.data.display_url;
            if (imageUrl) {
                if (imageUrl.startsWith("https://i.ibb.co/")) {
                    imageUrl = imageUrl.replace("https://i.ibb.co/", "https://i.ibb.co.com/");
                }
                console.log(`[ImgBB] Upload berhasil (https://i.ibb.co.com): ${imageUrl}`);
                return { imageUrl };
            }
        }
        console.warn("[ImgBB] Upload tidak berhasil, beralih ke Firebase Storage:", response.status, responseText.slice(0, 300));
    } catch (error) {
        console.warn("[ImgBB] Gagal mengunggah ke ImgBB, beralih ke Firebase Storage:", error);
    }

    // Fallback otomatis ke Firebase Storage jika ImgBB bermasalah / diblokir
    console.log(`[Storage Fallback] Mengunggah file ${path} ke Firebase Storage...`);
    await uploadDocument(path, file);
    return { storagePath: path };
}

export async function deleteDocument(path: string) {
    const token = await accessToken();
    const response = await fetch(`https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucketName)}/o/${encodeURIComponent(path)}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
    });
    if (!response.ok && response.status !== 404) throw new Error(`Firebase Storage delete failed (${response.status}).`);
}

export async function getDocumentDownloadUrl(path: string) {
    const account = serviceAccount();
    const timestamp = new Date().toISOString().replace(/[-:]|\.\d{3}/g, "");
    const date = timestamp.slice(0, 8);
    const scope = `${date}/auto/storage/goog4_request`;
    const host = "storage.googleapis.com";
    const objectPath = `/${bucketName}/${encodeURIComponent(path)}`;
    const query = new URLSearchParams({
        "X-Goog-Algorithm": "GOOG4-RSA-SHA256",
        "X-Goog-Credential": `${account.client_email}/${scope}`,
        "X-Goog-Date": timestamp,
        "X-Goog-Expires": "300",
        "X-Goog-SignedHeaders": "host",
    });
    const canonicalQuery = [...query.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&");
    const canonicalRequest = `GET\n${objectPath}\n${canonicalQuery}\nhost:${host}\n\nhost\nUNSIGNED-PAYLOAD`;
    const hashedRequest = createHash("sha256").update(canonicalRequest).digest("hex");
    const stringToSign = `GOOG4-RSA-SHA256\n${timestamp}\n${scope}\n${hashedRequest}`;
    const signer = createSign("RSA-SHA256");
    signer.update(stringToSign);
    const signature = signer.sign(account.private_key).toString("hex");
    return `https://${host}${objectPath}?${canonicalQuery}&X-Goog-Signature=${signature}`;
}
