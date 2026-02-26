/**
 * Configuration centralisée des magasins.
 * Pour ajouter une icône réelle, déposez le logo dans /public/stores/
 * et référencez-le dans la propriété `logo` ci-dessous.
 */

export interface StoreDef {
    name: string;
    logo?: string; // chemin relatif depuis /public (ex: '/stores/carrefour.png')
    color?: string; // couleur de fallback si pas de logo
}

export const STORES: StoreDef[] = [
    {
        name: 'Carrefour',
        logo: '/stores/carrefour.png',
        color: '#004A97',
    },
    {
        name: 'Magasin Général',
        logo: '/stores/magasin-general.png',
        color: '#E30613',
    },
    {
        name: 'Aziza',
        logo: '/stores/aziza.png',
        color: '#F5A800',
    },
    {
        name: 'Monoprix',
        logo: '/stores/monoprix.png',
        color: '#8B1A1A',
    },
];

/** Retrouve la définition d'un magasin par son nom */
export function getStoreDef(name?: string): StoreDef | undefined {
    if (!name) return undefined;
    return STORES.find(s => s.name === name);
}
