export type GroceryItem = {
  id: number;
  name: string;
  checked: boolean;
  price: number;
  quantity: number;
  unit: string;
  isEssential: boolean;
  icon?: string;
};

export type GroceryLists = Record<string, GroceryItem[]>;
