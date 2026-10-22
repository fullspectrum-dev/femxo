export interface NavLink {
  label: string;
  href: string;
  /** Drawn as a gold pill so it stands out from the other links. */
  highlight?: boolean;
}

export const NAV_LINKS: readonly NavLink[] = [
  { label: "Why Femxo", href: "#why" },
  { label: "Network", href: "#network" },
  { label: "Platform", href: "#platform" },
  { label: "Femxo Tech", href: "#tech", highlight: true },
  { label: "Women", href: "#women" },
  { label: "Roadmap", href: "#roadmap" },
];

export const CONTACT = {
  phone: "+91 9065741541",
  phoneHref: "tel:+919065741541",
  directors: "Munni Srivastava | Aditya Raj",
  registeredAddress:
    "C/O Sanjay Srivastava, Chhota Pareawa, Raxaul, East Champaran, Bihar, 845305",
  corporateOffice: "College Road, Near Kaudihar Chowk, Raxaul, Bihar, 845305",
} as const;

export const CAPABILITIES = [
  "E-commerce",
  "Dealer network",
  "ERP",
  "Agentic AI",
  "Websites and apps",
  "Cloud",
  "Women entrepreneurs",
  "38 districts",
] as const;

/**
 * Bihar's government tree, as the backend imports it from the Local
 * Government Directory (State → District → Sub-division → Block / Urban body
 * → Gram Panchayat → Village). Divisions are a sales grouping, not a
 * government level. Counts are rounded.
 */
export const BIHAR_LEVELS = [
  { value: "9", label: "Divisions" },
  { value: "38", label: "Districts" },
  { value: "101", label: "Sub-divisions" },
  { value: "534", label: "Blocks" },
  { value: "8,000+", label: "Gram panchayats" },
  { value: "40,000+", label: "Villages" },
] as const;

/**
 * The entrepreneur model: one dealer per gram panchayat, two sub-dealers per
 * village. Panchayats: 8,072 contested in the 2021 Bihar panchayat elections
 * (CAG audit report, 2023). Villages: 44,874 in Census 2011.
 */
export const ENTREPRENEUR_MODEL = {
  panchayats: 8072,
  dealersPerPanchayat: 1,
  villages: 44874,
  subDealersPerVillage: 2,
} as const;
