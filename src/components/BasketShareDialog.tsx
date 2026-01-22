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
import { Copy, Share2, Check } from "lucide-react";

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

    useEffect(() => {
        if (isOpen && basket.length > 0) {
            const encoded = encodeBasket(basket);
            // Use window.location.origin to get the base URL
            const url = `${window.location.origin}/?d=${encoded}`;
            setShareUrl(url);
            setCopied(false);
        }
    }, [isOpen, basket]);

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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Partager votre panier</DialogTitle>
                    <DialogDescription>
                        Partagez ce lien avec vos amis. En l'ouvrant, ils pourront ajouter vos articles à leur liste.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center space-x-2 my-4">
                    <div className="grid flex-1 gap-2">
                        <Label htmlFor="link" className="sr-only">Lien</Label>
                        <Input id="link" value={shareUrl} readOnly />
                    </div>
                    <Button size="sm" className="px-3" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>

                <DialogFooter className="sm:justify-between">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
                    <Button onClick={handleNativeShare} className="w-full sm:w-auto">
                        <Share2 className="mr-2 h-4 w-4" />
                        Partager via...
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
