import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { OrderDetail, OrderStatus, ProductDetail, ProductSummary } from "../../contracts";
import { toProductDetail, toProductSummary } from "../domain/mappers";
import { buildCatalog, buildInitialState, SEARCH_SYNONYMS } from "./index";

/** FNV-1a: a small stable hash, to notice any accidental change to the seed. */
function hash(value: unknown) {
  let h = 0x811c9dc5;
  for (const char of JSON.stringify(value)) {
    h ^= char.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16);
}

const catalog = buildCatalog();
const NOW = new Date("2026-10-24T10:00:00+05:30");
const state = buildInitialState(catalog, NOW);

describe("catalogue seed", () => {
  it("is identical on every build (fixed seed), and changes only on purpose", () => {
    expect(hash(buildCatalog())).toBe(hash(catalog));
    expect(hash(catalog)).toMatchSnapshot();
  });

  it("has the planned size: 8 top categories, ~30 subcategories, ~25 brands, ~200 products", () => {
    const top = catalog.categories.filter((category) => category.parentId === null);
    expect(top).toHaveLength(8);
    expect(catalog.categories.length - top.length).toBeGreaterThanOrEqual(28);
    expect(catalog.brands.length).toBeGreaterThanOrEqual(20);
    expect(catalog.products.length).toBeGreaterThanOrEqual(180);
    expect(catalog.products.length).toBeLessThanOrEqual(230);
  });

  it("maps every product to valid contract objects (MRP ≥ price ≥ Prime price included)", () => {
    for (const product of catalog.products) {
      expect(ProductSummary.safeParse(toProductSummary(product, catalog)).success, product.slug).toBe(true);
      const detail = ProductDetail.safeParse(toProductDetail(product, catalog, NOW));
      expect(detail.success, `${product.slug}: ${detail.success ? "" : detail.error.message}`).toBe(true);
    }
  });

  it("gives every subcategory at least 3 products, with unique slugs and SKUs", () => {
    const subcategories = catalog.categories.filter((category) => category.parentId !== null);
    for (const sub of subcategories) {
      expect(catalog.products.filter((product) => product.categoryId === sub.id).length, sub.slug).toBeGreaterThanOrEqual(3);
    }
    const slugs = catalog.products.map((product) => product.slug);
    const skus = catalog.products.flatMap((product) => product.variants.map((variant) => variant.sku));
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(skus).size).toBe(skus.length);
  });

  it("includes low-stock and out-of-stock variants, so those states can be demoed", () => {
    const stocks = catalog.products.flatMap((product) => product.variants.map((variant) => variant.stock));
    expect(stocks.some((stock) => stock === 0)).toBe(true);
    expect(stocks.filter((stock) => stock >= 1 && stock <= 3).length).toBeGreaterThanOrEqual(3);
  });

  it("uses only the GST rates the company allows (0 / 5 / 18 / 40%)", () => {
    const rates = new Set(catalog.products.flatMap((product) => product.variants.map((variant) => variant.gstBps)));
    for (const rate of rates) expect([0, 500, 1800, 4000]).toContain(rate);
  });

  it("names an image for every product, and every image file exists (run seed:images if not)", () => {
    const publicDir = join(import.meta.dirname, "../../../../../apps/web-customer/public");
    const missing = [
      ...catalog.products.map((product) => product.image),
      ...catalog.categories.filter((category) => category.parentId === null).map((category) => category.image),
      ...catalog.banners.map((banner) => banner.image),
    ].filter((src) => !existsSync(join(publicDir, src)));
    for (const product of catalog.products) expect(product.image).toBe(`/products/${product.slug}.webp`);
    expect(missing).toEqual([]);
  });

  it("knows common Hindi and spelling synonyms for search", () => {
    expect(SEARCH_SYNONYMS.atta).toEqual(expect.arrayContaining(["flour", "aata"]));
    expect(SEARCH_SYNONYMS.chawal).toContain("rice");
  });
});

describe("initial demo state", () => {
  it("has the five demo customers, one of them a Prime member with a birthday today", () => {
    expect(state.customers).toHaveLength(5);
    const prime = state.customers.find((customer) => customer.isPrime && state.memberships[customer.id]);
    expect(prime).toBeDefined();
    expect(prime!.birthday?.slice(5)).toBe("10-24");
  });

  it("has orders in every status, each a valid order", () => {
    const statuses = new Set(Object.values(state.orders).map((order) => order.status));
    for (const status of OrderStatus.options) expect(statuses, status).toContain(status);
    for (const order of Object.values(state.orders)) {
      const parsed = OrderDetail.safeParse(order);
      expect(parsed.success, `${order.number}: ${parsed.success ? "" : parsed.error.message}`).toBe(true);
    }
    expect(Object.keys(state.orders).length).toBeGreaterThanOrEqual(35);
  });

  it("has the six planned coupons, ~60 serviceable pincodes and a few that aren't", () => {
    expect(Object.keys(state.coupons).sort()).toEqual(["FEST25", "FLAT50", "OLD20", "PRIME15", "SAVE10", "WELCOME100"]);
    const pincodes = Object.values(state.pincodes);
    expect(pincodes.filter((pin) => pin.serviceable).length).toBeGreaterThanOrEqual(55);
    expect(pincodes.filter((pin) => !pin.serviceable).length).toBeGreaterThanOrEqual(3);
  });

  // Reviews are read-only, so they live in the static catalogue, not in browser state.
  it("has ~1,500 reviews spread across the catalogue, matching each product's rating count", () => {
    const total = Object.values(catalog.reviews).reduce((sum, list) => sum + list.length, 0);
    for (const product of catalog.products) expect(catalog.reviews[product.id]?.length ?? 0).toBe(product.ratingCount);
    expect(total).toBeGreaterThanOrEqual(1200);
    expect(total).toBeLessThanOrEqual(1800);
  });
});
