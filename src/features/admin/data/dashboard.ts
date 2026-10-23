import type { StatusKey } from "@/components/admin-ui";

/*
 * PROTOTYPE DATA for the dashboard, shown only while isAdminPrototype is true.
 * Money is in paise. The live version comes from GET /dashboard?range=…
 * (daily_metrics read model).
 *
 * Everything a range touches comes from one `dashboardFor(range)` call, so
 * the KPIs, charts and breakdowns always agree: the trend buckets sum to the
 * KPI totals, and the breakdowns are shares of the same totals. Series are
 * generated deterministically, so the prototype looks the same on every load.
 */

export type RangeKey = "7d" | "30d" | "90d" | "fy";

export const RANGES: readonly { key: RangeKey; label: string; long: string; compare: string }[] = [
  { key: "7d", label: "7D", long: "Last 7 days", compare: "vs previous 7 days" },
  { key: "30d", label: "30D", long: "Last 30 days", compare: "vs previous 30 days" },
  { key: "90d", label: "90D", long: "Last 90 days", compare: "vs previous 90 days" },
  { key: "fy", label: "FY", long: "FY 2026–27 to date", compare: "vs same period last FY" },
];

const crore = (value: number) => Math.round(value * 1e7 * 100);

interface RangeFigures {
  salesPaise: number;
  salesGrowth: number;
  orders: number;
  ordersGrowth: number;
  newPartners: number;
  primeAdds: number;
}

const FIGURES: Record<RangeKey, RangeFigures> = {
  "7d": { salesPaise: crore(1.58), salesGrowth: 0.041, orders: 10_920, ordersGrowth: 0.027, newPartners: 18, primeAdds: 1_180 },
  "30d": { salesPaise: crore(6.71), salesGrowth: 0.098, orders: 46_380, ordersGrowth: 0.074, newPartners: 96, primeAdds: 4_620 },
  "90d": { salesPaise: crore(18.6), salesGrowth: 0.143, orders: 1_28_450, ordersGrowth: 0.119, newPartners: 312, primeAdds: 9_410 },
  fy: { salesPaise: crore(38.4), salesGrowth: 0.216, orders: 2_61_300, ordersGrowth: 0.182, newPartners: 701, primeAdds: 18_960 },
};

export const NETWORK = { dealers: 612, subDealers: 3_940 };
export const PRIME_MEMBERS = 52_880;
export const REGISTERED_USERS = 4_82_310;

// ---------- Deterministic shapes ----------

/** 0..1, stable for a given seed and index. */
function noise(seed: number, index: number) {
  const x = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Splits `total` over `weights`, rounding so the parts still sum to the total. */
function distribute(total: number, weights: readonly number[]) {
  const sum = weights.reduce((a, b) => a + b, 0);
  const parts = weights.map((weight) => Math.floor((total * weight) / sum));
  const last = parts.length - 1;
  parts[last] = (parts[last] ?? 0) + total - parts.reduce((a, b) => a + b, 0);
  return parts;
}

/** A gently rising, slightly noisy shape; weekends dip on daily buckets. */
function shape(buckets: readonly Bucket[], seed: number, rise: number) {
  return buckets.map((bucket, index) => {
    const trend = 1 + (rise * index) / Math.max(1, buckets.length - 1);
    const wobble = 0.93 + 0.14 * noise(seed, index);
    const weekend = bucket.weekend ? 0.9 : 1;
    return trend * wobble * weekend * bucket.weight;
  });
}

// ---------- Buckets per range ----------

export interface Bucket {
  /** Short x-axis label: "17 Oct", "Apr". */
  axis: string;
  /** Tooltip / table label: "Fri, 17 Oct", "Week of 28 Jul", "Oct 2026 (to date)". */
  full: string;
  /** Share of a full bucket that has elapsed (the running month is partial). */
  weight: number;
  weekend?: boolean;
}

const DAY_MS = 86_400_000;
const IST = "Asia/Kolkata";
const fmt = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-IN", { timeZone: IST, ...options });
const DAY_MONTH = fmt({ day: "numeric", month: "short" });
const WEEKDAY_DAY_MONTH = fmt({ weekday: "short", day: "numeric", month: "short" });
const WEEKDAY = fmt({ weekday: "short" });
const MONTH = fmt({ month: "short" });
const MONTH_YEAR = fmt({ month: "short", year: "numeric" });

function istParts(date: Date) {
  const [year, month, day] = fmt({ year: "numeric", month: "numeric", day: "numeric" })
    .formatToParts(date)
    .filter((part) => part.type !== "literal")
    .map((part) => Number(part.value));
  return { day: day!, month: month!, year: year! };
}

function dailyBuckets(now: Date, days: number): Bucket[] {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(now.getTime() - (days - 1 - index) * DAY_MS);
    const weekday = WEEKDAY.format(date);
    return {
      axis: days <= 7 ? `${weekday} ${istParts(date).day}` : DAY_MONTH.format(date),
      full: WEEKDAY_DAY_MONTH.format(date),
      weight: 1,
      weekend: weekday === "Sat" || weekday === "Sun",
    };
  });
}

function weeklyBuckets(now: Date, weeks: number): Bucket[] {
  return Array.from({ length: weeks }, (_, index) => {
    const start = new Date(now.getTime() - (weeks - index) * 7 * DAY_MS + DAY_MS);
    return { axis: DAY_MONTH.format(start), full: `Week of ${DAY_MONTH.format(start)}`, weight: 1 };
  });
}

/** April of the running financial year up to this month; the running month is partial. */
function fyBuckets(now: Date): Bucket[] {
  const { day, month, year } = istParts(now);
  const fyStartYear = month >= 4 ? year : year - 1;
  const count = ((month - 4 + 12) % 12) + 1;
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(fyStartYear, 3 + index, 15));
    const last = index === count - 1;
    const daysInMonth = new Date(Date.UTC(fyStartYear, 4 + index, 0)).getUTCDate();
    return {
      axis: MONTH.format(date),
      full: last ? `${MONTH_YEAR.format(date)} (to date)` : MONTH_YEAR.format(date),
      weight: last ? day / daysInMonth : 1,
    };
  });
}

function bucketsFor(range: RangeKey, now: Date): Bucket[] {
  if (range === "7d") return dailyBuckets(now, 7);
  if (range === "30d") return dailyBuckets(now, 30);
  if (range === "90d") return weeklyBuckets(now, 13);
  return fyBuckets(now);
}

// ---------- Breakdowns (shares of the range's totals) ----------

const DISTRICT_SHARES = [
  { district: "Patna", share: 0.172 },
  { district: "Muzaffarpur", share: 0.113 },
  { district: "Gaya", share: 0.086 },
  { district: "Bhagalpur", share: 0.069 },
  { district: "Darbhanga", share: 0.061 },
  { district: "Purnia", share: 0.052 },
] as const;
export const OTHER_DISTRICTS = 32;

const CHANNEL_SHARES: Record<RangeKey, readonly [number, number, number]> = {
  "7d": [0.56, 0.31, 0.13],
  "30d": [0.57, 0.3, 0.13],
  "90d": [0.58, 0.29, 0.13],
  fy: [0.6, 0.27, 0.13],
};
export const CHANNELS = [
  { key: "partner", label: "Partner network" },
  { key: "app", label: "Customer app" },
  { key: "field", label: "Field staff" },
] as const;

const PRODUCTS = [
  { name: "Staples bundle 5 kg", sku: "FX-STP-5KG", share: 0.102, pricePaise: 64_900, growth: 0.18 },
  { name: "Edible oil 1 L", sku: "FX-OIL-1L", share: 0.075, pricePaise: 18_500, growth: 0.09 },
  { name: "Rice 25 kg", sku: "FX-RICE-25", share: 0.061, pricePaise: 1_49_000, growth: -0.03 },
  { name: "Personal care kit", sku: "FX-PCK-STD", share: 0.052, pricePaise: 34_900, growth: 0.12 },
  { name: "Wheat atta 10 kg", sku: "FX-ATTA-10", share: 0.044, pricePaise: 46_500, growth: 0.06 },
] as const;

export interface Kpi {
  key: "orders" | "aov" | "partners" | "prime";
  label: string;
  value: number;
  kind: "count" | "money";
  /** Signed relative change vs the previous period, or an absolute count of additions. */
  change: { kind: "percent" | "count"; value: number };
  context: string;
  /** 12 points for the sparkline, oldest first. */
  trend: number[];
}

function sparkline(seed: number, rise: number) {
  let level = 1;
  return Array.from({ length: 12 }, (_, index) => {
    level *= 1 + rise / 12 + (noise(seed, index) - 0.5) * 0.06;
    return level;
  });
}

export function dashboardFor(range: RangeKey, now = new Date()) {
  const figures = FIGURES[range];
  const buckets = bucketsFor(range, now);
  const seed = RANGES.findIndex((entry) => entry.key === range) + 1;

  const sales = distribute(figures.salesPaise, shape(buckets, seed * 3, 0.32));
  const previousSales = distribute(
    Math.round(figures.salesPaise / (1 + figures.salesGrowth)),
    // The previous period's running bucket is complete, so it isn't scaled down.
    shape(
      buckets.map((bucket) => ({ ...bucket, weight: 1 })),
      seed * 7,
      0.22
    )
  );
  const orders = distribute(figures.orders, shape(buckets, seed * 5, 0.26));

  const aov = Math.round(figures.salesPaise / figures.orders);
  const aovGrowth = (1 + figures.salesGrowth) / (1 + figures.ordersGrowth) - 1;
  const partners = NETWORK.dealers + NETWORK.subDealers;

  const kpis: Kpi[] = [
    {
      key: "orders",
      label: "Orders",
      value: figures.orders,
      kind: "count",
      change: { kind: "percent", value: figures.ordersGrowth },
      context: `${Math.round(figures.orders / Math.max(1, buckets.length)).toLocaleString("en-IN")} per ${range === "fy" ? "month" : range === "90d" ? "week" : "day"} on average`,
      trend: sparkline(seed * 11, figures.ordersGrowth * 2),
    },
    {
      key: "aov",
      label: "Average order value",
      value: aov,
      kind: "money",
      change: { kind: "percent", value: aovGrowth },
      context: "Gross sales ÷ orders",
      trend: sparkline(seed * 13, aovGrowth * 2),
    },
    {
      key: "partners",
      label: "Active partners",
      value: partners,
      kind: "count",
      change: { kind: "count", value: figures.newPartners },
      context: `${NETWORK.dealers.toLocaleString("en-IN")} dealers · ${NETWORK.subDealers.toLocaleString("en-IN")} sub-dealers`,
      trend: sparkline(seed * 17, figures.newPartners / partners),
    },
    {
      key: "prime",
      label: "Prime members",
      value: PRIME_MEMBERS,
      kind: "count",
      change: { kind: "count", value: figures.primeAdds },
      context: `${((PRIME_MEMBERS / REGISTERED_USERS) * 100).toFixed(1)}% of ${REGISTERED_USERS.toLocaleString("en-IN")} registered users`,
      trend: sparkline(seed * 19, figures.primeAdds / PRIME_MEMBERS),
    },
  ];

  const districtTotal = figures.salesPaise;
  const districts = DISTRICT_SHARES.map((entry) => ({ label: entry.district, value: Math.round(districtTotal * entry.share), share: entry.share }));
  const otherDistricts = districtTotal - districts.reduce((sum, entry) => sum + entry.value, 0);

  const channelShares = CHANNEL_SHARES[range];
  const channelOrders = distribute(figures.orders, channelShares);

  const products = PRODUCTS.map((product) => {
    const revenue = Math.round(figures.salesPaise * product.share);
    return { ...product, revenue, units: Math.round(revenue / product.pricePaise) };
  });

  return {
    range: RANGES.find((entry) => entry.key === range)!,
    sales: { total: figures.salesPaise, previousTotal: previousSales.reduce((a, b) => a + b, 0), growth: figures.salesGrowth },
    trend: { buckets, sales, previousSales, orders },
    kpis,
    districts,
    otherDistricts,
    channels: CHANNELS.map((channel, index) => ({ ...channel, value: channelOrders[index]! })),
    products,
  };
}

export type DashboardData = ReturnType<typeof dashboardFor>;

// ---------- Current state (not range-based) ----------

/** SKU count by stock state across all warehouses, right now. */
export const INVENTORY_HEALTH = [
  { key: "healthy", label: "Healthy", value: 412 },
  { key: "low", label: "Low stock", value: 81 },
  { key: "expiring", label: "Expiring ≤ 30 days", value: 29 },
  { key: "out", label: "Out of stock", value: 51 },
] as const;

export interface AttentionItem {
  key: string;
  label: string;
  meta: string;
  count: number;
  href: `/admin/${string}`;
  tone: "warning" | "error" | "info";
}

export const ATTENTION: readonly AttentionItem[] = [
  { key: "dealer-kyc", label: "Dealer KYC reviews", meta: "Oldest waiting 5 days", count: 7, href: "/admin/dealers", tone: "warning" },
  { key: "subdealer-kyc", label: "Sub-dealer KYC reviews", meta: "3 submitted today", count: 12, href: "/admin/sub-dealers", tone: "warning" },
  { key: "settlements", label: "Settlements to approve", meta: "₹42.8 L across 14 batches", count: 14, href: "/admin/finance", tone: "info" },
  { key: "einvoice", label: "Invoices without an IRN", meta: "1 dead-lettered at the GSP", count: 4, href: "/admin/billing", tone: "error" },
  { key: "stock", label: "Inventory alerts", meta: "Low, expiring or out of stock", count: 24, href: "/admin/warehouse", tone: "warning" },
];

/** The application featured at the top of "Needs attention", with Reject / Review. */
export const SPOTLIGHT = {
  title: "Kosi Distribution Co.",
  meta: "Dealer KYC · Saharsa · submitted 18 Oct",
  status: "in_review" as StatusKey,
  href: "/admin/dealers" as const,
  record: { dataset: "dealers", id: "dlr-2", from: ["submitted", "in_review"] } as const,
};

export interface HealthItem {
  label: string;
  meta: string;
  status: StatusKey;
  href: `/admin/${string}`;
}

export const SYSTEM_HEALTH: readonly HealthItem[] = [
  { label: "Email", meta: "Last delivery 2 min ago", status: "healthy", href: "/admin/integrations" },
  { label: "SMS gateway", meta: "OTP queue · 1 dead-letter", status: "degraded", href: "/admin/integrations" },
  { label: "GST e-invoice (GSP)", meta: "Retrying · next attempt in 6 min", status: "retrying", href: "/admin/integrations" },
  { label: "Report workers", meta: "2 queued · 1 processing", status: "healthy", href: "/admin/reports" },
  { label: "Login protection", meta: "5 failed logins blocked · 11 min ago", status: "blocked", href: "/admin/security" },
];

export interface ActivityItem {
  actor: string;
  action: string;
  target: string;
  time: string;
  href: `/admin/${string}`;
}

export const RECENT_ACTIVITY: readonly ActivityItem[] = [
  { actor: "Amit Raj", action: "approved dealer", target: "Anand Agencies", time: "10:42", href: "/admin/dealers" },
  { actor: "Sunil Yadav", action: "dispatched transfer", target: "TR-1042 · Patna → Gaya", time: "09:15", href: "/admin/warehouse" },
  { actor: "Munni S.", action: "changed the role of", target: "Priya Sinha → Finance Admin", time: "09:02", href: "/admin/security" },
  { actor: "Priya Sinha", action: "created settlement", target: "ST-2210 · ₹1,24,000", time: "Yesterday", href: "/admin/finance" },
  { actor: "Rakesh Kumar", action: "updated the price of", target: "Edible oil 1 L", time: "Yesterday", href: "/admin/products" },
];

export const QUICK_LINKS = [
  { label: "Add dealer", href: "/admin/dealers?create=1" },
  { label: "Create invoice", href: "/admin/billing?create=1" },
  { label: "New stock transfer", href: "/admin/warehouse?create=1" },
  { label: "Request report", href: "/admin/reports?create=1" },
] as const;
