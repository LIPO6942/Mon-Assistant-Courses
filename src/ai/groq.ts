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
  reasoning_format?: 'parsed' | 'raw' | 'hidden';
  reasoning_effort?: 'none' | 'low' | 'medium' | 'high' | 'default';
}

interface GroqChatChoice {
  index: number;
  message: {
    role: 'assistant';
    content: string | GroqMessageContentPart[];
    reasoning?: string;
    reasoning_content?: string;
  };
  finish_reason: string | null;
}

interface GroqChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: GroqChatChoice[];
}

export function normalizeModelName(model: string): string {
  const trimmed = model.trim();
  if (trimmed === 'qwen3.8-27b') return 'qwen/qwen3.8-27b';
  if (trimmed === 'qwen3.6-27b') return 'qwen/qwen3.6-27b';
  if (trimmed === 'qwen3-32b') return 'qwen/qwen3-32b';
  return trimmed;
}

export function isReasoningModel(model: string): boolean {
  const m = model.toLowerCase();
  return m.includes('qwen') || m.includes('deepseek-r1') || m.includes('qwq');
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
  const finalModel = normalizeModelName(request.model);

  const payload: Record<string, unknown> = {
    ...request,
    model: finalModel,
  };

  // For reasoning models (such as qwen/qwen3.8-27b), Groq rejects raw reasoning combined with JSON mode (400 error).
  // Automatically configure reasoning_format: 'parsed' if not specified.
  if (isReasoningModel(finalModel) && !payload.reasoning_format) {
    payload.reasoning_format = 'parsed';
  }

  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
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
  let text = '';
  if (typeof first === 'string') {
    text = first;
  } else if (Array.isArray(first)) {
    // Concatenate text parts if any
    text = first.map((p) => (p.type === 'text' ? p.text : '')).join('\n').trim();
  } else {
    throw new Error("Réponse Groq invalide : contenu manquant.");
  }
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
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

  // Clean text: strip potential <think> tags or markdown code fences
  let cleaned = asText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    // Fallback: try to extract JSON substring
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        // continue
      }
    }
    throw new Error(`La réponse Groq n'est pas un JSON valide : ${cleaned.slice(0, 100)}...`);
  }
}

const DEFAULT_TEXT_MODELS = [
  'qwen/qwen3.8-27b',
  'qwen-2.5-32b',
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
];

const DEFAULT_VISION_MODELS = [
  'qwen/qwen3.8-27b',
  'llama-3.2-11b-vision-preview',
  'llama-3.2-90b-vision-preview',
];

export function getPreferredTextModel(): string {
  const override = process.env.GROQ_TEXT_MODEL?.trim();
  if (override) return normalizeModelName(override);
  return DEFAULT_TEXT_MODELS[0];
}

export function getPreferredVisionModel(): string {
  const override = process.env.GROQ_VISION_MODEL?.trim();
  if (override) return normalizeModelName(override);
  return DEFAULT_VISION_MODELS[0];
}
