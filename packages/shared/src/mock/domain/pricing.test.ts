import { describe, expect, it } from "vitest";
import { DELIVERY_FEE, FREE_DELIVERY_FROM, priceLines } from "./pricing";

const oil = { mrp: 19900, price: 18500, primePrice: 17200, gstBps: 500 };
const soap = { mrp: 4500, price: 4000, primePrice: 3800, gstBps: 1800 };

describe("priceLines (all amounts in paise, GST-inclusive)", () => {
  it("charges the regular price and ₹40 delivery below ₹499", () => {
    const breakup = priceLines([{ ...oil, quantity: 1 }], { member: false });
    expect(breakup).toMatchObject({ mrpTotal: 19900, discount: 1400, primeSavings: 0, couponDiscount: 0, delivery: DELIVERY_FEE, total: 18500 + 4000 });
  });

  it("delivers free from ₹499", () => {
    const breakup = priceLines([{ ...oil, quantity: 3 }], { member: false });
    expect(55500).toBeGreaterThanOrEqual(FREE_DELIVERY_FROM);
    expect(breakup).toMatchObject({ delivery: 0, total: 55500 });
  });

  it("gives Prime members the Prime price and free delivery, and counts the Prime saving separately", () => {
    const breakup = priceLines([{ ...oil, quantity: 1 }], { member: true });
    expect(breakup).toMatchObject({ discount: 1400, primeSavings: 1300, delivery: 0, total: 17200 });
  });

  it("takes the coupon off the item total, never below zero", () => {
    expect(priceLines([{ ...oil, quantity: 3 }], { member: false, couponDiscount: 5000 }).total).toBe(55500 - 5000);
    expect(priceLines([{ ...soap, quantity: 1 }], { member: false, couponDiscount: 999_999 }).couponDiscount).toBe(4000);
  });

  it("reports the GST inside the items as CGST + SGST, line by line", () => {
    const breakup = priceLines(
      [
        { ...oil, quantity: 1 },
        { ...soap, quantity: 2 },
      ],
      { member: false }
    );
    // ₹185 @5% → ₹8.81; ₹80 @18% → ₹12.20.
    expect(breakup.gstIncluded.cgst + breakup.gstIncluded.sgst).toBe(881 + 1220);
  });

  it("adds up: you save = discount + Prime saving + coupon (+ the delivery you didn't pay)", () => {
    const breakup = priceLines([{ ...oil, quantity: 1 }], { member: true, couponDiscount: 1000 });
    expect(breakup.youSave).toBe(breakup.discount + breakup.primeSavings + breakup.couponDiscount + DELIVERY_FEE);
    expect(breakup.total).toBe(breakup.mrpTotal - breakup.discount - breakup.primeSavings - breakup.couponDiscount + breakup.delivery);
  });
});
