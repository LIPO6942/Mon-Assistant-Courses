import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const enablePersistence = async () => {
  if (typeof window !== 'undefined') {
    try {
      await enableIndexedDbPersistence(db);
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        console.warn("Firestore offline persistence failed: multiple tabs open.");
      } else if (err.code === 'unimplemented') {
        console.warn("Firestore offline persistence not supported in this browser.");
      } else if (err.code === 'unavailable') {
        console.warn("Firestore offline persistence is unavailable in this environment (e.g., private browsing).");
      } else {
        console.error("Error enabling Firestore persistence", err);
      }
    }
  }
};

// Attempt to enable persistence
enablePersistence();

export { db };
