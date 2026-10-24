import type { PriceBreakup } from "../../contracts/commerce";
import { gstIncluded } from "../../lib/gst";

/** ₹40 delivery below ₹499 of items; free above, and always free for Prime (P1 #9). */
export const DELIVERY_FEE = 4000;
export const FREE_DELIVERY_FROM = 49900;

export interface PricedLine {
  mrp: number;
  price: number;
  primePrice: number;
  gstBps: number;
  quantity: number;
}

/**
 * The bill for some lines (paise, GST-inclusive). One function for carts,
 * checkout and seeded orders, so every total in the demo agrees.
 */
export function priceLines(lines: readonly PricedLine[], { member, couponDiscount = 0 }: { member: boolean; couponDiscount?: number }): PriceBreakup {
  let mrpTotal = 0;
  let discount = 0;
  let primeSavings = 0;
  let cgst = 0;
  let sgst = 0;

  for (const line of lines) {
    const unit = member ? line.primePrice : line.price;
    mrpTotal += line.mrp * line.quantity;
    discount += (line.mrp - line.price) * line.quantity;
    if (member) primeSavings += (line.price - line.primePrice) * line.quantity;
    const tax = gstIncluded(unit * line.quantity, line.gstBps);
    cgst += tax.cgst;
    sgst += tax.sgst;
  }

  const itemsTotal = mrpTotal - discount - primeSavings;
  const coupon = Math.min(Math.max(0, couponDiscount), itemsTotal);
  const payableItems = itemsTotal - coupon;
  const delivery = lines.length === 0 || member || payableItems >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
  const deliverySaved = lines.length > 0 && delivery === 0 ? DELIVERY_FEE : 0;

  return {
    mrpTotal,
    discount,
    primeSavings,
    couponDiscount: coupon,
    delivery,
    total: payableItems + delivery,
    gstIncluded: { cgst, sgst },
    youSave: discount + primeSavings + coupon + deliverySaved,
  };
}
