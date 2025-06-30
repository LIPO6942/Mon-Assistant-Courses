
'use client';

import type { Ingredient, Recipe, CategoryDef } from '@/lib/types';

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

export const chefSuggestions: Recipe[] = [
  {
    id: 'rec1',
    title: 'Couscous Tunisien',
    description: 'Un plat emblématique et convivial, riche en saveurs et en légumes.',
    country: 'Tunisie',
    ingredients: [
      { name: 'Semoule de couscous', quantity: 500, unit: 'g' },
      { name: 'Agneau', quantity: 750, unit: 'g' },
      { name: 'Carottes', quantity: 4, unit: 'pièce' },
      { name: 'Courgettes', quantity: 4, unit: 'pièce' },
      { name: 'Pois chiches', quantity: 200, unit: 'g' },
      { name: 'Concentré de tomate', quantity: 2, unit: 'cuillère à soupe' },
      { name: 'Harissa', quantity: 1, unit: 'cuillère à café' },
    ],
    preparation: `1. Dans une marmite, faire revenir les morceaux d'agneau avec de l'huile d'olive et l'oignon haché.
2. Ajouter le concentré de tomate, l'harissa, le sel, le poivre et les épices. Laisser mijoter 5 minutes.
3. Couvrir d'eau et porter à ébullition. Ajouter les carottes et laisser cuire 30 minutes.
4. Ajouter les courgettes et les pois chiches. Poursuivre la cuisson 30 minutes.
5. Pendant ce temps, préparer la semoule en suivant les instructions sur le paquet.
6. Servir la semoule dans un grand plat, creuser un puits au centre et y déposer la viande et les légumes. Arroser de sauce.`
  },
  {
    id: 'rec2',
    title: 'Brik à l\'œuf',
    description: 'Une entrée croustillante et savoureuse, parfaite pour commencer le repas.',
    country: 'Tunisie',
    ingredients: [
      { name: 'Feuille de brick', quantity: 8, unit: 'pièce' },
      { name: 'Œuf', quantity: 8, unit: 'pièce' },
      { name: 'Thon à l\'huile', quantity: 200, unit: 'g' },
      { name: 'Câpres', quantity: 2, unit: 'cuillère à soupe' },
      { name: 'Persil', quantity: 1, unit: 'botte' },
    ],
    preparation: `1. Hacher finement le persil. Égoutter le thon.
2. Étaler une feuille de brick. Replier les bords pour former un carré.
3. Garnir le centre avec un peu de thon, de persil et de câpres.
4. Casser un œuf au centre de la garniture.
5. Replier rapidement la feuille de brick en triangle pour enfermer la farce.
6. Plonger délicatement dans une friture chaude et faire dorer des deux côtés. Le jaune d'œuf doit rester coulant.
7. Servir immédiatement avec un quartier de citron.`
  },
  {
    id: 'rec3',
    title: 'Salade Méchouia',
    description: 'Une salade de poivrons et tomates grillés, fraîche et relevée.',
    country: 'Tunisie',
    ingredients: [
      { name: 'Poivrons verts', quantity: 4, unit: 'pièce' },
      { name: 'Tomates', quantity: 4, unit: 'pièce' },
      { name: 'Oignon', quantity: 1, unit: 'pièce' },
      { name: 'Ail', quantity: 3, unit: 'g' },
      { name: 'Huile d\'olive', quantity: 4, unit: 'cuillère à soupe' },
    ],
    preparation: `1. Griller les poivrons, les tomates et l'oignon au four ou sur un barbecue jusqu'à ce que la peau noircisse.
2. Enfermer les légumes dans un sac en plastique pendant 10 minutes pour faciliter l'épluchage.
3. Peler les légumes et les épépiner. Hacher le tout finement au couteau.
4. Ajouter l'ail haché, l'huile d'olive, le sel et le poivre. Bien mélanger.
5. Décorer avec du thon, des œufs durs et des olives. Servir frais.`
  },
  {
    id: 'rec4',
    title: 'Ojja aux Merguez',
    description: 'Un plat rapide, épicé et réconfortant à base d\'œufs et de saucisses.',
    country: 'Tunisie',
    ingredients: [
      { name: 'Merguez', quantity: 6, unit: 'pièce' },
      { name: 'Œuf', quantity: 4, unit: 'pièce' },
      { name: 'Tomates', quantity: 4, unit: 'pièce' },
      { name: 'Poivron vert', quantity: 1, unit: 'pièce' },
      { name: 'Concentré de tomate', quantity: 1, unit: 'cuillère à soupe' },
      { name: 'Harissa', quantity: 1, unit: 'cuillère à café' },
    ],
    preparation: `1. Couper les merguez en rondelles et les faire revenir dans une poêle. Retirer et réserver.
2. Dans la même poêle, faire revenir le poivron coupé en dés.
3. Ajouter les tomates concassées, le concentré de tomate, l'harissa et les épices. Laisser mijoter 15 minutes.
4. Remettre les merguez dans la sauce.
5. Casser les œufs directement dans la poêle, sur la sauce.
6. Couvrir et laisser cuire jusqu'à ce que les blancs d'œufs soient pris et les jaunes encore coulants.
7. Servir chaud avec du pain frais.`
  },
];

export const streetFoodOptions = ['Quesadilla', 'Burrito', 'Fricassé', 'Tacos Mexicain', 'Tacos Maqloub', 'Pizza', 'Chapati', 'Baguette Farcie', 'Poulet prêt à porter'];
