"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BasketItem } from "@/lib/types";
import { encodeBasket } from "@/lib/url-sharing";
import { Copy, Share2, Check, Users, Send } from "lucide-react";
import { getAllUsers, sendBasketShare, recordFrequentContact, getFrequentContacts } from "@/lib/firestore-sync";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "./ui/scroll-area";

interface BasketShareDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    basket: BasketItem[];
}

export function BasketShareDialog({
    isOpen,
    onOpenChange,
    basket,
}: BasketShareDialogProps) {
    const [shareUrl, setShareUrl] = useState("");
    const [copied, setCopied] = useState(false);

    const { user } = useAuth();
    const [usersList, setUsersList] = useState<any[]>([]);
    const [contactLinks, setContactLinks] = useState<Record<string, { whatsapp?: string, messenger?: string }>>({});
    const [isSearching, setIsSearching] = useState(false);
    const [sendSuccess, setSendSuccess] = useState<string | null>(null);
    const [notifyingRecipient, setNotifyingRecipient] = useState<any | null>(null);

    useEffect(() => {
        if (isOpen && basket.length > 0 && user) {
            const encoded = encodeBasket(basket);
            const url = `${window.location.origin}/?d=${encoded}`;
            setShareUrl(url);
            setCopied(false);
            setSendSuccess(null);
            setNotifyingRecipient(null);

            // Fetch users for In-App sharing
            setIsSearching(true);
            Promise.all([
                getAllUsers(),
                getFrequentContacts(user.uid),
                // We'll dynamic import getContactLinks to avoid SSR/Initial load issues if any
                import('@/lib/firestore-sync').then(m => m.getContactLinks(user.uid))
            ]).then(([users, frequentIds, links]) => {
                console.log("Membres trouvés en base:", users.length);
                const others = users.filter(u => u.uid !== user?.uid);
                setContactLinks(links);

                // Sort: frequent contacts first
                const sortedOthers = others.sort((a, b) => {
                    const aIdx = frequentIds.indexOf(a.uid);
                    const bIdx = frequentIds.indexOf(b.uid);

                    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                    if (aIdx !== -1) return -1;
                    if (bIdx !== -1) return 1;
                    return 0;
                });

                setUsersList(sortedOthers);
                setIsSearching(false);
            }).catch(err => {
                console.error("Erreur lors de la récupération des membres:", err);
                setIsSearching(false);
            });
        }
    }, [isOpen, basket, user]);

    const handleSendDirect = async (recipient: any) => {
        if (!user) return;
        try {
            await sendBasketShare(user.uid, user.displayName || "Un ami", recipient.uid, basket);
            await recordFrequentContact(user.uid, recipient.uid);
            setSendSuccess(recipient.displayName);
            localStorage.setItem('lastSharedUser', JSON.stringify({ uid: recipient.uid, name: recipient.displayName }));
            window.dispatchEvent(new Event('basketSharedInternally'));

            // Check if we can notify them
            const privateLink = contactLinks[recipient.uid];
            const hasInfo = recipient.whatsapp || recipient.messenger || privateLink?.whatsapp || privateLink?.messenger;

            if (hasInfo) {
                setNotifyingRecipient({
                    ...recipient,
                    whatsapp: privateLink?.whatsapp || recipient.whatsapp,
                    messenger: privateLink?.messenger || recipient.messenger
                });
            } else {
                setTimeout(() => setSendSuccess(null), 3000);
            }
        } catch (err) {
            console.error("Direct share error:", err);
        }
    };

    const handleNotifySocial = (type: 'whatsapp' | 'messenger') => {
        if (!notifyingRecipient) return;

        const val = notifyingRecipient[type];
        if (!val) return;

        let url = "";
        const message = "Coucou ! Je viens de t'envoyer mon panier de courses sur l'app MAC ! Ouvre l'app pour le voir. 🛒";

        if (type === 'whatsapp') {
            url = `https://wa.me/${val.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        } else {
            url = `https://m.me/${val}`;
        }

        window.open(url, '_blank');
        setSendSuccess(null);
        setNotifyingRecipient(null);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Ma liste de courses MAC',
                    text: 'Voici ma liste de courses ! cliques sur le lien pour l\'importer.',
                    url: shareUrl
                });
                onOpenChange(false);
            } catch (err) {
                console.error('Error sharing', err);
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
                <Tabs defaultValue="external" className="w-full">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>Partager votre panier</DialogTitle>
                        <TabsList className="grid w-full grid-cols-2 mt-4">
                            <TabsTrigger value="external" className="gap-2">
                                <Share2 className="h-4 w-4" />
                                Lien externe
                            </TabsTrigger>
                            <TabsTrigger value="internal" className="gap-2">
                                <Users className="h-4 w-4" />
                                Membres MAC
                            </TabsTrigger>
                        </TabsList>
                    </DialogHeader>

                    <TabsContent value="external" className="p-6 pt-2 m-0">
                        <DialogDescription className="mb-4">
                            Partagez ce lien avec vos amis. En l'ouvrant, ils pourront ajouter vos articles à leur liste.
                        </DialogDescription>

                        <div className="flex items-center space-x-2 my-4">
                            <div className="grid flex-1 gap-2">
                                <Label htmlFor="link" className="sr-only">Lien</Label>
                                <Input id="link" value={shareUrl} readOnly className="rounded-xl" />
                            </div>
                            <Button size="sm" className="px-3 rounded-xl" onClick={handleCopy}>
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>

                        <DialogFooter className="sm:justify-between gap-2 mt-6">
                            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Fermer</Button>
                            <Button onClick={handleNativeShare} className="rounded-xl gap-2">
                                <Share2 className="h-4 w-4" />
                                Partager via...
                            </Button>
                        </DialogFooter>
                    </TabsContent>

                    <TabsContent value="internal" className="p-6 pt-2 m-0 bg-secondary/5 dark:bg-zinc-900/10">
                        <DialogDescription className="mb-4">
                            Envoyez directement votre panier à un autre membre inscrit.
                        </DialogDescription>

                        <ScrollArea className="h-60 rounded-xl border bg-background p-2">
                            {isSearching ? (
                                <div className="flex items-center justify-center h-full text-muted-foreground text-sm italic">
                                    Recherche des membres...
                                </div>
                            ) : usersList.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                    Aucun autre membre trouvé.
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {usersList.map((u) => (
                                        <div key={u.uid} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors border border-transparent hover:border-border">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {u.displayName?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold">{u.displayName}</span>
                                                    <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{u.email}</span>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant={sendSuccess === u.displayName ? "outline" : "default"}
                                                className="rounded-full h-8 gap-2"
                                                onClick={() => handleSendDirect(u)}
                                                disabled={!!sendSuccess}
                                            >
                                                {sendSuccess === u.displayName ? (
                                                    <>
                                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                                        Envoyé !
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="h-3.5 w-3.5" />
                                                        Envoyer
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Social Notification Overlay */}
                            {notifyingRecipient && (
                                <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-200">
                                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                                        <Check className="h-6 w-6 text-green-600" />
                                    </div>
                                    <h4 className="font-bold text-lg">Panier envoyé !</h4>
                                    <p className="text-sm text-muted-foreground mt-1 mb-6">
                                        Voulez-vous prévenir <strong>{notifyingRecipient.displayName}</strong> ?
                                    </p>
                                    <div className="flex flex-col w-full gap-2">
                                        {notifyingRecipient.whatsapp && (
                                            <Button
                                                onClick={() => handleNotifySocial('whatsapp')}
                                                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl gap-2 h-11"
                                            >
                                                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.43 5.623 1.43h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                                Notifier via WhatsApp
                                            </Button>
                                        )}
                                        {notifyingRecipient.messenger && (
                                            <Button
                                                onClick={() => handleNotifySocial('messenger')}
                                                variant="secondary"
                                                className="w-full bg-[#00B2FF] hover:bg-[#0099FF] text-white rounded-xl gap-2 h-11"
                                            >
                                                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.304 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.258 14.946l-3.072-3.277-5.983 3.277 6.573-6.975 3.197 3.277 5.858-3.277-6.573 6.975z" /></svg>
                                                Notifier via Messenger
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                setSendSuccess(null);
                                                setNotifyingRecipient(null);
                                            }}
                                            className="w-full rounded-xl mt-2"
                                        >
                                            Plus tard
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </ScrollArea>

                        <DialogFooter className="mt-6">
                            <Button variant="ghost" className="w-full rounded-xl" onClick={() => onOpenChange(false)}>Fermer</Button>
                        </DialogFooter>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
