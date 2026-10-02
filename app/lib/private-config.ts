import "server-only";

// Kredensial ini hanya digunakan oleh route handler di server.
// Di Vercel, pastikan Anda menambahkan Environment Variables:
// 1. FIREBASE_SERVICE_ACCOUNT (berisi seluruh teks JSON dari serviceAccountKey)
// 2. IMGBB_API_KEY
export const firebaseServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : {
          project_id: "ppdb-smk-bani-masum-641ce",
          client_email: "firebase-adminsdk-fbsvc@ppdb-smk-bani-masum-641ce.iam.gserviceaccount.com",
          private_key: "",
      };

export const imgbbApiKey = process.env.IMGBB_API_KEY || "";
