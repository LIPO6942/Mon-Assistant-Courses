
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import type { SuggestCountryRecipeOutput } from '@/ai/flows/suggest-country-recipe';
import type { SuggestRecipeOutput } from '@/ai/flows/suggest-ingredients';

// Using a hardcoded user ID for simplicity as there is no authentication
const USER_ID = 'devUser';
const RECIPE_COLLECTION = 'favoriteRecipes';

export interface FavoriteRecipe {
    id: string;
    userId: string;
    name: string;
    instructions: string[];
    ingredients: string[];
    source: 'country' | 'pantry';
    createdAt: Date;
    // Country-specific fields
    country?: string;
    theme?: string;
    decorationIdea?: string;
    // Pantry-specific fields
    estimatedCost?: number;
    nutritionalAnalysis?: {
        calories: string;
        protein: string;
        carbs: string;
        fat: string;
    };
}

type RecipeSuggestion = SuggestCountryRecipeOutput | SuggestRecipeOutput;

function isCountryRecipe(recipe: RecipeSuggestion): recipe is SuggestCountryRecipeOutput {
    return 'country' in recipe;
}

export async function saveFavoriteRecipe(recipe: RecipeSuggestion): Promise<void> {
    try {
        const collectionRef = collection(db, RECIPE_COLLECTION);
        
        let newRecipe: Omit<FavoriteRecipe, 'id' | 'createdAt'> & { createdAt: any };

        if (isCountryRecipe(recipe)) {
            newRecipe = {
                userId: USER_ID,
                name: recipe.recipeName,
                instructions: recipe.instructions,
                ingredients: recipe.ingredients,
                source: 'country',
                country: recipe.country,
                theme: recipe.theme,
                decorationIdea: recipe.decorationIdea,
                createdAt: serverTimestamp(),
            };
        } else {
            newRecipe = {
                userId: USER_ID,
                name: recipe.recipeName,
                instructions: recipe.instructions,
                ingredients: [...recipe.usedIngredients, ...recipe.missingIngredients],
                source: 'pantry',
                estimatedCost: recipe.estimatedCost,
                nutritionalAnalysis: recipe.nutritionalAnalysis,
                createdAt: serverTimestamp(),
            };
        }

        await addDoc(collectionRef, newRecipe);

    } catch (error) {
        console.error("Error saving recipe:", error);
        throw error;
    }
}


export async function getFavoriteRecipes(): Promise<FavoriteRecipe[]> {
    try {
        const q = query(
            collection(db, RECIPE_COLLECTION),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const recipes: FavoriteRecipe[] = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            recipes.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt.toDate(),
            } as FavoriteRecipe);
        });
        return recipes;
    } catch (error) {
        console.error("Error getting favorite recipes:", error);
        throw error;
    }
}

export async function deleteFavoriteRecipe(recipeId: string): Promise<void> {
    try {
        const docRef = doc(db, RECIPE_COLLECTION, recipeId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting recipe:", error);
        throw error;
    }
}
