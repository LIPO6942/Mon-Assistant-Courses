import { generateShoppingList } from '@/ai/flows/generate-list-flow';
import { suggestRecipe } from '@/ai/flows/suggest-recipe-flow';
import KitchenAssistantPage from '@/components/KitchenAssistantPage';

export default function Home() {
  return (
    <KitchenAssistantPage
      generateShoppingListAction={generateShoppingList}
      suggestRecipeAction={suggestRecipe}
    />
  );
}
