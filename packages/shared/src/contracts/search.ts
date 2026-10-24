import { z } from "zod";
import { ProductSummary } from "./catalog";
import { Cursor, Limit, page, Paise } from "./common";

export const SearchSort = z.enum(["relevance", "price_asc", "price_desc", "rating", "newest", "discount"]);
export type SearchSort = z.infer<typeof SearchSort>;

export const SearchQuery = z.object({
  q: z.string().max(100).default(""),
  category: z.string().optional(),
  brand: z.array(z.string()).default([]),
  minPrice: Paise.optional(),
  maxPrice: Paise.optional(),
  rating: z.number().int().min(1).max(4).optional(),
  prime: z.boolean().optional(),
  sort: SearchSort.default("relevance"),
  cursor: Cursor.optional(),
  limit: Limit.default(24),
});
export type SearchQuery = z.infer<typeof SearchQuery>;
export type SearchQueryInput = z.input<typeof SearchQuery>;

export const Facets = z.object({
  brands: z.array(z.object({ id: z.string(), name: z.string(), count: z.number().int() })),
  priceBuckets: z.array(z.object({ min: Paise, max: Paise.nullable(), count: z.number().int() })),
  ratings: z.array(z.object({ atLeast: z.number().int(), count: z.number().int() })),
  primeCount: z.number().int(),
});
export type Facets = z.infer<typeof Facets>;

export const SearchResult = page(ProductSummary).extend({
  total: z.number().int().nonnegative(),
  facets: Facets,
  /** Set when the query was corrected for a typo ("biskit" → "biscuit"). */
  correctedQuery: z.string().nullable(),
});
export type SearchResult = z.infer<typeof SearchResult>;

export const Suggestion = z.object({
  kind: z.enum(["query", "product", "category", "brand"]),
  label: z.string(),
  href: z.string(),
});
export type Suggestion = z.infer<typeof Suggestion>;
