// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfdGHGqqxpkeG_Pmbu_lN7kau6W9azdGc",
  authDomain: "ppdb-smk-bm.firebaseapp.com",
  projectId: "ppdb-smk-bm",
  storageBucket: "ppdb-smk-bm.firebasestorage.app",
  messagingSenderId: "465093563598",
  appId: "1:465093563598:web:a3444f4627ce1621216c9f",
  measurementId: "G-ZM3DTL1KPX"
};

// Initialize Firebase
// Ensure it only initializes once (useful for Next.js hot reloading)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Analytics (only supported in browser environments)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Export the initialized services
export { app, analytics };
export const db = getFirestore(app);
