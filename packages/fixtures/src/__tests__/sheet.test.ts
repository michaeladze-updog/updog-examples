import { describe, expect, it } from "vitest";
import { constant, number, seq } from "../generators";
import { sheet } from "../sheet";

const spec = {
  rows: 5,
  seed: 7,
  columns: {
    "Tracking No": seq("HL-{n:06}"),
    Carrier: constant("DHL"),
    "Weight (kg)": number(1, 100, { decimals: 2 }),
  },
};

describe("sheet", () => {
  it("takes the header from the column order", () => {
    expect(sheet("Shipments", spec).header).toEqual([
      "Tracking No",
      "Carrier",
      "Weight (kg)",
    ]);
  });

  it("generates the requested number of rows", () => {
    expect(sheet("Shipments", spec).rows).toHaveLength(5);
  });

  it("repeats itself for the same seed", () => {
    expect(sheet("Shipments", spec).rows).toEqual(
      sheet("Shipments", spec).rows,
    );
  });

  it("keeps the preamble above the header", () => {
    const result = sheet("Shipments", {
      ...spec,
      preamble: [["Harbour Lane Logistics"], ["Exported 2026-06-30"], []],
    });
    expect(result.preamble).toEqual([
      ["Harbour Lane Logistics"],
      ["Exported 2026-06-30"],
      [],
    ]);
    expect(result.rows).toHaveLength(5);
  });

  it("applies a cell override to the addressed row", () => {
    const result = sheet("Shipments", {
      ...spec,
      overrides: [{ at: 2, "Weight (kg)": "" }],
    });
    expect(result.rows[2]?.[2]).toBe("");
    expect(result.rows[2]?.[0]).toBe("HL-000003");
  });

  it("leaves the random stream untouched when overriding", () => {
    const plain = sheet("Shipments", spec);
    const overridden = sheet("Shipments", {
      ...spec,
      overrides: [{ at: 0, "Weight (kg)": "" }],
    });
    expect(overridden.rows[4]).toEqual(plain.rows[4]);
  });

  it("truncates a ragged row", () => {
    const result = sheet("Shipments", {
      ...spec,
      overrides: [{ at: 1, $ragged: 2 }],
    });
    expect(result.rows[1]).toHaveLength(2);
  });

  it("appends cells past the header", () => {
    const result = sheet("Shipments", {
      ...spec,
      overrides: [{ at: 3, $extra: ["stray"] }],
    });
    expect(result.rows[3]).toHaveLength(4);
    expect(result.rows[3]?.[3]).toBe("stray");
  });

  it("rejects an override past the last row", () => {
    expect(() => {
      return sheet("Shipments", { ...spec, overrides: [{ at: 5 }] });
    }).toThrow(/outside/);
  });

  it("rejects an override naming an unknown column", () => {
    expect(() => {
      return sheet("Shipments", {
        ...spec,
        overrides: [{ at: 0, Nope: "x" }],
      });
    }).toThrow(/Nope/);
  });

  it("produces a header and no rows for rows: 0", () => {
    const result = sheet("Returns", { rows: 0, columns: spec.columns });
    expect(result.header).toHaveLength(3);
    expect(result.rows).toHaveLength(0);
  });
});
