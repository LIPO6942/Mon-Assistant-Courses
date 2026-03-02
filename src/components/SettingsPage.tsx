'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Mail, User, Shield, LogOut, Smartphone, Cloud, ChefHat, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
    const { user, signOut } = useAuth();
    const [lastSharedUser, setLastSharedUser] = useState<{ uid: string, name: string } | null>(null);
    const [whatsapp, setWhatsapp] = useState('');
    const [messenger, setMessenger] = useState('');
    const [frequentContacts, setFrequentContacts] = useState<any[]>([]);
    const [contactLinks, setContactLinks] = useState<Record<string, { whatsapp?: string, messenger?: string }>>({});
    const [savingContact, setSavingContact] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editingContacts, setEditingContacts] = useState<Set<string>>(new Set());

    useEffect(() => {
        const stored = localStorage.getItem('lastSharedUser');
        if (stored) {
            try {
                setLastSharedUser(JSON.parse(stored));
            } catch (e) { }
        }

        if (user) {
            // Load personal profile info from Firestore
            import('@/lib/firestore-sync').then(({ getUserProfile }) => {
                getUserProfile(user.uid).then((data: any) => {
                    if (data) {
                        setWhatsapp(data.whatsapp || '');
                        setMessenger(data.messenger || '');
                        if (!data.whatsapp && !data.messenger) setIsEditingProfile(true);
                    } else {
                        setIsEditingProfile(true);
                    }
                });
            });

            // Load frequent contacts and their private links
            import('@/lib/firestore-sync').then(({ getAllUsers, getFrequentContacts, getContactLinks }) => {
                Promise.all([
                    getAllUsers(),
                    getFrequentContacts(user.uid),
                    getContactLinks(user.uid)
                ]).then(([allUsers, frequentIds, links]) => {
                    const contacts = allUsers.filter((u: any) => frequentIds.includes(u.uid));
                    setFrequentContacts(contacts);
                    setContactLinks(links);
                });
            });
        }
    }, [user]);

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSaving(true);
        const { syncUserProfile } = await import('@/lib/firestore-sync');
        await syncUserProfile(user.uid, user.displayName || '', user.email || '', whatsapp, messenger);
        setIsSaving(false);
        setIsEditingProfile(false);
        alert("Profil mis à jour !");
    };

    const handleSaveContactLink = async (contactUid: string, type: 'whatsapp' | 'messenger', value: string) => {
        if (!user) return;
        const newLinks = { ...contactLinks, [contactUid]: { ...contactLinks[contactUid], [type]: value } };
        setContactLinks(newLinks);
        const { saveContactAssociation } = await import('@/lib/firestore-sync');
        await saveContactAssociation(user.uid, contactUid, newLinks[contactUid]);

        const newEditing = new Set(editingContacts);
        newEditing.delete(contactUid);
        setEditingContacts(newEditing);
    };

    const handleRemoveContact = async (contactUid: string) => {
        if (!user) return;
        if (!confirm("Retirer ce contact de vos fréquents ?")) return;

        const { deleteFrequentContact } = await import('@/lib/firestore-sync');
        await deleteFrequentContact(user.uid, contactUid);
        setFrequentContacts(frequentContacts.filter(c => c.uid !== contactUid));
    };

    const handleClearShortcut = () => {
        localStorage.removeItem('lastSharedUser');
        setLastSharedUser(null);
        window.dispatchEvent(new Event('basketSharedInternally'));
        alert("Raccourci de partage retiré.");
    };

    if (!user) return null;

    const initial = (user.displayName || user.email || '?')[0].toUpperCase();

    return (
        <div className="max-w-lg mx-auto space-y-6 pb-10">
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

            {/* Notifications & Social */}
            <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Mon Profil & Notifications
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        Ces informations permettent à vos amis de vous notifier quand ils vous envoient un panier.
                    </p>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center bg-muted/30 p-2 rounded-xl border border-dashed text-muted-foreground">
                        <span className="text-[10px] font-medium">Mode {isEditingProfile ? 'Modification' : 'Lecture seule'}</span>
                        {!isEditingProfile && (
                            <button onClick={() => setIsEditingProfile(true)} className="p-1 hover:bg-muted rounded-md transition-colors">
                                <Pencil className="h-3 w-3" />
                            </button>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium flex items-center gap-2">
                            <Smartphone className="h-3 w-3 text-green-500" /> WhatsApp (ex: 55555555)
                        </label>
                        <input
                            type="text"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            placeholder="Numéro sans le +"
                            disabled={!isEditingProfile}
                            className={`w-full p-2.5 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${!isEditingProfile ? 'bg-muted/50 text-muted-foreground opacity-70' : ''}`}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium flex items-center gap-2">
                            <Smartphone className="h-3 w-3 text-blue-500" /> Messenger (Nom d'utilisateur)
                        </label>
                        <p className="text-[10px] text-muted-foreground italic -mt-1 ml-5">
                            Messenger {">"} Paramètres {">"} Nom d'utilisateur
                        </p>
                        <input
                            type="text"
                            value={messenger}
                            onChange={(e) => setMessenger(e.target.value)}
                            placeholder="votre.pseudo"
                            disabled={!isEditingProfile}
                            className={`w-full p-2.5 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${!isEditingProfile ? 'bg-muted/50 text-muted-foreground opacity-70' : ''}`}
                        />
                    </div>
                    {isEditingProfile && (
                        <Button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="w-full rounded-xl"
                        >
                            {isSaving ? "Enregistrement..." : "Sauvegarder mon profil"}
                        </Button>
                    )}
                </div>
            </div>

            {/* Mes Contacts (Private Associations) */}
            {frequentContacts.length > 0 && (
                <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Mes Contacts fréquents
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Associez manuellement vos amis à leurs réseaux s'ils ne l'ont pas fait. (Privé pour vous)
                        </p>
                    </div>
                    <div className="divide-y max-h-96 overflow-y-auto">
                        {frequentContacts.map(contact => (
                            <div key={contact.uid} className="p-4 space-y-3 relative group">
                                <button
                                    onClick={() => handleRemoveContact(contact.uid)}
                                    className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                                    title="Retirer des fréquents"
                                >
                                    <LogOut className="h-4 w-4 rotate-180" />
                                </button>

                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                        {contact.displayName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">{contact.displayName}</span>
                                        <span className="text-[10px] text-muted-foreground">{contact.email}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <div className="flex flex-col sm:flex-row gap-2 relative">
                                        {!editingContacts.has(contact.uid) && (contactLinks[contact.uid]?.whatsapp || contactLinks[contact.uid]?.messenger) && (
                                            <button
                                                onClick={() => setEditingContacts(new Set(editingContacts).add(contact.uid))}
                                                className="absolute right-2 top-2 z-10 p-1 hover:bg-primary/10 rounded-md text-primary transition-colors"
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </button>
                                        )}
                                        <input
                                            type="text"
                                            placeholder="WhatsApp"
                                            value={contactLinks[contact.uid]?.whatsapp || ''}
                                            disabled={!editingContacts.has(contact.uid) && !!(contactLinks[contact.uid]?.whatsapp || contactLinks[contact.uid]?.messenger)}
                                            onChange={(e) => setContactLinks({ ...contactLinks, [contact.uid]: { ...contactLinks[contact.uid], whatsapp: e.target.value } })}
                                            className={`w-full text-[11px] p-2 rounded-lg border bg-background outline-none ${(!editingContacts.has(contact.uid) && !!(contactLinks[contact.uid]?.whatsapp || contactLinks[contact.uid]?.messenger)) ? 'bg-muted/50 opacity-70' : ''}`}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Messenger"
                                            value={contactLinks[contact.uid]?.messenger || ''}
                                            disabled={!editingContacts.has(contact.uid) && !!(contactLinks[contact.uid]?.whatsapp || contactLinks[contact.uid]?.messenger)}
                                            onChange={(e) => setContactLinks({ ...contactLinks, [contact.uid]: { ...contactLinks[contact.uid], messenger: e.target.value } })}
                                            className={`w-full text-[11px] p-2 rounded-lg border bg-background outline-none ${(!editingContacts.has(contact.uid) && !!(contactLinks[contact.uid]?.whatsapp || contactLinks[contact.uid]?.messenger)) ? 'bg-muted/50 opacity-70' : ''}`}
                                        />
                                    </div>
                                    {(editingContacts.has(contact.uid) || (!contactLinks[contact.uid]?.whatsapp && !contactLinks[contact.uid]?.messenger)) && (
                                        <Button
                                            size="sm"
                                            className="w-full text-[10px] h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm"
                                            onClick={() => {
                                                setSavingContact(contact.uid);
                                                handleSaveContactLink(contact.uid, 'whatsapp', contactLinks[contact.uid]?.whatsapp || '')
                                                    .then(() => handleSaveContactLink(contact.uid, 'messenger', contactLinks[contact.uid]?.messenger || ''))
                                                    .finally(() => {
                                                        setSavingContact(null);
                                                        // setEditingContacts state update is handled inside handleSaveContactLink (added logic there)
                                                        alert("Coordonnées de " + contact.displayName + " enregistrées !");
                                                    });
                                            }}
                                            disabled={savingContact === contact.uid}
                                        >
                                            {savingContact === contact.uid ? "Enregistrement..." : "Enregistrer les coordonnées"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Account Info */}

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
