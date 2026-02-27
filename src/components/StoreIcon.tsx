'use client';

import { getStoreDef } from '@/lib/stores';
import { Store } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StoreIconProps {
    storeName: string;
    size?: 'xs' | 'sm' | 'md';
    className?: string;
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
                    // Si l'image n'existe pas encore, afficher le fallback
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
            style={{ backgroundColor: store?.color ?? '#6b7280', fontSize: size === 'xs' ? '8px' : size === 'sm' ? '10px' : '13px' }}
            title={storeName}
        >
            {storeName.charAt(0).toUpperCase()}
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
            {store?.logo ? (
                <div className="h-7 w-10 flex items-center justify-center">
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
                        style={{ backgroundColor: store?.color ?? '#6b7280' }}
                    >
                        {storeName.charAt(0)}
                    </div>
                </div>
            ) : (
                <div
                    className="h-6 w-6 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: store?.color ?? '#6b7280' }}
                >
                    {storeName.charAt(0)}
                </div>
            )}
            <span>{storeName}</span>
        </div>
    );
}
