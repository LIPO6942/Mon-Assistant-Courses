
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

export const streetFoodOptions: string[] = [
  'Quésadilla',
  'Burrito',
  'Fricassé',
  'Tacos Mexicain',
  'Tacos',
  'Ma9loub',
  'Pizza',
  'Chapati',
  'Baguette farcie',
  'Lablebi royal',
  'Poulet prêt à porter',
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
  },
  {
    id: 'r6',
    title: 'Moussaka',
    description: 'Un gratin grec généreux avec des aubergines, de la viande hachée et une sauce béchamel onctueuse.',
    country: 'Grèce',
    calories: 750,
    ingredients: [
        { name: 'Aubergines', quantity: 3, unit: 'pièce' },
        { name: 'Viande d\'agneau hachée', quantity: 500, unit: 'g' },
        { name: 'Oignon', quantity: 1, unit: 'pièce' },
        { name: 'Tomates pelées', quantity: 400, unit: 'g' },
        { name: 'Lait', quantity: 500, unit: 'ml' },
        { name: 'Farine', quantity: 50, unit: 'g' },
        { name: 'Beurre', quantity: 50, unit: 'g' },
        { name: 'Fromage râpé', quantity: 100, unit: 'g' },
    ],
    preparation: `1. Coupez les aubergines en tranches, salez-les et laissez-les dégorger. Rincez-les et faites-les frire ou griller.\n2. Faites revenir l'oignon émincé, ajoutez la viande hachée et faites-la dorer. Ajoutez les tomates, salez, poivrez et laissez mijoter.\n3. Préparez une béchamel avec le beurre, la farine et le lait. Ajoutez une partie du fromage.\n4. Dans un plat à gratin, alternez couches d'aubergines et de viande. Terminez par la béchamel et le reste du fromage.\n5. Enfournez à 180°C pendant 45 minutes.`
  },
  {
    id: 'r7',
    title: 'Curry Vert Thaï au Poulet',
    description: 'Un curry thaïlandais crémeux, épicé et plein de saveurs, servi avec du riz jasmin.',
    country: 'Thaïlande',
    calories: 600,
    ingredients: [
        { name: 'Filet de poulet', quantity: 400, unit: 'g' },
        { name: 'Pâte de curry vert', quantity: 2, unit: 'cuillère à soupe' },
        { name: 'Lait de coco', quantity: 400, unit: 'ml' },
        { name: 'Pois gourmands', quantity: 100, unit: 'g' },
        { name: 'Poivron rouge', quantity: 1, unit: 'pièce' },
        { name: 'Feuilles de basilic thaï', quantity: 1, unit: 'botte' },
        { name: 'Sauce poisson (nuoc-mâm)', quantity: 1, unit: 'cuillère à soupe' },
    ],
    preparation: `1. Coupez le poulet en morceaux et le poivron en lanières.\n2. Dans un wok, faites chauffer un peu d'huile, puis ajoutez la pâte de curry vert et faites-la revenir pendant 1 minute.\n3. Ajoutez le poulet et faites-le dorer. Versez le lait de coco et portez à frémissement.\n4. Laissez mijoter 10 minutes. Ajoutez les pois gourmands et le poivron. Poursuivez la cuisson 5 minutes.\n5. Incorporez la sauce poisson et les feuilles de basilic thaï juste avant de servir avec du riz.`
  },
  {
    id: 'r8',
    title: 'Paella Valenciana',
    description: 'Le plat espagnol emblématique, un riz safrané garni de poulet, lapin et légumes verts.',
    country: 'Espagne',
    calories: 850,
    ingredients: [
        { name: 'Riz Bomba', quantity: 400, unit: 'g' },
        { name: 'Poulet en morceaux', quantity: 500, unit: 'g' },
        { name: 'Lapin en morceaux', quantity: 250, unit: 'g' },
        { name: 'Haricots verts plats', quantity: 150, unit: 'g' },
        { name: 'Gros haricots blancs (garrofó)', quantity: 100, unit: 'g' },
        { name: 'Tomate mûre râpée', quantity: 1, unit: 'pièce' },
        { name: 'Safran', quantity: 1, unit: 'pincée' },
        { name: 'Bouillon de poulet', quantity: 1.2, unit: 'L' },
    ],
    preparation: `1. Dans une poêle à paella, faites dorer les viandes dans l'huile d'olive. Poussez-les sur les côtés.\n2. Au centre, faites revenir les haricots verts, puis ajoutez la tomate râpée. Mélangez tout.\n3. Versez le riz et nacrez-le pendant une minute. Ajoutez le safran.\n4. Versez le bouillon de poulet chaud, salez et ajoutez les haricots blancs. Répartissez bien les ingrédients.\n5. Laissez cuire à feu vif pendant 10 minutes, puis à feu doux pendant 8-10 minutes sans jamais remuer. Laissez reposer 5 minutes avant de servir.`
  },
  {
    id: 'r9',
    title: 'Poulet au Beurre (Butter Chicken)',
    description: 'Un plat indien crémeux et légèrement épicé, avec des morceaux de poulet marinés dans une sauce tomate riche.',
    country: 'Inde',
    calories: 680,
    ingredients: [
        { name: 'Filet de poulet', quantity: 500, unit: 'g' },
        { name: 'Yaourt nature', quantity: 150, unit: 'g' },
        { name: 'Garam masala', quantity: 2, unit: 'cuillère à café' },
        { name: 'Purée de tomates', quantity: 400, unit: 'g' },
        { name: 'Crème liquide entière', quantity: 100, unit: 'ml' },
        { name: 'Beurre', quantity: 50, unit: 'g' },
        { name: 'Ail et gingembre', quantity: 1, unit: 'cuillère à soupe' },
    ],
    preparation: `1. Coupez le poulet en cubes. Marinez-le pendant au moins 1 heure dans le yaourt avec du garam masala, de l'ail et du gingembre.\n2. Faites griller le poulet mariné au four ou à la poêle jusqu'à ce qu'il soit cuit.\n3. Dans une casserole, faites fondre le beurre. Ajoutez la purée de tomates, le reste du garam masala, salez et laissez mijoter 10 minutes.\n4. Ajoutez la crème liquide et mélangez bien. Incorporez les morceaux de poulet grillés.\n5. Laissez réchauffer l'ensemble quelques minutes. Servez chaud avec du riz basmati ou du pain naan.`
  }
];
