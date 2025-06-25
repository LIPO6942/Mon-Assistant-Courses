
import { db, firebaseInitialized } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { GroceryLists } from '@/app/page';

const LIST_COLLECTION = 'groceryLists';
const LIST_DOC_ID = 'mainList'; // Using a hardcoded ID for simplicity as there is no authentication

export async function getGroceryLists(): Promise<GroceryLists | null> {
    if (!firebaseInitialized) {
        return null;
    }
    try {
        const docRef = doc(db, LIST_COLLECTION, LIST_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as { lists: GroceryLists };
            const lists = data.lists || {};
            // Firestore doesn't store `undefined` so we need to ensure icons are present
            Object.keys(lists).forEach(category => {
                lists[category] = lists[category].map(item => ({
                    ...item,
                    icon: item.icon || 'ShoppingCart'
                }));
            });
            return lists;
        } else {
            return null;
        }
    } catch (error) {
        // Re-throw the original error to preserve its code (e.g., 'unavailable' for offline)
        throw error;
    }
}

export async function updateGroceryLists(lists: GroceryLists): Promise<void> {
    if (!firebaseInitialized) {
        return;
    }
    try {
        const docRef = doc(db, LIST_COLLECTION, LIST_DOC_ID);
        // Using setDoc will create the document if it doesn't exist, or overwrite it.
        await setDoc(docRef, { lists });
    } catch (error) {
        throw error;
    }
}
