'use client';

import { getStoreDef } from '@/lib/stores';
import { cn } from '@/lib/utils';

interface StoreIconProps {
    storeName: string;
    size?: 'xs' | 'sm' | 'md';
    className?: string;
}

/**
 * Génère des initiales à partir du nom du magasin (ex: "Carrefour Market" -> "CM")
 */
function getInitials(name: string): string {
    const parts = name.split(/[\s-]+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

/**
 * Génère une couleur déterministe à partir d'une chaîne
 */
function getDeterministicColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 45%)`;
}

/**
 * Affiche le logo du magasin s'il existe dans /public/stores/,
 * sinon affiche un fallback coloré avec l'initiale.
 */
export function StoreIcon({ storeName, size = 'sm', className }: StoreIconProps) {
    const store = getStoreDef(storeName);

    const sizeClasses = {
        xs: 'h-4 w-4',
        sm: 'h-5 w-5',
        md: 'h-7 w-7',
    };

    const containerSizeClasses = {
        xs: 'h-4 w-4',
        sm: 'h-5 w-5',
        md: 'h-7 w-7',
    };

    if (store?.logo) {
        return (
            <img
                src={store.logo}
                alt={storeName}
                className={cn('object-contain rounded-sm shrink-0', sizeClasses[size], className)}
                onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                }}
            />
        );
    }

    // Fallback : initiale sur fond coloré
    return (
        <div
            className={cn(
                'rounded-sm shrink-0 flex items-center justify-center text-white font-bold',
                containerSizeClasses[size],
                className
            )}
            style={{
                backgroundColor: store?.color ?? getDeterministicColor(storeName),
                fontSize: size === 'xs' ? '7px' : size === 'sm' ? '9px' : '11px'
            }}
            title={storeName}
        >
            {getInitials(storeName)}
        </div>
    );
}

/**
 * Variante avec logo + nom du magasin en texte, pour les listes de sélection.
 */
export function StoreOption({ storeName }: { storeName: string }) {
    const store = getStoreDef(storeName);

    return (
        <div className="flex items-center gap-2.5">
            <div className="h-7 w-10 flex items-center justify-center">
                {store?.logo ? (
                    <>
                        <img
                            src={store.logo}
                            alt={storeName}
                            className="h-6 w-auto max-w-[40px] object-contain"
                            onError={(e) => {
                                const target = e.currentTarget;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                            }}
                        />
                        <div
                            className="hidden h-6 w-6 rounded items-center justify-center text-white text-[10px] font-bold"
                            style={{ backgroundColor: store?.color ?? getDeterministicColor(storeName) }}
                        >
                            {getInitials(storeName)}
                        </div>
                    </>
                ) : (
                    <div
                        className="h-6 w-6 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                        style={{ backgroundColor: store?.color ?? getDeterministicColor(storeName) }}
                    >
                        {getInitials(storeName)}
                    </div>
                )}
            </div>
            <span className="truncate">{storeName}</span>
        </div>
    );
}
