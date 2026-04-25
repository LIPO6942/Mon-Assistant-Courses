

export const units = ['pièce', 'kg', 'gramme (g)', 'L', 'ml', 'boîte', 'paquet', 'Sachet', 'Bouteille', 'Pot'] as const;

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
  portions?: number;
  ingredients: RecipeIngredient[];
  preparation?: string;
  calories?: number;
  preparationTime?: number; // in minutes
  isEconomical?: boolean;
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
  price?: number;
  store?: string; // magasin où l'achat a été effectué (optionnel)
}

export type PurchaseHistory = Record<string, PurchaseRecord[]>;

export interface DbaratiItem {
  id: string;
  text: string;
  done: boolean;
  prepCount?: number;      // How many times this dish was prepared
  lastPreparedAt?: string; // ISO date string of the most recent preparation
  prepHistory?: string[];  // Full history of all preparation dates (ISO strings)
  type?: 'plat' | 'entree';
  tag?: 'Soupe' | 'Salade' | 'Sauce';
  platTag?: 'Pates' | 'Sauces' | 'Sandwich' | 'Autres';
}

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

export interface CommunityPurchase {
  id: string;
  ingredientName: string;
  normalizedName?: string; // added for name normalization
  price: number;
  unit: string;
  quantity: number;
  store?: string;
  date: string;
  category?: string;
  userId?: string;
}

export interface IngredientReminder {
  id: string;
  userId: string;
  ingredientNames: string[];   // ex: ["Lait", "Œufs"]
  purchaseTime: string;        // ISO string — heure d'achat prévue
  notifyTime: string;          // ISO string — heure de notification (purchaseTime - délai)
  leadTimeMinutes: number;     // ex: 30
  status: 'pending' | 'sent' | 'cancelled';
  createdAt: string;
  qstashMessageId?: string;    // pour référence future (annulation)
}

export interface BasketAbandonmentReminder {
  userId: string;
  itemNames: string[];       // noms des produits au moment du déclenchement
  itemCount: number;         // nb de produits distincts (≥ 6)
  scheduledAt: string;       // ISO — moment où le job a été schedulé
  notifyAt: string;          // ISO — scheduledAt + 7 jours
  status: 'pending' | 'sent' | 'cancelled';
  qstashMessageId?: string;
}
