"use client";

import { useState } from "react";
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
import { createShareInvitation } from "@/lib/sharing-service";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Send } from "lucide-react";

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
    const { user } = useAuth();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleShare = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || user.isAnonymous) {
            setMessage({ type: 'error', text: "Vous devez être connecté pour partager." });
            return;
        }
        if (basket.length === 0) {
            setMessage({ type: 'error', text: "Votre panier est vide." });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            await createShareInvitation(
                user.uid,
                user.displayName || user.email || "Un ami",
                email,
                basket
            );
            setMessage({ type: 'success', text: "Invitation envoyée avec succès !" });
            setEmail("");
            setTimeout(() => onOpenChange(false), 2000);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: "Erreur lors de l'envoi de l'invitation." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Partager votre panier</DialogTitle>
                    <DialogDescription>
                        Envoyez votre liste de courses à un ami. Il pourra l'ajouter à sa propre liste.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleShare} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="ami@exemple.com"
                            className="col-span-3"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {message && (
                        <div className={`text-sm text-center ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                            {message.text}
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Envoyer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
