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

let persistenceEnabled = false;

const enablePersistence = async () => {
  if (typeof window !== 'undefined' && !persistenceEnabled) {
    try {
      await enableIndexedDbPersistence(db);
      persistenceEnabled = true;
    } catch (err: any) {
        if (err.code === 'failed-precondition') {
            console.log("Firestore persistence failed: multiple tabs open.");
        } else if (err.code === 'unimplemented') {
            console.log("Firestore persistence not supported in this browser.");
        } else if (err.code === 'unavailable') {
            console.log("Firestore persistence is unavailable. App will work online.");
        }
    }
  }
};

// Attempt to enable persistence
enablePersistence();

export { db };
