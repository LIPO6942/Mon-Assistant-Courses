import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { GroceryLists } from '@/app/page';

const LIST_COLLECTION = 'groceryLists';
const LIST_DOC_ID = 'mainList'; // Using a hardcoded ID for simplicity as there is no authentication

export async function getGroceryLists(): Promise<GroceryLists | null> {
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
            console.log("Document does not exist, will be created on first update.");
            return null;
        }
    } catch (error) {
        console.error("Error getting document:", error);
        // This can happen if Firebase config is missing/wrong.
        // Let the caller handle the error and fallback.
        throw new Error("Failed to fetch grocery lists from Firestore.");
    }
}

export async function updateGroceryLists(lists: GroceryLists): Promise<void> {
    try {
        const docRef = doc(db, LIST_COLLECTION, LIST_DOC_ID);
        // Using setDoc will create the document if it doesn't exist, or overwrite it.
        await setDoc(docRef, { lists });
    } catch (error) {
        console.error("Error updating document:", error);
        throw new Error("Failed to update grocery lists in Firestore.");
    }
}
