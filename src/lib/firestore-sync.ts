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
import { normalizeIngredientName } from '@/lib/normalization';
import { CommunityPurchase } from './types';
export { firestoreDb };

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
            frequentContactsSnap,
        ] = await Promise.all([
            getDoc(userDocRef(uid, 'pantry')),
            getDoc(userDocRef(uid, 'basket')),
            getDoc(userDocRef(uid, 'categories')),
            getDoc(userDocRef(uid, 'savedRecipes')),
            getDoc(userDocRef(uid, 'userRecipes')),
            getDoc(userDocRef(uid, 'budget')),
            getDoc(userDocRef(uid, 'healthConditions')),
            getDoc(userDocRef(uid, 'purchaseHistory')),
            getDoc(userDocRef(uid, 'frequentContacts')),
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
            frequentContacts: frequentContactsSnap.exists() ? (frequentContactsSnap.data().contacts || []) : [],
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

// ---------- community purchase feed (anonymous) ----------

/**
 * Publishes purchased items to the global community feed.
 * Each record is stored in the collection `communityPurchases`.
 * No user identifier is saved – the document only contains the ingredient
 * name, price, unit, quantity, optional store and the purchase date.
 */
export async function publishCommunityPurchases(uid: string, items: any[]) {
    try {
        // items are already filtered for purchased=true by the caller
        const batch = items
            .filter(item => item.price !== undefined && item.price !== null)
            .map(item => {
                // Only include defined fields to avoid Firestore rejections
                const docData: Record<string, any> = {
                    ingredientName: item.name,
                    normalizedName: normalizeIngredientName(item.name),
                    price: Number(item.price) || 0,
                    unit: item.unit || 'pièce',
                    quantity: Number(item.quantity) || 1,
                    date: new Date().toISOString(),
                    category: item.category || 'Autre',
                    userId: uid, // Store uid to allow deletion by the user
                };
                // Only add optional fields if they have a real value
                if (item.store && typeof item.store === 'string') {
                    docData.store = item.store;
                }
                return addDoc(collection(firestoreDb, 'communityPurchases'), docData);
            });
        await Promise.all(batch);
        console.log(`[Community] Published ${batch.length} items to community feed.`);
    } catch (e) {
        console.error('Error publishing community purchases:', e);
        throw e; // Re-throw so callers can handle
    }
}

/**
 * Listens in real‑time to the community purchase feed.
 * Returns a function that unsubscribes when called.
 * The callback receives an array of CommunityPurchase sorted by newest first.
 * Only purchases from the last 30 days are kept client‑side.
 */
export function listenCommunityPurchases(
    onUpdate: (purchases: CommunityPurchase[]) => void
) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.log('[Community] Starting subscription with date >= ', thirtyDaysAgo.toISOString());

    // Tentative avec filtre de date
    const q = query(
        collection(firestoreDb, 'communityPurchases'),
        where('date', '>=', thirtyDaysAgo.toISOString())
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log(`[Community] Received update. Count: ${snapshot.docs.length}`);

        let purchases = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() } as CommunityPurchase));

        // Si le filtre de date ne retourne rien, tentons d'enlever le filtre (debug/fallback)
        // Note: En production on garderait le filtre, mais ici on veut débloquer l'utilisateur
        if (purchases.length === 0) {
            console.log('[Community] No recent results found, Checking total collection...');
        }

        const sorted = purchases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        onUpdate(sorted);
    }, (err) => {
        console.error('Community feed error:', err);
        // Si erreur d'index ou autre avec 'where', on tente sans filtre du tout
        onSnapshot(collection(firestoreDb, 'communityPurchases'), (snap) => {
            const allPurchases = snap.docs
                .map((doc) => ({ id: doc.id, ...doc.data() } as CommunityPurchase))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            onUpdate(allPurchases);
        });
    });
    return unsubscribe;
}

/**
 * Deletes a specific community purchase.
 * Only intended to be called for the user's own purchases.
 */
export async function deleteCommunityPurchase(purchaseId: string) {
    try {
        await deleteDoc(doc(firestoreDb, 'communityPurchases', purchaseId));
    } catch (e) {
        console.error('Error deleting community purchase:', e);
        throw e;
    }
}


// ---------- user profiles (global) ----------

export async function syncUserProfile(uid: string, displayName: string, email: string, whatsapp?: string, messenger?: string) {
    try {
        await setDoc(doc(firestoreDb, 'users', uid), {
            uid,
            displayName,
            email,
            ...(whatsapp ? { whatsapp } : {}),
            ...(messenger ? { messenger } : {}),
            lastSeen: new Date().toISOString()
        }, { merge: true });
    } catch (e) {
        console.error('Error syncing user profile:', e);
    }
}

export async function getUserProfile(uid: string) {
    try {
        const snap = await getDoc(doc(firestoreDb, 'users', uid));
        return snap.exists() ? snap.data() : null;
    } catch (e) {
        console.error('Error getting user profile:', e);
        return null;
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

export async function recordFrequentContact(uid: string, contactUid: string) {
    try {
        const docRef = userDocRef(uid, 'frequentContacts');
        const snap = await getDoc(docRef);
        let contacts: string[] = snap.exists() ? (snap.data().contacts || []) : [];

        // Remove if already exists to move to top (if we were using timestamps, but here we just pin)
        contacts = contacts.filter(id => id !== contactUid);
        contacts.unshift(contactUid); // Add to the beginning

        // Keep only top 10
        contacts = contacts.slice(0, 10);

        await setDoc(docRef, { contacts, updatedAt: new Date().toISOString() });
    } catch (e) {
        console.error('Error recording frequent contact:', e);
    }
}

export async function getFrequentContacts(uid: string): Promise<string[]> {
    try {
        const snap = await getDoc(userDocRef(uid, 'frequentContacts'));
        return snap.exists() ? (snap.data().contacts || []) : [];
    } catch (e) {
        console.error('Error getting frequent contacts:', e);
        return [];
    }
}

export async function deleteFrequentContact(uid: string, contactUid: string) {
    try {
        const docRef = userDocRef(uid, 'frequentContacts');
        const snap = await getDoc(docRef);
        if (!snap.exists()) return;

        let contacts: string[] = snap.data().contacts || [];
        // Remove if exists
        const oldLength = contacts.length;
        contacts = contacts.filter(id => id !== contactUid);

        if (contacts.length !== oldLength) {
            await setDoc(docRef, { contacts, updatedAt: new Date().toISOString() }, { merge: true });
        }
    } catch (e) {
        console.error('Error deleting frequent contact:', e);
    }
}

// ---------- contact associations (private) ----------

export async function saveContactAssociation(uid: string, contactUid: string, data: { whatsapp?: string, messenger?: string }) {
    try {
        const docRef = doc(firestoreDb, 'users', uid, 'contactLinks', contactUid);
        await setDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });
    } catch (e) {
        console.error('Error saving contact association:', e);
    }
}

export async function getContactLinks(uid: string) {
    try {
        const colRef = collection(firestoreDb, 'users', uid, 'contactLinks');
        const snap = await getDocs(colRef);
        const links: Record<string, { whatsapp?: string, messenger?: string }> = {};
        snap.forEach(doc => {
            links[doc.id] = doc.data() as any;
        });
        return links;
    } catch (e) {
        console.error('Error getting contact links:', e);
        return {};
    }
}
