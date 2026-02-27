/**
 * Firestore Synchronization Service
 * 
 * Handles reading/writing user data to Firestore so that data
 * is accessible from any device when the user is logged in.
 * 
 * Data structure in Firestore:
 *   users/{uid}/data/pantry       → { items: Ingredient[] }
 *   users/{uid}/data/basket       → { items: BasketItem[] }
 *   users/{uid}/data/categories   → { items: CategoryDef[] }
 *   users/{uid}/data/savedRecipes → { items: Recipe[] }
 *   users/{uid}/data/userRecipes  → { items: UserRecipe[] }
 *   users/{uid}/data/budget       → { initialBudget: number, totalSpent: number }
 *   users/{uid}/data/healthConditions → { items: HealthConditionCategory[] }
 *   users/{uid}/data/purchaseHistory  → { data: PurchaseHistory }
 */

import { doc, getDoc, setDoc, collection, getDocs, query, where, addDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { firestoreDb } from '@/lib/firebase';

// ---------- helpers ----------

function userDocRef(uid: string, docName: string) {
    return doc(firestoreDb, 'users', uid, 'data', docName);
}

// ---------- load ----------

export async function loadUserData(uid: string) {
    try {
        const [
            pantrySnap,
            basketSnap,
            categoriesSnap,
            savedRecipesSnap,
            userRecipesSnap,
            budgetSnap,
            healthConditionsSnap,
            purchaseHistorySnap,
        ] = await Promise.all([
            getDoc(userDocRef(uid, 'pantry')),
            getDoc(userDocRef(uid, 'basket')),
            getDoc(userDocRef(uid, 'categories')),
            getDoc(userDocRef(uid, 'savedRecipes')),
            getDoc(userDocRef(uid, 'userRecipes')),
            getDoc(userDocRef(uid, 'budget')),
            getDoc(userDocRef(uid, 'healthConditions')),
            getDoc(userDocRef(uid, 'purchaseHistory')),
        ]);

        return {
            pantry: pantrySnap.exists() ? pantrySnap.data().items : null,
            basket: basketSnap.exists() ? basketSnap.data().items : null,
            categories: categoriesSnap.exists() ? categoriesSnap.data().items : null,
            savedRecipes: savedRecipesSnap.exists() ? savedRecipesSnap.data().items : null,
            userRecipes: userRecipesSnap.exists() ? userRecipesSnap.data().items : null,
            initialBudget: budgetSnap.exists() ? budgetSnap.data().initialBudget : null,
            totalSpent: budgetSnap.exists() ? budgetSnap.data().totalSpent : null,
            healthConditions: healthConditionsSnap.exists() ? healthConditionsSnap.data().items : null,
            purchaseHistory: purchaseHistorySnap.exists() ? purchaseHistorySnap.data().data : null,
        };
    } catch (error) {
        console.error('Error loading user data from Firestore:', error);
        return null;
    }
}

// ---------- save individual collections ----------

export async function savePantry(uid: string, items: any[]) {
    try {
        await setDoc(userDocRef(uid, 'pantry'), { items, updatedAt: new Date().toISOString() });
    } catch (e) {
        console.error('Error saving pantry:', e);
    }
}

export async function saveBasket(uid: string, items: any[]) {
    try {
        await setDoc(userDocRef(uid, 'basket'), { items, updatedAt: new Date().toISOString() });
    } catch (e) {
        console.error('Error saving basket:', e);
    }
}

export async function saveCategories(uid: string, items: any[]) {
    try {
        await setDoc(userDocRef(uid, 'categories'), { items, updatedAt: new Date().toISOString() });
    } catch (e) {
        console.error('Error saving categories:', e);
    }
}

export async function saveSavedRecipes(uid: string, items: any[]) {
    try {
        await setDoc(userDocRef(uid, 'savedRecipes'), { items, updatedAt: new Date().toISOString() });
    } catch (e) {
        console.error('Error saving saved recipes:', e);
    }
}

export async function saveUserRecipes(uid: string, items: any[]) {
    try {
        await setDoc(userDocRef(uid, 'userRecipes'), { items, updatedAt: new Date().toISOString() });
    } catch (e) {
        console.error('Error saving user recipes:', e);
    }
}

export async function saveBudget(uid: string, initialBudget: number, totalSpent: number) {
    try {
        await setDoc(userDocRef(uid, 'budget'), { initialBudget, totalSpent, updatedAt: new Date().toISOString() });
    } catch (e) {
        console.error('Error saving budget:', e);
    }
}

export async function saveHealthConditions(uid: string, items: any[]) {
    try {
        await setDoc(userDocRef(uid, 'healthConditions'), { items, updatedAt: new Date().toISOString() });
    } catch (e) {
        console.error('Error saving health conditions:', e);
    }
}

export async function savePurchaseHistory(uid: string, data: any) {
    try {
        await setDoc(userDocRef(uid, 'purchaseHistory'), { data, updatedAt: new Date().toISOString() });
    } catch (e) {
        console.error('Error saving purchase history:', e);
    }
}

// ---------- user profiles (global) ----------

export async function syncUserProfile(uid: string, displayName: string, email: string) {
    try {
        await setDoc(doc(firestoreDb, 'users', uid), {
            uid,
            displayName,
            email,
            lastSeen: new Date().toISOString()
        }, { merge: true });
    } catch (e) {
        console.error('Error syncing user profile:', e);
    }
}

export async function getAllUsers() {
    try {
        const snap = await getDocs(collection(firestoreDb, 'users'));
        return snap.docs.map(doc => doc.data());
    } catch (e) {
        console.error('Error getting users:', e);
        return [];
    }
}

// ---------- basket shares ----------

export async function sendBasketShare(fromUid: string, fromName: string, toUid: string, items: any[]) {
    try {
        await addDoc(collection(firestoreDb, 'basket_shares'), {
            fromUid,
            fromName,
            toUid,
            items,
            status: 'pending',
            createdAt: new Date().toISOString()
        });
    } catch (e) {
        console.error('Error sending basket share:', e);
    }
}

export function listenForIncomingShares(uid: string, onShareReceived: (share: any) => void) {
    const q = query(
        collection(firestoreDb, 'basket_shares'),
        where('toUid', '==', uid),
        where('status', '==', 'pending')
    );

    return onSnapshot(q, (snap) => {
        snap.docChanges().forEach((change) => {
            if (change.type === 'added') {
                onShareReceived({ id: change.doc.id, ...change.doc.data() });
            }
        });
    });
}

export async function updateShareStatus(shareId: string, status: 'accepted' | 'refused') {
    try {
        const docRef = doc(firestoreDb, 'basket_shares', shareId);
        await setDoc(docRef, { status }, { merge: true });
        // Optionally delete if refused? Let's keep it for now or delete if accepted
        if (status === 'accepted' || status === 'refused') {
            await deleteDoc(docRef);
        }
    } catch (e) {
        console.error('Error updating share status:', e);
    }
}
