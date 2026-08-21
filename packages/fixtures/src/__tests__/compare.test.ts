import { describe, expect, it } from "vitest";
import { compare } from "../compare";
import type { FixtureFile } from "../define";

const expected: FixtureFile[] = [
  { path: "a/a.csv", bytes: new Uint8Array([1, 2, 3]) },
];

describe("compare", () => {
  it("reports nothing when the bytes match", () => {
    const actual = new Map([["a/a.csv", new Uint8Array([1, 2, 3])]]);
    expect(compare(expected, actual)).toEqual([]);
  });

  it("reports a missing file", () => {
    expect(compare(expected, new Map())).toEqual([
      { path: "a/a.csv", reason: "missing on disk" },
    ]);
  });

  it("reports a size mismatch", () => {
    const actual = new Map([["a/a.csv", new Uint8Array([1, 2])]]);
    expect(compare(expected, actual)[0]?.reason).toBe(
      "3 bytes expected, 2 on disk",
    );
  });

  it("reports the first differing byte", () => {
    const actual = new Map([["a/a.csv", new Uint8Array([1, 9, 3])]]);
    expect(compare(expected, actual)[0]?.reason).toBe("differs at byte 1");
  });

  it("reports a file with no counterpart", () => {
    const actual = new Map([
      ["a/a.csv", new Uint8Array([1, 2, 3])],
      ["a/stale.csv", new Uint8Array([0])],
    ]);
    expect(compare(expected, actual)).toEqual([
      { path: "a/stale.csv", reason: "no longer generated" },
    ]);
  });
});
