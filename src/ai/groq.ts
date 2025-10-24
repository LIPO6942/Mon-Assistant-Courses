/**
 * Minimal Groq OpenAI-compatible client using native fetch.
 *
 * Env: GROQ_API_KEY
 */

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

export type GroqMessageContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

export type GroqChatMessage =
  | { role: 'system' | 'user' | 'assistant'; content: string }
  | { role: 'system' | 'user' | 'assistant'; content: GroqMessageContentPart[] };

export interface GroqChatRequest {
  model: string;
  messages: GroqChatMessage[];
  temperature?: number;
  max_tokens?: number;
  // OpenAI-compatible JSON mode; supported by Groq
  response_format?: { type: 'json_object' };
}

interface GroqChatChoice {
  index: number;
  message: { role: 'assistant'; content: string | GroqMessageContentPart[] };
  finish_reason: string | null;
}

interface GroqChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: GroqChatChoice[];
}

function getGroqApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error(
      "GROQ_API_KEY n'est pas défini. Créez un compte sur Groq (gratuit, sans carte), récupérez une clé API, puis définissez GROQ_API_KEY dans votre environnement."
    );
  }
  return key;
}

async function groqChat(request: GroqChatRequest): Promise<GroqChatResponse> {
  const apiKey = getGroqApiKey();
  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    // Let Next.js/Node decide; these are server actions
  });

  if (!res.ok) {
    let details = '';
    try {
      details = await res.text();
    } catch {
      // ignore
    }
    throw new Error(`Échec de l'appel Groq (${res.status}). ${details}`);
  }
  return (await res.json()) as GroqChatResponse;
}

export async function groqChatText(
  params: Omit<GroqChatRequest, 'response_format'>
): Promise<string> {
  const response = await groqChat(params);
  const first = response.choices?.[0]?.message?.content;
  if (typeof first === 'string') return first;
  if (Array.isArray(first)) {
    // Concatenate text parts if any
    return first.map((p) => (p.type === 'text' ? p.text : '')).join('\n').trim();
  }
  throw new Error("Réponse Groq invalide : contenu manquant.");
}

export async function groqChatJson<T = unknown>(
  params: GroqChatRequest
): Promise<T> {
  const response = await groqChat({ ...params, response_format: { type: 'json_object' } });
  const content = response.choices?.[0]?.message?.content;
  const asText = Array.isArray(content)
    ? content.map((p) => (p.type === 'text' ? p.text : '')).join('\n')
    : (content as string | undefined);
  if (!asText) throw new Error("Réponse Groq vide.");
  try {
    return JSON.parse(asText) as T;
  } catch (err) {
    // Fallback: try to extract JSON substring
    const match = asText.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as T;
    }
    throw new Error("La réponse Groq n'est pas un JSON valide.");
  }
}

export const GroqModels = {
  // Strong general reasoning/text
  Text: 'llama-3.1-70b-versatile',
  // Vision-capable model (preview names used by Groq)
  Vision: 'llama-3.2-11b-vision-preview',
} as const;
