/*
 * Money is integer paise everywhere (as in femxo-backend and the admin
 * panel) and only becomes rupees for display, with Indian digit grouping.
 */

const WHOLE = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const WITH_PAISE = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 18500 → "₹185", 1850050 → "₹18,500.50". */
export function formatINR(paise: number) {
  if (!Number.isInteger(paise)) throw new Error(`formatINR expects integer paise, got ${paise}.`);
  const rupees = paise / 100;
  return `₹${paise % 100 === 0 ? WHOLE.format(rupees) : WITH_PAISE.format(rupees)}`;
}

/** Whole-percent saving against MRP, rounded down so it is never overstated. */
export function discountPercent(mrp: number, price: number) {
  if (mrp <= 0 || price >= mrp) return 0;
  return Math.floor(((mrp - price) / mrp) * 100);
}
