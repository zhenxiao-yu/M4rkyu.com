import "server-only";
import { generateObject } from "ai";
import { z } from "zod";
import type { SearchDoc } from "./catalog";

// Sonnet is the cost/quality sweet spot for ranking a small catalog: strong
// intent + synonym understanding, far cheaper than Opus. Swap to
// "anthropic/claude-haiku-4.5" to cut cost further if quality holds.
// Routed through the Vercel AI Gateway by the bare "provider/model" string.
const MODEL = "anthropic/claude-sonnet-4.6";

// The model returns only ids (which it ranks) + a one-line reason. We map
// ids back to full docs server-side, so the model never invents hrefs.
const rankingSchema = z.object({
  results: z
    .array(
      z.object({
        id: z.string(),
        reason: z.string().max(160),
      }),
    )
    .max(8),
});

export interface RankedHit {
  doc: SearchDoc;
  reason: string;
}

const SYSTEM =
  "You are the semantic search engine for Mark Yu's personal portfolio. " +
  "Given a catalog of content items and a visitor's natural-language query, " +
  "return ONLY the items genuinely relevant to the query, most relevant first. " +
  "Match on meaning and intent, not just keywords. If nothing is relevant, " +
  "return an empty list — never pad with weak matches. For each hit give a " +
  "short, specific reason (max ~15 words) a visitor would find helpful.";

/**
 * Rank the catalog against a query with one structured LLM call. Returns at
 * most `limit` hits mapped back to their full {@link SearchDoc}. Ids the
 * model returns that aren't in the catalog are dropped.
 */
export async function rankCatalog(
  query: string,
  catalog: SearchDoc[],
  limit = 6,
): Promise<RankedHit[]> {
  // Strip href/subtitle from the prompt payload — the model only needs the
  // matchable fields, and smaller input = lower cost + latency.
  const indexed = catalog.map((d) => ({
    id: d.id,
    type: d.type,
    title: d.title,
    description: d.description,
    tags: d.tags,
  }));

  const { object } = await generateObject({
    model: MODEL,
    schema: rankingSchema,
    temperature: 0,
    maxOutputTokens: 600,
    system: SYSTEM,
    prompt: `Catalog (JSON):\n${JSON.stringify(indexed)}\n\nVisitor query: "${query}"\n\nReturn the relevant items, most relevant first.`,
  });

  const byId = new Map(catalog.map((d) => [d.id, d]));
  const hits: RankedHit[] = [];
  for (const result of object.results) {
    const doc = byId.get(result.id);
    if (doc) hits.push({ doc, reason: result.reason });
    if (hits.length >= limit) break;
  }
  return hits;
}
