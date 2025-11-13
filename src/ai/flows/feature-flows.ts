"use server";

/**
 * Migrated from Genkit to direct Hugging Face Inference API via generateText helper.
 */

import { generateText } from '@/lib/generateText';
import { processChessLink } from '@/lib/chess-utils';
import { fetchUrlContent } from '@/ai/tools/get-url-content';

export interface DeepDiveInput {
  name: string;
  link: string; // chess-results.com link
  playerName: string;
}

export interface BattleForecastInput {
  name: string;
  link: string; // chess-results.com link
}

export interface ReportOutput { report: string }

export async function deepDive(input: DeepDiveInput): Promise<ReportOutput> {
  const { name, link, playerName } = input;

  const urls = processChessLink(link);
  // Limit number of fetched pages to keep prompt within context
  const limitedUrls = urls.slice(0, 6);
  const pages = await Promise.all(limitedUrls.map((u) => fetchUrlContent(u, 3000)));

  const context = pages
    .map((p, i) => `URL ${i + 1}:
${p}`)
    .join('\n\n---\n\n');

  const prompt = `You are a world-class chess analyst. Generate a detailed Deep Dive report for the player "${playerName}".

Author name: ${name}
Source: chess-results.com pages (HTML excerpts below). Focus on accuracy.

Context (multiple rounds and pairings, truncated):
---
${context}
---

Write a well-structured markdown report including:
1. Overall Performance (final rank, points, performance rating if available)
2. Round-by-Round Breakdown (opponent, result, notable details)
3. Key Game Analysis (1-2 crucial games)

Do not mention that you are reading HTML or that content is truncated.`;

  const result = await generateText({ prompt, maxTokens: 1024, temperature: 0.5 });
  return { report: result.text };
}

export async function battleForecast(input: BattleForecastInput): Promise<ReportOutput> {
  const { name, link } = input;

  const urls = processChessLink(link);
  const limitedUrls = urls.slice(0, 6);
  const pages = await Promise.all(limitedUrls.map((u) => fetchUrlContent(u, 2500)));

  const context = pages
    .map((p, i) => `URL ${i + 1}:
${p}`)
    .join('\n\n---\n\n');

  const prompt = `You are a chess analyst with a knack for prediction. Generate a "Battle Forecast" for ${name} based on current tournament context below.

Context (standings/pairings excerpts, truncated):
---
${context}
---

Tasks:
- Determine current standings and scores (as available in context)
- Apply Swiss pairing logic at a high level (similar scores play, avoid rematches)
- List the top 3 most likely opponents for ${name}
- For each, provide a one-sentence summary of their strength or recent performance

Output a clean, well-formatted markdown section starting with the heading: "Battle Forecast".`;

  const result = await generateText({ prompt, maxTokens: 768, temperature: 0.4 });
  return { report: result.text };
}
