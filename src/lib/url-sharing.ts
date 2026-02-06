import LZString from 'lz-string';
import { BasketItem, UserRecipe } from './types';

export const encodeBasket = (basket: BasketItem[]): string => {
    const jsonString = JSON.stringify(basket);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);
    return compressed;
};

export const decodeBasket = (encodedData: string): BasketItem[] | null => {
    try {
        const decompressed = LZString.decompressFromEncodedURIComponent(encodedData);
        if (!decompressed) return null;
        return JSON.parse(decompressed);
    } catch (error) {
        console.error("Failed to decode basket data:", error);
        return null;
    }
};

export const encodeRecipe = (recipe: UserRecipe): string => {
    const jsonString = JSON.stringify(recipe);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);
    return compressed;
};

export const decodeRecipe = (encodedData: string): UserRecipe | null => {
    try {
        const decompressed = LZString.decompressFromEncodedURIComponent(encodedData);
        if (!decompressed) return null;
        return JSON.parse(decompressed);
    } catch (error) {
        console.error("Failed to decode recipe data:", error);
        return null;
    }
};
