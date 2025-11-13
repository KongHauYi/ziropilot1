"use server";

/**
 * Migrated from Genkit to a simple server function using Hugging Face.
 */

import { generateText } from '@/lib/generateText';
import { fetchUrlContent } from '@/ai/tools/get-url-content';
import { processChessLink } from '@/lib/chess-utils';

export interface ContinueChessConversationInput {
  name: string;
  link: string; // chess-results.com link
  question: string;
  history?: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>
  }>;
}

export interface ContinueChessConversationOutput {
  answer: string;
}

export async function continueChessConversation(
  input: ContinueChessConversationInput
): Promise<ContinueChessConversationOutput> {
  const { name, link, question } = input;

  // Flatten history into transcript, limit tokens by taking the last few messages only
  const history = (input.history || []).slice(-6);
  const transcript = history
    .map((h) => {
      const content = (h.parts || []).map((p) => p.text).join(' ');
      return `${h.role === 'user' ? 'User' : 'Assistant'}: ${content}`;
    })
    .join('\n');

  // Fetch limited context from tournament link(s)
  let context = '';
  if (link) {
    try {
      const urls = processChessLink(link).slice(0, 4);
      const pages = await Promise.all(urls.map((u) => fetchUrlContent(u, 2000)));
      context = pages.join('\n\n---\n\n');
    } catch {
      context = '';
    }
  }

  const prompt = `You are a chess insight assistant. The user's name is ${name}.
Tournament context (truncated excerpts may contain standings/pairings):
---
${context}
---

Conversation so far:
${transcript || '(no prior conversation)'}

User question: ${question}

Provide a concise, accurate answer grounded in the provided tournament context when possible. If data is missing in the context, use general chess knowledge but avoid fabricating specific results. Reply clearly.`;

  const result = await generateText({ prompt, maxTokens: 512, temperature: 0.3 });
  return { answer: result.text };
}
