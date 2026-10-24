export interface NavCategory {
  slug: string;
  name: string;
}

/**
 * Top categories for the shell (same set as the admin catalogue).
 * Placeholder until G4, when they come from ProductsApi.categories() over the
 * seeded catalogue.
 */
export const TOP_CATEGORIES: readonly NavCategory[] = [
  { slug: "staples", name: "Staples" },
  { slug: "edible-oil", name: "Edible oil" },
  { slug: "pulses", name: "Pulses & dal" },
  { slug: "snacks", name: "Snacks" },
  { slug: "beverages", name: "Beverages" },
  { slug: "personal-care", name: "Personal care" },
  { slug: "home-care", name: "Home care" },
  { slug: "seasonal", name: "Seasonal" },
];
