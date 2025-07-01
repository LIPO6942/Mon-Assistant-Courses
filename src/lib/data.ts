
'use client';

import type { Ingredient, CategoryDef, Recipe } from '@/lib/types';

export const initialCategories: CategoryDef[] = [
  { id: 'c1', name: 'Fruits et Légumes' },
  { id: 'c2', name: 'Viandes et Poissons' },
  { id: 'c3', name: 'Produits Laitiers' },
  { id: 'c4', name: 'Boulangerie' },
  { id: 'c5', name: 'Épicerie' },
  { id: 'c6', name: 'Boissons' },
];

export const predefinedIngredients: Ingredient[] = [
    { id: 'f1', name: 'Pommes', category: 'Fruits et Légumes', price: 2.5, unit: 'kg' },
    { id: 'f3', name: 'Tomates', category: 'Fruits et Légumes', price: 4.0, unit: 'kg' },
    { id: 'v1', name: 'Filet de Poulet', category: 'Viandes et Poissons', price: 12.0, unit: 'kg' },
    { id: 'p1', name: 'Lait Entier', category: 'Produits Laitiers', price: 1.8, unit: 'L' },
    { id: 'b1', name: 'Baguette', category: 'Boulangerie', price: 0.4, unit: 'pièce' },
    { id: 'e1', name: 'Pâtes Penne', category: 'Épicerie', price: 1.5, unit: 'paquet' },
    { id: 'e2', name: 'Huile d\'olive', category: 'Épicerie', price: 15, unit: 'L' },
    { id: 'e3', name: 'Oignon', category: 'Fruits et Légumes', price: 2, unit: 'kg' },
];

export const discoverableRecipes: Recipe[] = [
  {
    id: 'r1',
    title: 'Spaghetti Carbonara',
    description: 'Un plat de pâtes italien classique, crémeux et savoureux, prêt en un rien de temps.',
    country: 'Italie',
    calories: 650,
    ingredients: [
      { name: 'Spaghetti', quantity: 400, unit: 'g' },
      { name: 'Pancetta ou guanciale', quantity: 150, unit: 'g' },
      { name: 'Jaunes d\'œufs', quantity: 4, unit: 'pièce' },
      { name: 'Pecorino Romano râpé', quantity: 50, unit: 'g' },
      { name: 'Poivre noir', quantity: 1, unit: 'cuillère à café' },
    ],
    preparation: `1. Faites cuire les pâtes dans une grande casserole d'eau bouillante salée.\n2. Pendant ce temps, faites dorer la pancetta coupée en lardons dans une poêle.\n3. Dans un bol, mélangez les jaunes d'œufs, le fromage pecorino et beaucoup de poivre noir.\n4. Égouttez les pâtes en réservant un peu d'eau de cuisson. Versez les pâtes dans la poêle avec la pancetta.\n5. Hors du feu, ajoutez le mélange d'œufs et de fromage. Mélangez rapidement. Si c'est trop sec, ajoutez un peu d'eau de cuisson.\n6. Servez immédiatement avec plus de fromage râpé.`,
  },
  {
    id: 'r2',
    title: 'Tajine de poulet aux citrons confits',
    description: 'Un plat marocain parfumé et fondant, sucré-salé, qui fait voyager les papilles.',
    country: 'Maroc',
    calories: 550,
    ingredients: [
      { name: 'Cuisses de poulet', quantity: 4, unit: 'pièce' },
      { name: 'Oignons', quantity: 2, unit: 'pièce' },
      { name: 'Citrons confits', quantity: 2, unit: 'pièce' },
      { name: 'Olives vertes', quantity: 100, unit: 'g' },
      { name: 'Gingembre frais râpé', quantity: 1, unit: 'cuillère à soupe' },
      { name: 'Curcuma', quantity: 1, unit: 'cuillère à café' },
      { name: 'Coriandre fraîche', quantity: 1, unit: 'botte' },
      { name: 'Huile d\'olive', quantity: 2, unit: 'cuillère à soupe' },
    ],
    preparation: `1. Faites dorer les morceaux de poulet dans un tajine ou une cocotte avec l'huile d'olive.\n2. Retirez le poulet et faites revenir les oignons émincés jusqu'à ce qu'ils soient tendres.\n3. Remettez le poulet, ajoutez les épices (gingembre, curcuma), salez, poivrez. Couvrez d'eau à mi-hauteur.\n4. Laissez mijoter à couvert pendant 30 minutes.\n5. Ajoutez les citrons confits coupés en quartiers et les olives. Poursuivez la cuisson 15 minutes.\n6. Parsemez de coriandre fraîche ciselée avant de servir.`,
  },
  {
    id: 'r3',
    title: 'Ramen Tonkotsu',
    description: 'Une soupe de nouilles japonaise riche et réconfortante avec un bouillon de porc crémeux.',
    country: 'Japon',
    calories: 800,
    ingredients: [
      { name: 'Nouilles ramen', quantity: 400, unit: 'g' },
      { name: 'Tranches de porc Chashu', quantity: 8, unit: 'pièce' },
      { name: 'Oeufs mollets marinés (Ajitama)', quantity: 2, unit: 'pièce' },
      { name: 'Pousse de bambou (Menma)', quantity: 50, unit: 'g' },
      { name: 'Ciboule émincée', quantity: 2, unit: 'cuillère à soupe' },
      { name: 'Bouillon Tonkotsu (porc)', quantity: 1, unit: 'L' },
    ],
    preparation: `1. Préparez tous les toppings : coupez les œufs en deux, réchauffez le porc Chashu.\n2. Portez le bouillon Tonkotsu à ébullition.\n3. Faites cuire les nouilles ramen selon les instructions du paquet. Égouttez-les bien.\n4. Répartissez les nouilles dans des grands bols.\n5. Versez délicatement le bouillon chaud sur les nouilles.\n6. Disposez harmonieusement les tranches de porc, l'œuf, les pousses de bambou et la ciboule sur le dessus.\n7. Servez très chaud et dégustez en aspirant bruyamment les nouilles !`,
  },
  {
    id: 'r4',
    title: 'Tacos al Pastor',
    description: 'Le goût de Mexico dans une tortilla, avec du porc mariné, de l\'ananas et une salsa fraîche.',
    country: 'Mexique',
    calories: 450,
    ingredients: [
      { name: 'Filet de porc', quantity: 500, unit: 'g' },
      { name: 'Pâte d\'achiote', quantity: 50, unit: 'g' },
      { name: 'Jus d\'ananas', quantity: 100, unit: 'ml' },
      { name: 'Ananas frais en dés', quantity: 1, unit: 'tasse' },
      { name: 'Oignon rouge émincé', quantity: 1, unit: 'pièce' },
      { name: 'Coriandre fraîche hachée', quantity: 1, unit: 'botte' },
      { name: 'Tortillas de maïs', quantity: 12, unit: 'pièce' },
    ],
    preparation: `1. Coupez le porc en fines tranches. Mélangez la pâte d'achiote avec le jus d'ananas et marinez la viande pendant au moins 2 heures.\n2. Faites cuire le porc dans une poêle chaude jusqu'à ce qu'il soit bien cuit et légèrement caramélisé.\n3. Dans la même poêle, faites griller les dés d'ananas.\n4. Réchauffez les tortillas de maïs.\n5. Garnissez chaque tortilla avec le porc, quelques dés d'ananas grillés, de l'oignon rouge et de la coriandre fraîche.\n6. Servez avec des quartiers de lime et votre salsa préférée.`,
  },
  {
    id: 'r5',
    title: 'Bœuf Bourguignon',
    description: 'Un ragoût de bœuf français emblématique, mijoté lentement dans du vin rouge.',
    country: 'France',
    calories: 700,
    ingredients: [
        { name: 'Bœuf à braiser (paleron, gîte)', quantity: 1, unit: 'kg' },
        { name: 'Vin rouge de Bourgogne', quantity: 750, unit: 'ml' },
        { name: 'Lardons fumés', quantity: 200, unit: 'g' },
        { name: 'Champignons de Paris', quantity: 250, unit: 'g' },
        { name: 'Carottes', quantity: 2, unit: 'pièce' },
        { name: 'Oignon', quantity: 1, unit: 'pièce' },
        { name: 'Bouquet garni', quantity: 1, unit: 'pièce' },
    ],
    preparation: `1. Coupez le bœuf en morceaux. Faites-le mariner dans le vin rouge avec les carottes et l'oignon coupés, et le bouquet garni, pendant 12h.\n2. Égouttez la viande. Faites-la dorer dans une cocotte avec un peu d'huile.\n3. Ajoutez les légumes de la marinade, faites-les revenir. Saupoudrez de farine, mélangez bien.\n4. Versez la marinade filtrée. Complétez avec du bouillon si nécessaire pour couvrir. Laissez mijoter à feu très doux pendant 3 heures.\n5. Faites revenir les lardons et les champignons à part.\n6. Ajoutez-les à la cocotte 30 minutes avant la fin de la cuisson. Servez chaud avec des pommes de terre vapeur.`
  }
];
