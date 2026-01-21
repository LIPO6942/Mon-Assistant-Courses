import {
    collection,
    addDoc,
    updateDoc,
    doc,
    query,
    where,
    getDocs,
    getDoc,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { BasketShareInvitation, BasketItem } from "./types";

const COLLECTION_NAME = "basket_shares";

// Helper to convert Firestore timestamp to ISO string and number
const convertDoc = (doc: any): BasketShareInvitation => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        items: JSON.parse(data.items), // Parse items back from JSON string if stored as string
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        sharedAt: (data.createdAt as Timestamp)?.toMillis() || Date.now()
    } as BasketShareInvitation;
};

export const createShareInvitation = async (
    senderId: string,
    senderName: string,
    recipientEmail: string,
    basketItems: BasketItem[]
): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            senderId,
            senderName,
            recipientEmail: recipientEmail.toLowerCase(), // Normalize email
            items: JSON.stringify(basketItems), // Store as string to avoid nesting issues or map complexities
            status: 'pending',
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating share invitation:", error);
        throw error;
    }
};

export const getPendingInvitations = async (userEmail: string): Promise<BasketShareInvitation[]> => {
    if (!userEmail) return [];
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where("recipientEmail", "==", userEmail.toLowerCase()),
            where("status", "==", "pending")
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                senderId: data.senderId,
                senderName: data.senderName,
                recipientEmail: data.recipientEmail,
                items: JSON.parse(data.items),
                status: data.status,
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
                sharedAt: (data.createdAt as Timestamp)?.toMillis()
            } as BasketShareInvitation
        });
    } catch (error) {
        console.error("Error fetching invitations:", error);
        return [];
    }
};

export const updateInvitationStatus = async (
    invitationId: string,
    status: 'accepted' | 'rejected'
): Promise<void> => {
    try {
        const invitationRef = doc(db, COLLECTION_NAME, invitationId);
        await updateDoc(invitationRef, {
            status
        });
    } catch (error) {
        console.error("Error updating invitation status:", error);
        throw error;
    }
};
