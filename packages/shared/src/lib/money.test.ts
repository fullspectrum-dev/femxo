import { describe, expect, it } from "vitest";
import { discountPercent, formatINR } from "./money";

describe("formatINR (amounts are integer paise)", () => {
  it("drops .00 on whole rupees", () => {
    expect(formatINR(18500)).toBe("₹185");
  });

  it("keeps two decimals when there are paise", () => {
    expect(formatINR(1850050)).toBe("₹18,500.50");
  });

  it("uses Indian digit grouping", () => {
    expect(formatINR(1240000000)).toBe("₹1,24,00,000");
  });

  it("formats zero", () => {
    expect(formatINR(0)).toBe("₹0");
  });

  it("rejects non-integer paise, so rupee/paise mix-ups fail loudly", () => {
    expect(() => formatINR(185.5)).toThrow(/paise/);
  });
});

describe("discountPercent", () => {
  it("rounds down, so a discount is never overstated", () => {
    expect(discountPercent(64900, 55200)).toBe(14); // 14.95%
  });

  it("is 0 when there is no discount or no MRP", () => {
    expect(discountPercent(18500, 18500)).toBe(0);
    expect(discountPercent(0, 0)).toBe(0);
    expect(discountPercent(18500, 19000)).toBe(0);
  });
});
