

export const units = ['pièce', 'kg', 'g', 'L', 'ml', 'boîte', 'paquet', 'botte', 'cuillère à soupe', 'cuillère à café'] as const;

export const recipeCategories = ['Entrée', 'Plat', 'Dessert', 'Boisson', 'Sauce', 'Accompagnement', 'Autre'] as const;
export type RecipeCategory = typeof recipeCategories[number];

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  country: string;
  portions: number;
  ingredients: RecipeIngredient[];
  preparation: string;
  calories: number;
  preparationTime: number; // in minutes
  isEconomical: boolean;
  searchUrl?: string;
  searchLinks?: { label: string; url: string }[];
}

export interface UserRecipe {
  id: string;
  photoDataUri?: string;
  title: string;
  category: RecipeCategory;
  portions: number;
  ingredients: RecipeIngredient[];
  preparation: string;
  preparationTime: number;
  author?: string;
  tags?: string;
}


export interface BasketItem extends Ingredient {
  quantity: number;
  purchased?: boolean;
}

export interface CategoryDef {
  id: string;
  name: string;
}

export interface HealthCondition {
  id: string;
  name: string;
}

export interface HealthConditionCategory {
  id: string;
  name: string;
  conditions: HealthCondition[];
}

export interface PurchaseRecord {
  date: string;
  quantity: number;
  unit: string;
}

export type PurchaseHistory = Record<string, PurchaseRecord[]>;

export type BasketShareStatus = 'pending' | 'accepted' | 'rejected';

export interface BasketShareInvitation {
  id: string;
  senderId: string;
  senderName: string; // Or email if name is not available
  recipientEmail: string; // Used to filter invitations
  items: BasketItem[];
  status: BasketShareStatus;
  createdAt: string; // ISO string
  sharedAt: number; // Timestamp for sorting
}

export interface ProductAlias {
  id: string;
  rawName: string; // The messy name from Lawra9
  ingredientId: string; // The clean name in MAC
}

export interface Lawra9Product {
  name: string;
  price: number;
  unit: string;
  category: string;
}

export interface Lawra9ImportData {
  source: string;
  date: string;
  products: Lawra9Product[];
}
