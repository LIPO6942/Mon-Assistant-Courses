import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Use 'any' to avoid TypeScript errors when db is not initialized.
// The firebaseInitialized flag will be the source of truth.
let db: any;
let persistenceEnabled = false;
let firebaseInitialized = false;

// Check if the essential config is present
if (firebaseConfig.projectId) {
    try {
        // Initialize Firebase
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        db = getFirestore(app);
        firebaseInitialized = true;
    } catch (e) {
        console.log("Could not initialize Firebase. The app will run in a local-only mode.", e);
    }
} else {
    console.log("Firebase project ID is not set. The app will run in a local-only mode.");
}

const enablePersistence = async () => {
  if (typeof window !== 'undefined' && !persistenceEnabled && firebaseInitialized) {
    try {
      await enableIndexedDbPersistence(db);
      persistenceEnabled = true;
    } catch (err: any) {
        if (err.code === 'failed-precondition') {
            console.log("Firestore persistence failed: multiple tabs open.");
        } else if (err.code === 'unimplemented') {
            console.log("Firestore persistence not supported in this browser.");
        } else if (err.code === 'unavailable') {
            console.log("Firestore persistence is unavailable. App will work online (if connected).");
        }
    }
  }
};

// Attempt to enable persistence
enablePersistence();

// Export a flag to check if firebase is initialized
export { db, firebaseInitialized };
