import { describe, expect, it } from "vitest";
import { createRng } from "../random";

describe("createRng", () => {
  it("repeats its stream for the same seed", () => {
    const first = createRng(7);
    const second = createRng(7);
    const a = [first.next(), first.next(), first.next()];
    const b = [second.next(), second.next(), second.next()];
    expect(a).toEqual(b);
  });

  it("diverges for different seeds", () => {
    expect(createRng(1).next()).not.toBe(createRng(2).next());
  });

  it("stays inside the inclusive int range", () => {
    const rng = createRng(3);
    const seen = new Set<number>();
    for (let index = 0; index < 500; index++) {
      seen.add(rng.int(1, 3));
    }
    expect([...seen].sort()).toEqual([1, 2, 3]);
  });

  it("stays inside the float range", () => {
    const rng = createRng(4);
    for (let index = 0; index < 200; index++) {
      const value = rng.float(0.4, 380);
      expect(value).toBeGreaterThanOrEqual(0.4);
      expect(value).toBeLessThanOrEqual(380);
    }
  });

  it("honours pick weights", () => {
    const rng = createRng(11);
    let heavy = 0;
    for (let index = 0; index < 1000; index++) {
      if (rng.pick(["DHL", "UPS"], [0.9, 0.1]) === "DHL") {
        heavy += 1;
      }
    }
    expect(heavy).toBeGreaterThan(850);
    expect(heavy).toBeLessThan(950);
  });

  it("picks uniformly without weights", () => {
    const rng = createRng(12);
    const counts = new Map<string, number>();
    for (let index = 0; index < 900; index++) {
      const value = rng.pick(["a", "b", "c"]);
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    for (const count of counts.values()) {
      expect(count).toBeGreaterThan(230);
      expect(count).toBeLessThan(370);
    }
  });
});
