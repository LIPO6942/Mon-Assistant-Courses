"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BasketShareInvitation, BasketItem, Ingredient } from "@/lib/types";
import { getPendingInvitations, updateInvitationStatus } from "@/lib/sharing-service";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Check, X, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InvitationListDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onMergeBasket: (items: BasketItem[]) => void;
}

export function InvitationListDialog({
    isOpen,
    onOpenChange,
    onMergeBasket
}: InvitationListDialogProps) {
    const { user } = useAuth();
    const [invitations, setInvitations] = useState<BasketShareInvitation[]>([]);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && user?.email) {
            loadInvitations();
        }
    }, [isOpen, user]);

    const loadInvitations = async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            const invites = await getPendingInvitations(user.email);
            setInvitations(invites);
        } catch (error) {
            console.error("Failed to load invitations", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (invitation: BasketShareInvitation, action: 'accept' | 'reject') => {
        setProcessingId(invitation.id);
        try {
            await updateInvitationStatus(invitation.id, action);
            if (action === 'accept') {
                onMergeBasket(invitation.items);
            }
            setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
        } catch (error) {
            console.error(`Error ${action}ing invitation:`, error);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Invitations reçues</DialogTitle>
                    <DialogDescription>
                        Gérez les listes de courses partagées avec vous.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : invitations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Aucune invitation en attente.
                    </div>
                ) : (
                    <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-4">
                            {invitations.map((invitation) => (
                                <div key={invitation.id} className="flex flex-col gap-3 p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-semibold">{invitation.senderName}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(invitation.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge variant="secondary">
                                            {invitation.items.length} articles
                                        </Badge>
                                    </div>

                                    <div className="flex gap-2 justify-end mt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAction(invitation, 'reject')}
                                            disabled={!!processingId}
                                        >
                                            {processingId === invitation.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                                            Refuser
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleAction(invitation, 'accept')}
                                            disabled={!!processingId}
                                        >
                                            {processingId === invitation.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                                            Accepter & Fusionner
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
}
