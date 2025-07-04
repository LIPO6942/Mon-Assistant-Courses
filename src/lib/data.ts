
'use client';

import type { Ingredient, CategoryDef, Recipe, HealthConditionCategory } from '@/lib/types';

export const initialCategories: CategoryDef[] = [
  { id: 'c1', name: 'Fruits et Légumes' },
  { id: 'c2', name: 'Viandes et Poissons' },
  { id: 'c3', name: 'Produits Laitiers & Oeufs' },
  { id: 'c4', name: 'Boulangerie & Pâtisserie' },
  { id: 'c5', name: 'Épicerie Salée' },
  { id: 'c6', name: 'Épicerie Sucrée' },
  { id: 'c7', name: 'Boissons' },
  { id: 'c8', name: 'Surgelés' },
];

export const initialHealthConditions: HealthConditionCategory[] = [
  {
    id: 'hc_cat_1',
    name: "Maladies Chroniques",
    conditions: [
      { id: 'hc_1_1', name: "Cholestérol élevé" },
      { id: 'hc_1_2', name: "Hypertension" },
      { id: 'hc_1_3', name: "Diabète type 1" },
      { id: 'hc_1_4', name: "Diabète type 2" },
      { id: 'hc_1_5', name: "Diabète gestationnel" },
    ]
  },
  {
    id: 'hc_cat_2',
    name: "Carences & Sensibilités",
    conditions: [
      { id: 'hc_2_1', name: "Carence en Fer" },
      { id: 'hc_2_2', name: "Carence en Vitamine D" },
      { id: 'hc_2_3', name: "Intolérance au Lactose" },
      { id: 'hc_2_4', name: "Maladie Cœliaque (sans gluten)" },
    ]
  },
  {
    id: 'hc_cat_3',
    name: "Régimes & Objectifs",
    conditions: [
      { id: 'hc_3_1', name: "Végétarien" },
      { id: 'hc_3_2', name: "Végétalien" },
      { id: 'hc_3_3', name: "Perte de poids" },
      { id: 'hc_3_4', name: "Prise de masse musculaire" },
    ]
  }
];

export const predefinedIngredients: Ingredient[] = [
    // Fruits et Légumes
    { id: 'f1', name: 'Pommes', category: 'Fruits et Légumes', price: 2.5, unit: 'kg' },
    { id: 'f3', name: 'Tomates', category: 'Fruits et Légumes', price: 4.0, unit: 'kg' },
    { id: 'e3', name: 'Oignon', category: 'Fruits et Légumes', price: 2, unit: 'kg' },
    { id: 'f4', name: 'Ail', category: 'Fruits et Légumes', price: 8.0, unit: 'kg' },
    { id: 'f5', name: 'Carottes', category: 'Fruits et Légumes', price: 1.5, unit: 'kg' },
    { id: 'f6', name: 'Poivron', category: 'Fruits et Légumes', price: 5.0, unit: 'kg' },
    { id: 'f7', name: 'Laitue', category: 'Fruits et Légumes', price: 1.2, unit: 'pièce' },
    { id: 'f8', name: 'Concombre', category: 'Fruits et Légumes', price: 2.0, unit: 'kg' },
    { id: 'f9', name: 'Courgette', category: 'Fruits et Légumes', price: 3.0, unit: 'kg' },
    { id: 'f10', name: 'Citron', category: 'Fruits et Légumes', price: 0.8, unit: 'pièce' },
    { id: 'f11', name: 'Basilic frais', category: 'Fruits et Légumes', price: 2.5, unit: 'botte' },
    { id: 'f12', name: 'Navet', category: 'Fruits et Légumes', price: 1.8, unit: 'kg' },
    { id: 'f13', name: 'Aubergine', category: 'Fruits et Légumes', price: 4.5, unit: 'kg' },
    { id: 'f14', name: 'Pommes de terre', category: 'Fruits et Légumes', price: 2.2, unit: 'kg' },
    { id: 'f15', name: 'Champignons de Paris', category: 'Fruits et Légumes', price: 12.0, unit: 'kg' },
    { id: 'f16', name: 'Épinards frais', category: 'Fruits et Légumes', price: 6.0, unit: 'kg' },
    { id: 'f17', name: 'Gingembre frais', category: 'Fruits et Légumes', price: 15.0, unit: 'kg' },
    { id: 'f18', name: 'Coriandre fraîche', category: 'Fruits et Légumes', price: 2.0, unit: 'botte' },


    // Viandes et Poissons
    { id: 'v1', name: 'Filet de Poulet', category: 'Viandes et Poissons', price: 12.0, unit: 'kg' },
    { id: 'v2', name: 'Bœuf haché', category: 'Viandes et Poissons', price: 25.0, unit: 'kg' },
    { id: 'v3', name: 'Filet de saumon', category: 'Viandes et Poissons', price: 40.0, unit: 'kg' },
    { id: 'v4', name: 'Thon en conserve', category: 'Viandes et Poissons', price: 3.5, unit: 'boîte' },
    { id: 'v5', name: 'Gigot d\'agneau', category: 'Viandes et Poissons', price: 35.0, unit: 'kg' },
    { id: 'v6', name: 'Crevettes', category: 'Viandes et Poissons', price: 30.0, unit: 'kg' },
    { id: 'v7', name: 'Lardons fumés', category: 'Viandes et Poissons', price: 28.0, unit: 'kg' },


    // Produits Laitiers & Oeufs
    { id: 'p1', name: 'Lait Entier', category: 'Produits Laitiers & Oeufs', price: 1.8, unit: 'L' },
    { id: 'p2', name: 'Oeufs', category: 'Produits Laitiers & Oeufs', price: 4.0, unit: 'douzaine' },
    { id: 'p3', name: 'Yaourt nature', category: 'Produits Laitiers & Oeufs', price: 0.8, unit: 'pièce' },
    { id: 'p4', name: 'Fromage Gruyère', category: 'Produits Laitiers & Oeufs', price: 30.0, unit: 'kg' },
    { id: 'p5', name: 'Mozzarella', category: 'Produits Laitiers & Oeufs', price: 25.0, unit: 'kg' },
    { id: 'p6', name: 'Parmesan', category: 'Produits Laitiers & Oeufs', price: 45.0, unit: 'kg' },
    { id: 'p7', name: 'Beurre', category: 'Produits Laitiers & Oeufs', price: 5.0, unit: '250g' },
    { id: 'p8', name: 'Crème fraîche', category: 'Produits Laitiers & Oeufs', price: 2.5, unit: 'pot' },
    { id: 'p9', name: 'Feta', category: 'Produits Laitiers & Oeufs', price: 15.0, unit: '200g' },

    // Boulangerie & Pâtisserie
    { id: 'b1', name: 'Baguette', category: 'Boulangerie & Pâtisserie', price: 0.4, unit: 'pièce' },
    { id: 'b2', name: 'Pain de mie', category: 'Boulangerie & Pâtisserie', price: 2.5, unit: 'paquet' },
    { id: 'b3', name: 'Pâte à pizza', category: 'Boulangerie & Pâtisserie', price: 3.0, unit: 'pièce' },
    { id: 'b4', name: 'Croûtons', category: 'Boulangerie & Pâtisserie', price: 2.0, unit: 'paquet' },
    { id: 'b5', name: 'Farine', category: 'Boulangerie & Pâtisserie', price: 2.0, unit: 'kg' },
    { id: 'b6', name: 'Sucre', category: 'Boulangerie & Pâtisserie', price: 1.8, unit: 'kg' },
    { id: 'b7', name: 'Levure de boulanger', category: 'Boulangerie & Pâtisserie', price: 1.0, unit: 'sachet' },


    // Épicerie Salée
    { id: 'e1', name: 'Pâtes Penne', category: 'Épicerie Salée', price: 1.5, unit: 'paquet' },
    { id: 'e2', name: 'Huile d\'olive', category: 'Épicerie Salée', price: 15, unit: 'L' },
    { id: 'e4', name: 'Riz basmati', category: 'Épicerie Salée', price: 5.0, unit: 'kg' },
    { id: 'e7', name: 'Sel', category: 'Épicerie Salée', price: 1.0, unit: 'paquet' },
    { id: 'e8', name: 'Poivre noir', category: 'Épicerie Salée', price: 4.0, unit: 'pot' },
    { id: 'e9', name: 'Haricots rouges en conserve', category: 'Épicerie Salée', price: 2.5, unit: 'boîte' },
    { id: 'e10', name: 'Semoule de couscous', category: 'Épicerie Salée', price: 3.5, unit: 'kg' },
    { id: 'e11', name: 'Cumin en poudre', category: 'Épicerie Salée', price: 3.0, unit: 'pot' },
    { id: 'e12', name: 'Piment en poudre (Paprika)', category: 'Épicerie Salée', price: 2.8, unit: 'pot' },
    { id: 'e13', name: 'Vinaigre de vin', category: 'Épicerie Salée', price: 4.0, unit: 'L' },
    { id: 'e14', name: 'Harissa en conserve', category: 'Épicerie Salée', price: 2.2, unit: 'boîte' },
    { id: 'e15', name: 'Pois chiches en conserve', category: 'Épicerie Salée', price: 2.0, unit: 'boîte' },
    { id: 'e16', name: 'Concentré de tomate', category: 'Épicerie Salée', price: 1.8, unit: 'boîte' },
    { id: 'e17', name: 'Moutarde de Dijon', category: 'Épicerie Salée', price: 3.5, unit: 'pot' },
    { id: 'e18', name: 'Lentilles corail', category: 'Épicerie Salée', price: 6.0, unit: 'kg' },
    { id: 'e19', name: 'Lait de coco', category: 'Épicerie Salée', price: 4.5, unit: 'boîte' },
    { id: 'e20', name: 'Sauce soja', category: 'Épicerie Salée', price: 5.0, unit: 'bouteille' },
    { id: 'e21', name: 'Bouillon de volaille', category: 'Épicerie Salée', price: 2.0, unit: 'cube' },
    { id: 'e22', name: 'Curcuma', category: 'Épicerie Salée', price: 3.0, unit: 'pot' },
    
    // Épicerie Sucrée
    { id: 'es1', name: 'Chocolat noir pâtissier', category: 'Épicerie Sucrée', price: 5.0, unit: 'tablette' },
    { id: 'es2', name: 'Miel', category: 'Épicerie Sucrée', price: 12.0, unit: 'pot' },
    { id: 'es3', name: 'Confiture de fraises', category: 'Épicerie Sucrée', price: 4.0, unit: 'pot' },
    { id: 'es4', name: 'Cacao en poudre', category: 'Épicerie Sucrée', price: 6.0, unit: 'boîte' },

    // Boissons
    { id: 'bo1', name: 'Eau minérale', category: 'Boissons', price: 0.8, unit: 'L' },
    { id: 'bo2', name: 'Café moulu', category: 'Boissons', price: 7.0, unit: 'paquet' },
    { id: 'bo3', name: 'Thé vert', category: 'Boissons', price: 3.0, unit: 'boîte' },
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
        { name: 'Aubergine', quantity: 3, unit: 'pièce' },
        { name: 'Bœuf haché', quantity: 500, unit: 'g' },
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
        { name: 'Poivron', quantity: 1, unit: 'pièce' },
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
  },
  {
    id: 'r10',
    title: 'Pad Thaï',
    description: 'Le plat de nouilles sautées le plus célèbre de Thaïlande, un mélange parfait de sucré, salé et acide.',
    country: 'Thaïlande',
    calories: 700,
    ingredients: [
        { name: 'Nouilles de riz plates', quantity: 200, unit: 'g' },
        { name: 'Crevettes ou poulet', quantity: 200, unit: 'g' },
        { name: 'Tofu ferme', quantity: 100, unit: 'g' },
        { name: 'Pousses de soja', quantity: 1, unit: 'tasse' },
        { name: 'Cacahuètes grillées', quantity: 4, unit: 'cuillère à soupe' },
        { name: 'Sauce de poisson', quantity: 3, unit: 'cuillère à soupe' },
        { name: 'Pâte de tamarin', quantity: 2, unit: 'cuillère à soupe' },
        { name: 'Sucre de palme', quantity: 2, unit: 'cuillère à soupe' },
    ],
    preparation: `1. Faites tremper les nouilles de riz dans l'eau tiède. Préparez la sauce en mélangeant sauce de poisson, pâte de tamarin et sucre.\n2. Dans un wok, faites sauter le tofu, puis les crevettes ou le poulet. Ajoutez les nouilles égouttées et la sauce.\n3. Remuez constamment jusqu'à ce que les nouilles soient tendres. Poussez sur un côté et cassez un œuf sur l'autre côté. Brouillez-le, puis mélangez tout.\n4. Ajoutez les pousses de soja et la moitié des cacahuètes. Servez immédiatement, garni du reste de cacahuètes, de ciboulette et d'un quartier de lime.`
  },
  {
    id: 'r11',
    title: 'Pho Bo (Soupe Vietnamienne)',
    description: 'Une soupe de nouilles vietnamienne parfumée et réconfortante avec un bouillon de bœuf riche et des herbes fraîches.',
    country: 'Vietnam',
    calories: 500,
    ingredients: [
        { name: 'Bouillon de bœuf', quantity: 1.5, unit: 'L' },
        { name: 'Bavette de bœuf', quantity: 200, unit: 'g' },
        { name: 'Nouilles de riz', quantity: 300, unit: 'g' },
        { name: 'Oignon', quantity: 1, unit: 'pièce' },
        { name: 'Gingembre', quantity: 5, unit: 'cm' },
        { name: 'Anis étoilé', quantity: 2, unit: 'pièce' },
        { name: 'Bâton de cannelle', quantity: 1, unit: 'pièce' },
        { name: 'Herbes fraîches (menthe, coriandre, basilic thaï)', quantity: 1, unit: 'bouquet' },
    ],
    preparation: `1. Faites griller l'oignon et le gingembre. Mettez-les dans le bouillon avec l'anis et la cannelle. Laissez infuser 30 min.\n2. Coupez le bœuf en tranches très fines. Faites cuire les nouilles de riz.\n3. Répartissez les nouilles dans des bols. Disposez les tranches de bœuf cru par-dessus.\n4. Versez le bouillon très chaud sur le bœuf, ce qui le cuira instantanément.\n5. Garnissez généreusement d'herbes fraîches, de pousses de soja et de piment si désiré.`
  },
  {
    id: 'r12',
    title: 'Classic Cheeseburger',
    description: 'L\'icône américaine. Un steak juteux, du fromage fondant, dans un pain brioché moelleux.',
    country: 'USA',
    calories: 750,
    ingredients: [
        { name: 'Bœuf haché (20% MG)', quantity: 500, unit: 'g' },
        { name: 'Pains à burger briochés', quantity: 4, unit: 'pièce' },
        { name: 'Cheddar en tranches', quantity: 4, unit: 'pièce' },
        { name: 'Laitue', quantity: 4, unit: 'feuille' },
        { name: 'Tomate', quantity: 1, unit: 'pièce' },
        { name: 'Oignon rouge', quantity: 1, unit: 'pièce' },
        { name: 'Cornichons', quantity: 8, unit: 'tranche' },
    ],
    preparation: `1. Formez 4 steaks hachés. Salez et poivrez généreusement.\n2. Faites cuire les steaks dans une poêle chaude, 3-4 minutes de chaque côté pour une cuisson à point.\n3. Pendant la dernière minute de cuisson, placez une tranche de cheddar sur chaque steak et couvrez pour faire fondre.\n4. Faites toaster légèrement les pains à burger.\n5. Assemblez : pain inférieur, sauce de votre choix, laitue, tomate, steak avec fromage, oignon, cornichons, pain supérieur.`
  },
  {
    id: 'r13',
    title: 'Houmous et Pain Pita',
    description: 'Une trempette crémeuse de pois chiches du Moyen-Orient, parfaite en apéritif ou en repas léger.',
    country: 'Liban',
    calories: 400,
    ingredients: [
        { name: 'Pois chiches en conserve', quantity: 400, unit: 'g' },
        { name: 'Tahini (purée de sésame)', quantity: 4, unit: 'cuillère à soupe' },
        { name: 'Jus de citron', quantity: 1, unit: 'pièce' },
        { name: 'Ail', quantity: 1, unit: 'gousse' },
        { name: 'Huile d\'olive', quantity: 2, unit: 'cuillère à soupe' },
        { name: 'Paprika', quantity: 1, unit: 'cuillère à café' },
        { name: 'Pains pita', quantity: 4, unit: 'pièce' },
    ],
    preparation: `1. Rincez et égouttez les pois chiches. Gardez un peu de leur eau.\n2. Dans un mixeur, mettez les pois chiches, le tahini, le jus de citron et l'ail. Mixez jusqu'à obtenir une pâte.\n3. Tout en mixant, versez un filet d'eau des pois chiches jusqu'à la consistance désirée.\n4. Servez dans un bol, créez un tourbillon avec une cuillère, arrosez d'huile d'olive et saupoudrez de paprika.\n5. Dégustez avec des pains pita tièdes.`
  },
  {
    id: 'r14',
    title: 'Salade César',
    description: 'Une salade croquante et savoureuse, un classique indémodable.',
    country: 'Mexique / USA',
    calories: 550,
    ingredients: [
        { name: 'Filet de Poulet', quantity: 200, unit: 'g' },
        { name: 'Laitue', quantity: 1, unit: 'pièce' },
        { name: 'Croûtons', quantity: 50, unit: 'g' },
        { name: 'Parmesan', quantity: 30, unit: 'g' },
        { name: 'Oeufs', quantity: 1, unit: 'pièce' },
        { name: 'Ail', quantity: 1, unit: 'gousse' },
        { name: 'Huile d\'olive', quantity: 50, unit: 'ml' },
        { name: 'Citron', quantity: 1, unit: 'pièce' },
    ],
    preparation: `1. Faites griller le filet de poulet, puis coupez-le en lanières.\n2. Préparez la sauce César : émulsionnez un jaune d'œuf avec l'ail haché, le jus de citron et montez à l'huile d'olive. Incorporez la moitié du parmesan râpé.\n3. Lavez et coupez la laitue. Mettez-la dans un saladier.\n4. Ajoutez le poulet, les croûtons et le reste du parmesan en copeaux.\n5. Versez la sauce, mélangez délicatement et servez immédiatement.`
  },
  {
    id: 'r15',
    title: 'Couscous Tunisien à l\'Agneau',
    description: 'Un plat familial généreux et parfumé, emblème de la cuisine tunisienne.',
    country: 'Tunisie',
    calories: 900,
    ingredients: [
        { name: 'Gigot d\'agneau', quantity: 800, unit: 'g' },
        { name: 'Semoule de couscous', quantity: 500, unit: 'g' },
        { name: 'Pois chiches en conserve', quantity: 200, unit: 'g' },
        { name: 'Carottes', quantity: 4, unit: 'pièce' },
        { name: 'Courgettes', quantity: 2, unit: 'pièce' },
        { name: 'Navets', quantity: 2, unit: 'pièce' },
        { name: 'Oignon', quantity: 1, unit: 'pièce' },
        { name: 'Concentré de tomate', quantity: 2, unit: 'cuillère à soupe' },
        { name: 'Harissa en conserve', quantity: 1, unit: 'cuillère à soupe' },
        { name: 'Huile d\'olive', quantity: 50, unit: 'ml' },
    ],
    preparation: `1. Dans le bas d'un couscoussier, faites revenir l'oignon haché et les morceaux d'agneau dans l'huile d'olive.\n2. Ajoutez le concentré de tomate, l'harissa, du sel, du poivre et couvrez d'eau. Laissez mijoter 45 minutes.\n3. Pendant ce temps, préparez la semoule en l'arrosant d'un peu d'eau salée et d'huile, et en l'égrainant à la main.\n4. Ajoutez les légumes coupés en gros morceaux (carottes, navets) dans le bouillon. Placez la semoule dans le haut du couscoussier et laissez cuire à la vapeur 20 minutes.\n5. Ajoutez les courgettes et les pois chiches au bouillon. Remélangez la semoule et remettez à cuire 15 minutes.\n6. Servez la semoule dans un grand plat, creusez un puits, disposez la viande et les légumes et arrosez de bouillon.`
  },
  {
    id: 'r16',
    title: 'Pizza Margherita',
    description: 'La reine des pizzas, simple, aux couleurs de l\'Italie, un vrai délice.',
    country: 'Italie',
    calories: 750,
    ingredients: [
        { name: 'Pâte à pizza', quantity: 1, unit: 'pièce' },
        { name: 'Tomates pelées', quantity: 200, unit: 'g' },
        { name: 'Mozzarella', quantity: 150, unit: 'g' },
        { name: 'Basilic frais', quantity: 1, unit: 'botte' },
        { name: 'Huile d\'olive', quantity: 2, unit: 'cuillère à soupe' },
        { name: 'Sel', quantity: 1, unit: 'pincée' },
    ],
    preparation: `1. Préchauffez votre four à la température maximale (250°C ou plus).\n2. Étalez la pâte à pizza sur une plaque de cuisson.\n3. Mixez les tomates pelées avec du sel et un filet d'huile d'olive pour faire la sauce. Étalez-la sur la pâte.\n4. Coupez la mozzarella en tranches et répartissez-la sur la pizza.\n5. Enfournez pour 10-12 minutes, jusqu'à ce que la croûte soit dorée et le fromage bien fondu.\n6. À la sortie du four, parsemez de feuilles de basilic frais et d'un filet d'huile d'olive.`
  },
  {
    id: 'r17',
    title: 'Chili con Carne',
    description: 'Un plat tex-mex riche et épicé, réconfortant et parfait à partager.',
    country: 'USA / Mexique',
    calories: 600,
    ingredients: [
        { name: 'Bœuf haché', quantity: 500, unit: 'g' },
        { name: 'Haricots rouges en conserve', quantity: 400, unit: 'g' },
        { name: 'Tomates pelées', quantity: 400, unit: 'g' },
        { name: 'Oignon', quantity: 1, unit: 'pièce' },
        { name: 'Ail', quantity: 2, unit: 'gousse' },
        { name: 'Poivron', quantity: 1, unit: 'pièce' },
        { name: 'Piment en poudre', quantity: 2, unit: 'cuillère à café' },
        { name: 'Cumin en poudre', quantity: 1, unit: 'cuillère à café' },
    ],
    preparation: `1. Hachez l'oignon, l'ail et le poivron. Faites-les revenir dans une grande cocotte avec un peu d'huile.\n2. Ajoutez le bœuf haché et faites-le dorer en l'émiettant.\n3. Incorporez les épices (piment, cumin), salez et poivrez. Mélangez bien.\n4. Ajoutez les tomates pelées (et leur jus) et les haricots rouges égouttés.\n5. Portez à ébullition, puis baissez le feu et laissez mijoter à couvert pendant au moins 1 heure.\n6. Servez chaud avec du riz, du fromage râpé ou de la crème fraîche.`
  },
  {
    id: 'r18',
    title: 'Ratatouille Niçoise',
    description: 'Un plat d\'été provençal, plein de légumes du soleil mijotés longuement.',
    country: 'France',
    calories: 300,
    ingredients: [
        { name: 'Aubergine', quantity: 2, unit: 'pièce' },
        { name: 'Courgette', quantity: 2, unit: 'pièce' },
        { name: 'Poivron', quantity: 2, unit: 'pièce' },
        { name: 'Tomates', quantity: 4, unit: 'pièce' },
        { name: 'Oignon', quantity: 2, unit: 'pièce' },
        { name: 'Ail', quantity: 3, unit: 'gousse' },
        { name: 'Huile d\'olive', quantity: 4, unit: 'cuillère à soupe' },
        { name: 'Bouquet garni', quantity: 1, unit: 'pièce' },
    ],
    preparation: `1. Coupez tous les légumes en morceaux de taille similaire.\n2. Faites revenir chaque légume séparément dans l'huile d'olive et réservez-les. Cela permet à chaque légume de développer sa propre saveur.\n3. Une fois tous les légumes précuits, faites revenir les oignons et l'ail hachés dans la même cocotte.\n4. Ajoutez les tomates et le bouquet garni. Laissez compoter 15 minutes.\n5. Remettez tous les légumes dans la cocotte. Salez, poivrez, et mélangez délicatement.\n6. Laissez mijoter à feu très doux et à couvert pendant au moins 45 minutes. La ratatouille est encore meilleure réchauffée.`
  }
];
