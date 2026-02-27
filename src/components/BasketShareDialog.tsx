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
import { getAllUsers, sendBasketShare } from "@/lib/firestore-sync";
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
    const [isSearching, setIsSearching] = useState(false);
    const [sendSuccess, setSendSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && basket.length > 0) {
            const encoded = encodeBasket(basket);
            const url = `${window.location.origin}/?d=${encoded}`;
            setShareUrl(url);
            setCopied(false);
            setSendSuccess(null);

            // Fetch users for In-App sharing
            setIsSearching(true);
            getAllUsers().then(users => {
                // Filter out current user
                setUsersList(users.filter(u => u.uid !== user?.uid));
                setIsSearching(false);
            });
        }
    }, [isOpen, basket, user]);

    const handleSendDirect = async (recipientUid: string, recipientName: string) => {
        if (!user) return;
        try {
            await sendBasketShare(user.uid, user.displayName || "Un ami", recipientUid, basket);
            setSendSuccess(recipientName);
            setTimeout(() => setSendSuccess(null), 3000);
        } catch (err) {
            console.error("Direct share error:", err);
        }
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
                                                onClick={() => handleSendDirect(u.uid, u.displayName)}
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
