'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile,
    GoogleAuthProvider,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { syncUserProfile } from '@/lib/firestore-sync';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
    signOut: () => Promise<void>;
    error: string | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    signInWithEmail: async () => { },
    signUpWithEmail: async () => { },
    signOut: async () => { },
    error: null,
    clearError: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                // Ensure profile is synced on every load/login
                await syncUserProfile(user.uid, user.displayName || user.email?.split('@')[0] || 'Utilisateur', user.email || '');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const clearError = () => setError(null);

    const signInWithGoogle = async () => {
        try {
            setError(null);
            const result = await signInWithPopup(auth, googleProvider);
            if (result.user) {
                await syncUserProfile(result.user.uid, result.user.displayName || 'Utilisateur Google', result.user.email || '');
            }
        } catch (err: any) {
            console.error('Google sign-in error:', err);
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Connexion annulée.');
            } else if (err.code === 'auth/popup-blocked') {
                setError('Le popup a été bloqué. Veuillez autoriser les popups.');
            } else {
                setError('Erreur lors de la connexion avec Google.');
            }
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        try {
            setError(null);
            const result = await signInWithEmailAndPassword(auth, email, password);
            if (result.user) {
                await syncUserProfile(result.user.uid, result.user.displayName || email.split('@')[0], result.user.email || '');
            }
        } catch (err: any) {
            console.error('Email sign-in error:', err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Email ou mot de passe incorrect.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Adresse email invalide.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Trop de tentatives. Veuillez réessayer plus tard.');
            } else {
                setError('Erreur lors de la connexion.');
            }
        }
    };

    const signUpWithEmail = async (email: string, password: string, displayName: string) => {
        try {
            setError(null);
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(result.user, { displayName });
            await syncUserProfile(result.user.uid, displayName, email);
        } catch (err: any) {
            console.error('Email sign-up error:', err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Cette adresse email est déjà utilisée.');
            } else if (err.code === 'auth/weak-password') {
                setError('Le mot de passe doit contenir au moins 6 caractères.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Adresse email invalide.');
            } else {
                setError('Erreur lors de la création du compte.');
            }
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (err: any) {
            console.error('Sign-out error:', err);
            setError('Erreur lors de la déconnexion.');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                signInWithGoogle,
                signInWithEmail,
                signUpWithEmail,
                signOut,
                error,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
