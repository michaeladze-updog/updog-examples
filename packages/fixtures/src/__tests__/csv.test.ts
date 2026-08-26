import { describe, expect, it } from "vitest";
import { toCsv } from "../csv";
import type { Sheet } from "../model";

const base: Sheet = {
  name: "Shipments",
  preamble: [],
  header: ["Tracking No", "Carrier"],
  rows: [
    ["HL-000001", "DHL"],
    ["HL-000002", "UPS"],
  ],
};

describe("toCsv", () => {
  it("writes the header then the rows", () => {
    expect(toCsv(base)).toBe(
      "Tracking No,Carrier\nHL-000001,DHL\nHL-000002,UPS\n",
    );
  });

  it("writes the preamble above the header", () => {
    const result = toCsv({
      ...base,
      preamble: [["Harbour Lane Logistics"], []],
    });
    expect(result.split("\n").slice(0, 3)).toEqual([
      "Harbour Lane Logistics",
      "",
      "Tracking No,Carrier",
    ]);
  });

  it("quotes a field holding the delimiter", () => {
    const result = toCsv({ ...base, rows: [["a,b", "DHL"]] });
    expect(result).toContain('"a,b",DHL');
  });

  it("doubles inner quotes", () => {
    const result = toCsv({ ...base, rows: [['say "hi"', "DHL"]] });
    expect(result).toContain('"say ""hi""",DHL');
  });

  it("quotes a field holding a newline", () => {
    const result = toCsv({ ...base, rows: [["line1\nline2", "DHL"]] });
    expect(result).toContain('"line1\nline2",DHL');
  });

  it("quotes everything when asked", () => {
    const result = toCsv(base, { quoteAll: true });
    expect(result.startsWith('"Tracking No","Carrier"')).toBe(true);
  });

  it("honours a custom delimiter and eol", () => {
    const result = toCsv(base, { delimiter: "\t", eol: "\r\n" });
    expect(result).toContain("HL-000001\tDHL\r\n");
  });

  it("prefixes a BOM when asked", () => {
    expect(toCsv(base, { bom: true }).charCodeAt(0)).toBe(0xfeff);
  });

  it("writes null and empty string as empty fields", () => {
    const result = toCsv({ ...base, rows: [[null, ""]] });
    expect(result).toContain("\n,\n");
  });

  it("writes a date as an ISO day", () => {
    const result = toCsv({
      ...base,
      rows: [[new Date(Date.UTC(2026, 2, 4)), "DHL"]],
    });
    expect(result).toContain("2026-03-04,DHL");
  });

  it("keeps a ragged row ragged", () => {
    const result = toCsv({ ...base, rows: [["only"]] });
    expect(result).toContain("\nonly\n");
  });
  it("drops the preamble and the header when asked", () => {
    const result = toCsv(
      { ...base, preamble: [["Cawdray Books"], []] },
      { header: false },
    );
    expect(result).toBe("HL-000001,DHL\nHL-000002,UPS\n");
  });
});
