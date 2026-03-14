'use client';

import { useState, useMemo, useEffect } from 'react';
import { SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlarmClock, Search, CheckSquare, Square, Trash2, Bell, X, Loader2 } from 'lucide-react';
import type { Ingredient, IngredientReminder } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getUserReminders, deleteReminder } from '@/lib/firestore-sync';

interface ReminderSheetProps {
    pantry: Ingredient[];
    userId: string | undefined;
}

const LEAD_TIME_OPTIONS = [
    { label: 'Au moment exact', value: 0 },
    { label: '15 minutes avant', value: 15 },
    { label: '30 minutes avant', value: 30 },
    { label: '1 heure avant', value: 60 },
    { label: '2 heures avant', value: 120 },
];

function formatReminderTime(isoString: string) {
    return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(isoString));
}

export default function ReminderSheet({ pantry, userId }: ReminderSheetProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
    const [purchaseDate, setPurchaseDate] = useState('');
    const [purchaseTime, setPurchaseTime] = useState('');
    const [leadTime, setLeadTime] = useState('30');
    const [isSaving, setIsSaving] = useState(false);
    const [savedMessage, setSavedMessage] = useState('');
    const [reminders, setReminders] = useState<IngredientReminder[]>([]);
    const [isLoadingReminders, setIsLoadingReminders] = useState(false);
    const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');

    // Set default date/time to today + 1 hour
    useEffect(() => {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        const pad = (n: number) => String(n).padStart(2, '0');
        setPurchaseDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
        setPurchaseTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
    }, []);

    // Load reminders when switching to list tab
    useEffect(() => {
        if (activeTab === 'list' && userId) {
            setIsLoadingReminders(true);
            getUserReminders(userId)
                .then(data => setReminders(data as IngredientReminder[]))
                .finally(() => setIsLoadingReminders(false));
        }
    }, [activeTab, userId]);

    const filteredPantry = useMemo(() => {
        if (!searchQuery) return pantry.slice(0, 20);
        const q = searchQuery.toLowerCase();
        return pantry.filter(ing => ing.name.toLowerCase().includes(q));
    }, [pantry, searchQuery]);

    const toggleIngredient = (name: string) => {
        setSelectedIngredients(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    };

    const handleSave = async () => {
        if (!userId) {
            setSavedMessage('❌ Vous devez être connecté pour créer un rappel.');
            return;
        }
        if (selectedIngredients.length === 0) {
            setSavedMessage('❌ Sélectionnez au moins un ingrédient.');
            return;
        }
        if (!purchaseDate || !purchaseTime) {
            setSavedMessage('❌ Veuillez choisir une date et une heure.');
            return;
        }

        setIsSaving(true);
        setSavedMessage('');

        try {
            const purchaseDateTimeISO = new Date(`${purchaseDate}T${purchaseTime}:00`).toISOString();
            const leadTimeMinutes = parseInt(leadTime, 10);

            const response = await fetch('/api/reminders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    ingredientNames: selectedIngredients,
                    purchaseTime: purchaseDateTimeISO,
                    leadTimeMinutes,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erreur inconnue');
            }

            const notifyDate = new Date(result.notifyTime);
            const timeStr = notifyDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            const dateStr = notifyDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

            setSavedMessage(`✅ Rappel programmé ! Vous serez notifié le ${dateStr} à ${timeStr}.`);
            setSelectedIngredients([]);
            setSearchQuery('');

        } catch (err: any) {
            setSavedMessage(`❌ Erreur : ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteReminder = async (reminderId: string) => {
        if (!userId) return;
        try {
            await deleteReminder(userId, reminderId);
            setReminders(prev => prev.filter(r => r.id !== reminderId));
        } catch (err) {
            console.error('Error deleting reminder:', err);
        }
    };

    return (
        <SheetContent side="right" className="flex flex-col w-[95%] sm:max-w-md px-4 sm:px-6">
            <SheetHeader className="pr-8 sm:pr-0">
                <div className="flex items-center gap-2">
                    <AlarmClock className="h-5 w-5 text-primary" />
                    <SheetTitle>Programmer un rappel</SheetTitle>
                </div>
                <SheetDescription className="text-xs sm:text-sm">
                    Recevez une notification avant votre passage en courses.
                </SheetDescription>
            </SheetHeader>

            {/* Tab bar */}
            <div className="flex gap-1 bg-secondary/40 p-1 rounded-2xl mt-3">
                <button
                    onClick={() => setActiveTab('create')}
                    className={cn(
                        'flex-1 text-sm font-medium py-1.5 rounded-xl transition-all',
                        activeTab === 'create'
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    Créer
                </button>
                <button
                    onClick={() => setActiveTab('list')}
                    className={cn(
                        'flex-1 text-sm font-medium py-1.5 rounded-xl transition-all',
                        activeTab === 'list'
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    Mes rappels
                </button>
            </div>

            {activeTab === 'create' && (
                <ScrollArea className="flex-grow my-3 -mr-2 pr-2">
                    <div className="space-y-5">

                        {/* Ingredient search */}
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                                Ingrédients à acheter
                            </label>

                            {/* Selected chips */}
                            {selectedIngredients.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {selectedIngredients.map(name => (
                                        <span
                                            key={name}
                                            className="flex items-center gap-1 text-xs bg-primary/15 text-primary font-medium px-2.5 py-1 rounded-full cursor-pointer hover:bg-primary/25 transition-colors"
                                            onClick={() => toggleIngredient(name)}
                                        >
                                            {name}
                                            <X className="h-3 w-3 opacity-70" />
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="relative mb-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher un ingrédient..."
                                    className="pl-9 rounded-xl h-10 text-sm"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1 max-h-48 overflow-y-auto rounded-xl border border-border/40 p-1">
                                {filteredPantry.length > 0 ? filteredPantry.map(ing => {
                                    const isSelected = selectedIngredients.includes(ing.name);
                                    return (
                                        <button
                                            key={ing.id}
                                            onClick={() => toggleIngredient(ing.name)}
                                            className={cn(
                                                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left',
                                                isSelected
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'hover:bg-secondary/60 text-foreground'
                                            )}
                                        >
                                            {isSelected
                                                ? <CheckSquare className="h-4 w-4 shrink-0 text-primary" />
                                                : <Square className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            }
                                            <span className="truncate">{ing.name}</span>
                                            <span className="ml-auto text-xs text-muted-foreground shrink-0">{ing.category}</span>
                                        </button>
                                    );
                                }) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">Aucun ingrédient trouvé.</p>
                                )}
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                                Quand prévoyez-vous l'achat ?
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Date</label>
                                    <Input
                                        type="date"
                                        className="rounded-xl h-10 text-sm"
                                        value={purchaseDate}
                                        onChange={e => setPurchaseDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Heure</label>
                                    <Input
                                        type="time"
                                        className="rounded-xl h-10 text-sm"
                                        value={purchaseTime}
                                        onChange={e => setPurchaseTime(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Lead time */}
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                                Me rappeler...
                            </label>
                            <Select value={leadTime} onValueChange={setLeadTime}>
                                <SelectTrigger className="rounded-xl h-10 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {LEAD_TIME_OPTIONS.map(opt => (
                                        <SelectItem key={opt.value} value={String(opt.value)}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Save button */}
                        <Button
                            className="w-full h-12 rounded-2xl text-base font-semibold shadow-lg"
                            onClick={handleSave}
                            disabled={isSaving || selectedIngredients.length === 0}
                        >
                            {isSaving
                                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Programmation...</>
                                : <><Bell className="h-4 w-4 mr-2" />
                                    Enregistrer
                                    {selectedIngredients.length > 0 && ` (${selectedIngredients.length} ingrédient${selectedIngredients.length > 1 ? 's' : ''})`}
                                </>
                            }
                        </Button>

                        {/* Feedback message */}
                        {savedMessage && (
                            <div className={cn(
                                'text-sm text-center px-4 py-3 rounded-xl font-medium animate-in fade-in',
                                savedMessage.startsWith('✅') ? 'bg-green-500/10 text-green-700' : 'bg-destructive/10 text-destructive'
                            )}>
                                {savedMessage}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            )}

            {activeTab === 'list' && (
                <ScrollArea className="flex-grow my-3 -mr-2 pr-2">
                    {isLoadingReminders ? (
                        <div className="flex items-center justify-center h-32">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : reminders.length > 0 ? (
                        <ul className="space-y-3">
                            {reminders.map(reminder => (
                                <li key={reminder.id} className="bg-secondary/30 p-4 rounded-3xl border border-border/50">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-grow min-w-0">
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {reminder.ingredientNames.map(name => (
                                                    <span key={name} className="text-xs bg-primary/15 text-primary font-semibold px-2 py-0.5 rounded-full">
                                                        {name}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                <Bell className="h-3 w-3" />
                                                Notification : {formatReminderTime(reminder.notifyTime)}
                                            </p>
                                            <p className="text-xs text-muted-foreground/70 mt-0.5 pl-5">
                                                Achat prévu : {formatReminderTime(reminder.purchaseTime)}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-xl shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDeleteReminder(reminder.id)}
                                            title="Supprimer le rappel"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-center space-y-2">
                            <AlarmClock className="h-10 w-10 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground">Aucun rappel programmé.</p>
                        </div>
                    )}
                </ScrollArea>
            )}
        </SheetContent>
    );
}
