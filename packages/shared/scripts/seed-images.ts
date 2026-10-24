/*
 * Generates the demo product, category and banner images from the seed:
 * a simple illustrated packshot per product (no real brand artwork),
 * rasterised to WebP so next/image serves real AVIF/WebP at every size.
 *
 *   pnpm --filter @femxo/shared seed:images
 *
 * The output is committed (apps/web-customer/public), so builds never
 * depend on running this.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { buildCatalog } from "../src/mock/seed";

const OUT = join(import.meta.dirname, "../../../apps/web-customer/public");

const HUE: Record<string, number> = {
  staples: 38, "edible-oil": 48, pulses: 20, snacks: 8, beverages: 200, "personal-care": 310, "home-care": 175, seasonal: 280,
};
const SHAPE: Record<string, "bag" | "bottle" | "box" | "tube"> = {
  staples: "bag", "edible-oil": "bottle", pulses: "bag", snacks: "box", beverages: "bottle", "personal-care": "tube", "home-care": "bottle", seasonal: "box",
};

const esc = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function wrap(text: string, max: number) {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(" ")) {
    if ((current + " " + word).trim().length > max) {
      lines.push(current);
      current = word;
    } else current = (current + " " + word).trim();
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function pack(shape: "bag" | "bottle" | "box" | "tube", hue: number) {
  const body = `hsl(${hue} 55% 46%)`;
  const dark = `hsl(${hue} 55% 34%)`;
  if (shape === "bottle")
    return `<rect x="335" y="130" width="130" height="70" rx="14" fill="${dark}"/><rect x="290" y="190" width="220" height="460" rx="46" fill="${body}"/>`;
  if (shape === "tube")
    return `<path d="M300 150h200l24 60H276z" fill="${dark}"/><rect x="276" y="205" width="248" height="430" rx="30" fill="${body}"/>`;
  if (shape === "box") return `<rect x="250" y="170" width="300" height="470" rx="22" fill="${body}"/><rect x="250" y="170" width="300" height="70" rx="22" fill="${dark}"/>`;
  return `<path d="M270 180q130-50 260 0l30 450q-160 40-320 0z" fill="${body}"/><path d="M270 180q130-50 260 0v34q-130-40-260 0z" fill="${dark}"/>`;
}

function packshot(name: string, brand: string, categorySlug: string) {
  const hue = HUE[categorySlug] ?? 280;
  const lines = wrap(name.replace(brand, "").trim(), 16);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
<defs><radialGradient id="bg" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="hsl(${hue} 60% 96%)"/><stop offset="1" stop-color="hsl(${hue} 45% 86%)"/></radialGradient></defs>
<rect width="800" height="800" fill="url(#bg)"/>
<ellipse cx="400" cy="672" rx="200" ry="22" fill="rgba(18,7,31,.12)"/>
${pack(SHAPE[categorySlug] ?? "box", hue)}
<rect x="300" y="360" width="200" height="190" rx="14" fill="#fffaf4"/>
<text x="400" y="395" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="700" fill="hsl(${hue} 55% 30%)">${esc(brand.toUpperCase())}</text>
${lines.map((line, index) => `<text x="400" y="${432 + index * 30}" text-anchor="middle" font-family="Arial,sans-serif" font-size="25" font-weight="700" fill="#12071f">${esc(line)}</text>`).join("")}
</svg>`;
}

const flat = (hue: number, title: string, width: number, height: number, subtitle = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="hsl(${hue} 50% 40%)"/><text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-family="Arial,sans-serif" font-size="${Math.round(height / 9)}" font-weight="700" fill="#fff">${esc(title)}</text><text x="${width / 2}" y="${height / 2 + height / 8}" text-anchor="middle" font-family="Arial,sans-serif" font-size="${Math.round(height / 18)}" fill="rgba(255,255,255,.85)">${esc(subtitle)}</text></svg>`;

async function save(dir: string, file: string, svg: string) {
  await mkdir(join(OUT, dir), { recursive: true });
  await writeFile(join(OUT, dir, file), await sharp(Buffer.from(svg)).webp({ quality: 78 }).toBuffer());
}

const catalog = buildCatalog();
const brandName = (id: string) => catalog.brands.find((brand) => brand.id === id)!.name;
const topSlug = (id: string) => catalog.categories.find((category) => category.id === id)!.slug;

for (const product of catalog.products) await save("products", `${product.slug}.webp`, packshot(product.name, brandName(product.brandId), topSlug(product.topCategoryId)));
for (const category of catalog.categories.filter((entry) => entry.parentId === null)) await save("categories", `${category.slug}.webp`, flat(HUE[category.slug] ?? 280, category.name, 600, 400));
for (const banner of catalog.banners) await save("banners", `${banner.href.split("/").pop() || "home"}.webp`, flat(HUE[banner.href.split("/").pop() ?? ""] ?? 275, banner.title, 1200, 400, banner.subtitle));

console.log(`Wrote ${catalog.products.length} product, 8 category and ${catalog.banners.length} banner images to ${OUT}`);
