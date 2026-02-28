'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Mail, User, Shield, LogOut, Smartphone, Cloud, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
    const { user, signOut } = useAuth();
    const [lastSharedUser, setLastSharedUser] = useState<{ uid: string, name: string } | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('lastSharedUser');
        if (stored) {
            try {
                setLastSharedUser(JSON.parse(stored));
            } catch (e) { }
        }
    }, []);

    const handleClearShortcut = () => {
        localStorage.removeItem('lastSharedUser');
        setLastSharedUser(null);
        window.dispatchEvent(new Event('basketSharedInternally'));
        alert("Raccourci de partage retiré.");
    };

    if (!user) return null;

    const initial = (user.displayName || user.email || '?')[0].toUpperCase();

    return (
        <div className="max-w-lg mx-auto space-y-6">
            {/* Profile Card */}
            <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 relative">
                    <div className="absolute -bottom-10 left-6">
                        {user.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt="Avatar"
                                className="w-20 h-20 rounded-2xl border-4 border-card object-cover shadow-lg"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-2xl border-4 border-card bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                <span className="text-white text-2xl font-bold">{initial}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="pt-14 px-6 pb-6">
                    <h2 className="text-xl font-bold">
                        {user.displayName || 'Utilisateur'}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Membre depuis {user.metadata.creationTime
                            ? new Date(user.metadata.creationTime).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })
                            : 'récemment'}
                    </p>
                </div>
            </div>

            {/* Account Info */}
            <div className="bg-card rounded-2xl border shadow-sm divide-y">
                <div className="px-6 py-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Informations du compte
                    </h3>
                </div>

                <div className="px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Mail className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Adresse email</p>
                        <p className="text-sm font-medium text-muted-foreground truncate select-all cursor-default">
                            {user.email || 'Non renseignée'}
                        </p>
                    </div>
                </div>

                <div className="px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Nom d&apos;affichage</p>
                        <p className="text-sm font-medium truncate">
                            {user.displayName || 'Non défini'}
                        </p>
                    </div>
                </div>

                <div className="px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                        <Shield className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Méthode de connexion</p>
                        <p className="text-sm font-medium">
                            {user.providerData[0]?.providerId === 'google.com'
                                ? '🔗 Google'
                                : '📧 Email / Mot de passe'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Sync Info */}
            <div className="bg-card rounded-2xl border shadow-sm">
                <div className="px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Cloud className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">Synchronisation Cloud</p>
                        <p className="text-xs text-muted-foreground">
                            Vos données sont synchronisées et accessibles sur tous vos appareils.
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-medium text-emerald-600">Actif</span>
                    </div>
                </div>
            </div>

            {/* App Info */}
            <div className="bg-card rounded-2xl border shadow-sm">
                <div className="px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                        <ChefHat className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">Mon Assistant de Courses</p>
                        <p className="text-xs text-muted-foreground">
                            Version 2.0 — avec synchronisation cloud
                        </p>
                    </div>
                </div>
            </div>

            {/* Sign Out */}
            <div className="space-y-4">
                {lastSharedUser && (
                    <Button
                        onClick={handleClearShortcut}
                        variant="outline"
                        className="w-full h-12 rounded-2xl text-muted-foreground hover:bg-muted/50 border-border font-medium gap-2"
                    >
                        Retirer le raccourci de partage pour {lastSharedUser.name}
                    </Button>
                )}

                <Button
                    onClick={signOut}
                    variant="outline"
                    className="w-full h-12 rounded-2xl text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20 font-semibold gap-2"
                >
                    <LogOut className="h-4 w-4" />
                    Se déconnecter
                </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground pb-4">
                UID: <span className="font-mono text-[10px] select-all">{user.uid}</span>
            </p>
        </div>
    );
}
