
export const units = ['pièce', 'kg', 'g', 'L', 'ml', 'boîte', 'paquet', 'botte', 'cuillère à soupe', 'cuillère à café'] as const;

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
}

export interface RecipeIngredient {
  name:string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  country: string;
  ingredients: RecipeIngredient[];
  preparation: string;
  calories: number;
}

export interface BasketItem extends Ingredient {
  quantity: number;
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
