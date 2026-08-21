import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { constant, custom, date, number, seq } from "../../generators";
import { padded } from "../../formatted";
import type { Workbook } from "../../model";
import { sheet } from "../../sheet";
import { sheetName, toXlsx } from "../index";

const build = (rows: number): Workbook => {
  return {
    sheets: [
      sheet("Shipments", {
        rows,
        seed: 7,
        preamble: [["Harbour Lane Logistics"], ["Exported 2026-06-30"], []],
        columns: {
          "Tracking No": seq("HL-{n:06}"),
          "Ship Date": date("2026-01-01", "2026-06-30"),
          "Weight (kg)": number(0.4, 380, { decimals: 2 }),
          Carrier: constant("DHL"),
        },
      }),
      sheet("Returns", { rows: 0, columns: { Reason: constant("") } }),
    ],
  };
};

const read = (bytes: Uint8Array, sheetRows?: number) => {
  return XLSX.read(bytes, { type: "array", cellDates: true, sheetRows });
};

describe("toXlsx", () => {
  it("keeps sheet names and their order", () => {
    const book = read(toXlsx(build(10)));
    expect(book.SheetNames).toEqual(["Shipments", "Returns"]);
  });

  it("reports the full range from a capped read", () => {
    const book = read(toXlsx(build(200)), 50);
    const worksheet = book.Sheets.Shipments;
    expect(worksheet?.["!fullref"]).toBe("A1:D204");
    expect(worksheet?.["!ref"]).toBe("A1:D50");
  });

  it("declares a dimension on an uncapped read too", () => {
    const book = read(toXlsx(build(200)));
    expect(book.Sheets.Shipments?.["!ref"]).toBe("A1:D204");
  });

  it("reads a date cell back as a Date", () => {
    const book = read(toXlsx(build(10)));
    expect(book.Sheets.Shipments?.B5?.v).toBeInstanceOf(Date);
  });

  it("reads a decimal cell back as a number", () => {
    const book = read(toXlsx(build(10)));
    expect(typeof book.Sheets.Shipments?.C5?.v).toBe("number");
  });

  it("puts the header on the row after the preamble", () => {
    const book = read(toXlsx(build(10)));
    expect(book.Sheets.Shipments?.A4?.v).toBe("Tracking No");
  });

  it("produces identical bytes on repeated runs", () => {
    expect([...toXlsx(build(50))]).toEqual([...toXlsx(build(50))]);
  });

  it("keeps an empty sheet readable", () => {
    const book = read(toXlsx(build(10)));
    expect(book.SheetNames).toContain("Returns");
  });
});

describe("sheetName", () => {
  it("trims to 31 characters", () => {
    expect(sheetName("x".repeat(40), new Set())).toHaveLength(31);
  });

  it("replaces characters Excel forbids", () => {
    expect(sheetName("a[b]c:d*e?f/g\\h", new Set())).toBe("a_b_c_d_e_f_g_h");
  });

  it("disambiguates a collision", () => {
    const taken = new Set(["Sheet"]);
    expect(sheetName("Sheet", taken)).toBe("Sheet~2");
  });
});

describe("a numeric cell with a display format", () => {
  const book = (): Workbook => {
    return {
      sheets: [
        sheet("Stock", {
          rows: 2,
          columns: {
            "Stock code": custom((_rng, index) => {
              return padded(417 + index, 5);
            }),
            "Pack qty": constant(12),
          },
        }),
      ],
    };
  };

  it("stores the bare number in the file", () => {
    const parsed = read(toXlsx(book()));
    expect(parsed.Sheets.Stock?.A2?.v).toBe(417);
    expect(parsed.Sheets.Stock?.A2?.t).toBe("n");
  });

  it("reads back the padded text a person would see", () => {
    const parsed = read(toXlsx(book()));
    expect(parsed.Sheets.Stock?.A2?.w).toBe("00417");
    expect(parsed.Sheets.Stock?.A3?.w).toBe("00418");
  });

  it("leaves a General cell showing no padding", () => {
    const parsed = read(toXlsx(book()));
    expect(parsed.Sheets.Stock?.B2?.w).toBe("12");
  });
});
