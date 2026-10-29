'use server';

import { z } from 'zod';
import { groqChatJson, getPreferredVisionModel, type GroqMessageContentPart } from '@/ai/groq';
import { ReceiptLine, Receipt } from '@/lib/types';

const ExtractReceiptInputSchema = z.object({
  receiptDataUri: z.string().describe('Data URI base64 du ticket de caisse.'),
});
export type ExtractReceiptInput = z.infer<typeof ExtractReceiptInputSchema>;

const ReceiptLineOutputSchema = z.object({
  id: z.string().optional(),
  rawLabel: z.string(),
  normalizedLabel: z.string().optional(),
  category: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  unitPrice: z.number().optional(),
  lineTotal: z.number().optional(),
  barcode: z.string().optional(),
});

const ExtractReceiptOutputSchema = z.object({
  storeName: z.string().optional(),
  purchaseAt: z.string().optional(),
  currency: z.string().optional(),
  total: z.number().optional(),
  subtotal: z.number().optional(),
  taxTotal: z.number().optional(),
  lines: z.array(ReceiptLineOutputSchema),
  ocrText: z.string().optional(),
  confidence: z.number().optional(),
});
export type ExtractReceiptOutput = z.infer<typeof ExtractReceiptOutputSchema>;

const RECEIPT_PROMPT = `Tu es un expert en extraction de données OCR pour tous types de reçus et tickets de caisse (Carrefour Tunisie, Monoprix, MG Magasin Général, Géant, Aziza, épicerie, etc.).
Analyse cette image et extrais TOUS les produits et détails listés.

STRUCTURE TYPIQUE D'UN PRODUIT (EX: CARREFOUR) :
1. LIGNE 1 : Libellé du produit (ex: "2L EAU PRISTINE") et souvent le TOTAL de la ligne à droite (ex: "4.740d").
2. LIGNE 2 : Code-barres éventuel (13 chiffres, ex: "6191467300049").
3. LIGNE 3 : Détail quantité et prix unitaire (ex: "6 x 0.790d").
   -> ICI, la quantité est 6 et le prix unitaire est 0.790.

RÈGLES CRITIQUES :
1. NE JAMAIS RÉUTILISER la quantité d'un produit précédent pour le suivant.
2. Si une ligne contient "X x Y", X est TOUJOURS la quantité et Y est le prix unitaire.
3. DATE (purchaseAt) : format ISO YYYY-MM-DD. N'invente jamais.
4. PRODUITS EN DOUBLE : Fusionne-les si le libellé est identique (additionne quantités et totaux).
5. CATÉGORIES :
   - Eau (Pristine, Safia, Sabrine, Melliti, Aqualine, Marwa...)
   - Boissons (Jus, Soda, Café, Thé, Delio...)
   - Frais (Lait, Yaourt, Fromage, Beurre...)
   - Pâtes (Spaghetti, Macaroni, Vermicelle, Couscous...)
   - Epicerie Salée (Huile, Tomate, Harissa, Farine, Semoule, Sel, Epices...)
   - Epicerie Sucrée (Biscuits, Chocolat, Chamia, Cake, Confiture...)
   - Fruits et Légumes (Pomme, Banane, Tomate fraîche, Oignon, Pomme de terre...)
   - Viandes et Poissons (Poulet, Viande, Poisson...)
   - Boulangerie & Pâtisserie (Pain, Toast...)
   - Autre

Format de sortie JSON Strict :
{
  "storeName": "Nom de l'enseigne",
  "purchaseAt": "YYYY-MM-DD",
  "currency": "TND",
  "total": number,
  "lines": [
    {
      "rawLabel": "Libellé brut",
      "normalizedLabel": "Nom propre du produit",
      "category": "Catégorie",
      "quantity": number,
      "unit": "pcs ou kg ou L",
      "unitPrice": number,
      "lineTotal": number,
      "barcode": "code barre si présent"
    }
  ]
}`;

export async function extractReceiptFromImage(
  input: ExtractReceiptInput
): Promise<ExtractReceiptOutput> {
  const parsed = ExtractReceiptInputSchema.parse(input);

  const systemPrompt =
    'Vous êtes un expert en extraction JSON de reçus et tickets de caisse. Répondez UNIQUEMENT avec un objet JSON valide, sans texte d accompagnement ni balises markdown.';

  const userContent: GroqMessageContentPart[] = [
    { type: 'text', text: RECEIPT_PROMPT },
    { type: 'image_url', image_url: { url: parsed.receiptDataUri } },
  ];

  const candidateModels = [
    getPreferredVisionModel(),
    'qwen/qwen3.8-27b',
    'llama-3.2-11b-vision-preview',
    'llama-3.2-90b-vision-preview',
  ].filter(Boolean);

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      console.log(`[MAC Receipt AI] Appel Groq Vision avec modèle : ${model}...`);
      const res = await groqChatJson<ExtractReceiptOutput>({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.1,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      });

      if (res && Array.isArray(res.lines) && res.lines.length > 0) {
        console.log(`[MAC Receipt AI] Succès : ${res.lines.length} articles extraits via ${model}`);
        return {
          ...res,
          currency: res.currency || 'TND',
          confidence: res.confidence || 0.85,
        };
      }
    } catch (err: any) {
      console.warn(`[MAC Receipt AI] Erreur modèle ${model}:`, err.message);
      lastError = err;
    }
  }

  throw new Error(
    lastError?.message ||
      "L'IA n'a pas pu analyser le ticket. Vérifiez que l'image est nette et bien éclairée."
  );
}
