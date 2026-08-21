import { describe, expect, it } from "vitest";
import type { Sheet } from "../../model";
import { StringTable } from "../sharedStrings";
import { columnName, toSerial, worksheetXml } from "../worksheet";

const strings = () => {
  return new StringTable();
};

const base: Sheet = {
  name: "Shipments",
  preamble: [],
  header: ["Tracking No", "Carrier"],
  rows: [["HL-000001", "DHL"]],
};

describe("columnName", () => {
  it("counts A..Z then AA", () => {
    expect(columnName(0)).toBe("A");
    expect(columnName(25)).toBe("Z");
    expect(columnName(26)).toBe("AA");
    expect(columnName(27)).toBe("AB");
    expect(columnName(701)).toBe("ZZ");
    expect(columnName(702)).toBe("AAA");
  });
});

describe("toSerial", () => {
  it("maps the Excel epoch and known dates", () => {
    expect(toSerial(new Date(Date.UTC(1900, 0, 1)))).toBe(2);
    expect(toSerial(new Date(Date.UTC(2026, 2, 4)))).toBe(46085);
  });
});

describe("worksheetXml", () => {
  it("declares a dimension covering header and rows", () => {
    expect(worksheetXml(base, strings())).toContain('<dimension ref="A1:B2"/>');
  });

  it("counts preamble rows in the dimension", () => {
    const sheet = { ...base, preamble: [["Harbour Lane"], []] };
    expect(worksheetXml(sheet, strings())).toContain(
      '<dimension ref="A1:B4"/>',
    );
  });

  it("widens the dimension for a row wider than the header", () => {
    const sheet = { ...base, rows: [["HL-000001", "DHL", "stray"]] };
    expect(worksheetXml(sheet, strings())).toContain(
      '<dimension ref="A1:C2"/>',
    );
  });

  it("writes a string cell as a shared-string reference", () => {
    const table = strings();
    const xml = worksheetXml(base, table);
    expect(xml).toContain('<c r="A1" t="s"><v>0</v></c>');
    expect(table.toXml()).toContain("Tracking No");
  });

  it("writes a number cell untyped", () => {
    const sheet = { ...base, rows: [[42.5, "DHL"]] };
    expect(worksheetXml(sheet, strings())).toContain(
      '<c r="A2"><v>42.5</v></c>',
    );
  });

  it("writes a boolean cell", () => {
    const sheet = { ...base, rows: [[true, false]] };
    const xml = worksheetXml(sheet, strings());
    expect(xml).toContain('<c r="A2" t="b"><v>1</v></c>');
    expect(xml).toContain('<c r="B2" t="b"><v>0</v></c>');
  });

  it("writes a date as a styled serial", () => {
    const sheet = { ...base, rows: [[new Date(Date.UTC(2026, 2, 4)), "DHL"]] };
    expect(worksheetXml(sheet, strings())).toContain(
      '<c r="A2" s="1"><v>46085</v></c>',
    );
  });

  it("omits null and empty-string cells", () => {
    const sheet = { ...base, rows: [[null, ""]] };
    expect(worksheetXml(sheet, strings())).toContain('<row r="2"></row>');
  });

  it("keeps a short row short", () => {
    const sheet = { ...base, rows: [["only"]] };
    expect(worksheetXml(sheet, strings())).not.toContain('r="B2"');
  });
});
