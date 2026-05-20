import "server-only";

import { cache } from "react";
import { resources } from "@/content/resources";
import { dbResourceRowToResource, getDbResources } from "@/lib/resources/db";
import type { Resource } from "@/content/schemas";

// Unified read of resources — DB first, static src/content/resources.ts
// as zero-downtime fallback. Public surfaces (/resources, /resources/tools,
// /resources/links) consume this and never see the underlying source.
//
// Cutover: as soon as the resources table has ≥1 row, the public
// surface flips to DB-backed reads. Until then, the static array
// remains authoritative.

export const getResourcesSource = cache(async (): Promise<Resource[]> => {
  const rows = await getDbResources();
  if (rows.length === 0) return resources;
  return rows.map(dbResourceRowToResource);
});

export const getResourceFromSource = cache(
  async (slug: string): Promise<Resource | undefined> => {
    const all = await getResourcesSource();
    return all.find((r) => r.slug === slug);
  },
);
