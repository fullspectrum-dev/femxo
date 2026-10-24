/**
 * GST inside a GST-inclusive amount (paise), split into CGST + SGST for
 * intra-state (Bihar) supply. Rounded so taxable + CGST + SGST is exactly
 * the amount: no paisa is created or lost.
 */
export function gstIncluded(amount: number, rateBps: number) {
  const taxable = Math.round((amount * 10_000) / (10_000 + rateBps));
  const gst = amount - taxable;
  const cgst = Math.floor(gst / 2);
  return { taxable, cgst, sgst: gst - cgst, gst };
}
