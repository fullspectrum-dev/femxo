import { describe, expect, it } from "vitest";
import { createClock } from "./clock";
import { gstIncluded } from "./gst";
import { idempotencyKey, newId } from "./ids";
import { redact } from "./logger";
import { createRng } from "./rng";

describe("gstIncluded (GST is inside the price)", () => {
  it("splits the GST in a 5% price into CGST + SGST", () => {
    // ₹185 at 5%: taxable ₹176.19, GST ₹8.81.
    expect(gstIncluded(18500, 500)).toEqual({ taxable: 17619, cgst: 440, sgst: 441, gst: 881 });
  });

  it("never loses a paisa: the parts add up to the amount", () => {
    for (const [amount, rate] of [[64900, 500], [34900, 1800], [12345, 4000], [1, 1800], [99999, 500]] as const) {
      const split = gstIncluded(amount, rate);
      expect(split.taxable + split.cgst + split.sgst).toBe(amount);
      expect(split.cgst + split.sgst).toBe(split.gst);
    }
  });

  it("is zero at 0% GST", () => {
    expect(gstIncluded(2800, 0)).toEqual({ taxable: 2800, cgst: 0, sgst: 0, gst: 0 });
  });
});

describe("createRng (seeded, for deterministic demo data)", () => {
  it("repeats the same sequence for the same seed", () => {
    const a = createRng(42);
    const b = createRng(42);
    expect(Array.from({ length: 5 }, () => a.next())).toEqual(Array.from({ length: 5 }, () => b.next()));
  });

  it("differs between seeds and stays within [0, 1)", () => {
    const a = createRng(1).next();
    const b = createRng(2).next();
    expect(a).not.toBe(b);
    const rng = createRng(7);
    for (let i = 0; i < 1000; i++) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("int() covers both ends; pick() and shuffle() use the same stream", () => {
    const rng = createRng(3);
    const seen = new Set(Array.from({ length: 500 }, () => rng.int(1, 3)));
    expect([...seen].sort()).toEqual([1, 2, 3]);
    expect(["a", "b", "c"]).toContain(createRng(5).pick(["a", "b", "c"]));
    expect(createRng(9).shuffle([1, 2, 3, 4, 5]).sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("createClock (mock time that can be fast-forwarded)", () => {
  it("follows real time plus an offset", () => {
    let real = 1_000_000;
    const clock = createClock(() => real);
    expect(clock.now()).toBe(1_000_000);
    clock.advance(7 * 24 * 3600 * 1000);
    expect(clock.now()).toBe(1_000_000 + 604_800_000);
    real += 5;
    expect(clock.now()).toBe(1_000_005 + 604_800_000);
    clock.reset();
    expect(clock.now()).toBe(1_000_005);
    expect(clock.date().getTime()).toBe(1_000_005);
  });
});

describe("ids", () => {
  it("prefixes ids and makes unique idempotency keys", () => {
    expect(newId("ord")).toMatch(/^ord-[0-9a-z]{10,}$/);
    expect(idempotencyKey()).toMatch(/^[0-9a-f-]{36}$/);
    expect(idempotencyKey()).not.toBe(idempotencyKey());
  });
});

describe("redact (no personal data in logs)", () => {
  it("masks mobile numbers and emails in text", () => {
    expect(redact("OTP sent to 9876543210 and pooja@demo.femxo.test")).toBe("OTP sent to [mobile] and [email]");
  });

  it("removes secrets by key, deeply", () => {
    expect(
      redact({ code: "123456", user: { mobile: "9876543210", name: "Pooja" }, accessToken: "abc", nested: [{ password: "x" }] })
    ).toEqual({ code: "[redacted]", user: { mobile: "[mobile]", name: "Pooja" }, accessToken: "[redacted]", nested: [{ password: "[redacted]" }] });
  });
});
