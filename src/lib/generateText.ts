import { HF_ENDPOINT, getHfToken } from '@/lib/config';

export interface TextGenerationOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

export interface TextGenerationResponse {
  text: string;
  finishReason?: string;
}

const DEFAULT_MAX_TOKENS = 512;
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_TOP_P = 0.95;

export async function generateText(options: TextGenerationOptions): Promise<TextGenerationResponse> {
  const {
    prompt,
    maxTokens = DEFAULT_MAX_TOKENS,
    temperature = DEFAULT_TEMPERATURE,
    topP = DEFAULT_TOP_P,
  } = options;

  if (!prompt || !prompt.trim()) {
    throw new Error('Prompt cannot be empty');
  }
  if (maxTokens < 1 || maxTokens > 2048) {
    throw new Error('maxTokens must be between 1 and 2048');
  }
  if (temperature < 0 || temperature > 2) {
    throw new Error('temperature must be between 0 and 2');
  }

  const body = {
    inputs: prompt,
    parameters: {
      max_new_tokens: maxTokens,
      temperature,
      top_p: topP,
      do_sample: true,
      return_full_text: false,
    },
  };

  const maxRetries = 3;
  const retryDelays = [1000, 3000, 7000];
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(HF_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getHfToken()}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        const text = extractText(data);
        return { text, finishReason: 'completed' };
      }

      if (res.status === 429 || res.status === 503) {
        if (attempt < maxRetries) {
          await sleep(retryDelays[Math.min(attempt, retryDelays.length - 1)]);
          continue;
        }
        const msg = res.status === 429 ? 'Rate limited by Hugging Face API. Please try again later.' : 'Model is loading. Please try again shortly.';
        throw new Error(msg);
      }

      const errText = await res.text();
      throw new Error(`Hugging Face API error (${res.status}): ${errText}`);
    } catch (e: any) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt === maxRetries) break;
    }
  }

  throw lastError || new Error('Failed to generate text after retries');
}

function extractText(data: any): string {
  if (Array.isArray(data) && data[0] && typeof data[0] === 'object') {
    const t = data[0].generated_text;
    if (typeof t === 'string') return cleanText(t);
  }
  throw new Error('Unexpected response format from Hugging Face');
}

function cleanText(text: string): string {
  let s = text.trim();
  s = s.replace(/^\[INST\]\s*/i, '');
  s = s.replace(/^\s*\[\/INST\]\s*/i, '');
  return s;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
