import { describe, expect, it } from "vitest";
import { defineFixture, renderFixture } from "../define";
import { constant, seq } from "../generators";
import { sheet } from "../sheet";

const one = defineFixture({
  name: "harbour-lane",
  sheets: [
    sheet("Shipments", {
      rows: 3,
      columns: { "Tracking No": seq("HL-{n:06}") },
    }),
  ],
  outputs: ["csv", "xlsx"],
});

const many = defineFixture({
  name: "two-desks",
  sheets: [
    sheet("Team A", { rows: 2, columns: { Name: constant("a") } }),
    sheet("Team B", { rows: 2, columns: { Name: constant("b") } }),
  ],
  outputs: ["csv", "tsv", "xlsx"],
});

describe("renderFixture", () => {
  it("names a single-sheet CSV after the fixture", () => {
    const paths = renderFixture(one).map((file) => {
      return file.path;
    });
    expect(paths).toEqual([
      "harbour-lane/harbour-lane.csv",
      "harbour-lane/harbour-lane.xlsx",
    ]);
  });

  it("suffixes a CSV per sheet when there are several", () => {
    const paths = renderFixture(many).map((file) => {
      return file.path;
    });
    expect(paths).toContain("two-desks/two-desks--team-a.csv");
    expect(paths).toContain("two-desks/two-desks--team-b.tsv");
    expect(paths).toContain("two-desks/two-desks.xlsx");
  });

  it("writes one xlsx holding every sheet", () => {
    const xlsx = renderFixture(many).filter((file) => {
      return file.path.endsWith(".xlsx");
    });
    expect(xlsx).toHaveLength(1);
  });

  it("uses a tab delimiter for tsv", () => {
    const tsv = renderFixture(many).find((file) => {
      return file.path.endsWith("--team-a.tsv");
    });
    expect(new TextDecoder().decode(tsv?.bytes)).toContain("Name\n");
  });

  it("renders the same bytes twice", () => {
    const first = renderFixture(one);
    const second = renderFixture(one);
    expect([...(first[1]?.bytes ?? [])]).toEqual([...(second[1]?.bytes ?? [])]);
  });

  it("rejects a fixture with no sheets", () => {
    expect(() => {
      return defineFixture({ name: "empty", sheets: [], outputs: ["csv"] });
    }).toThrow(/no sheets/);
  });
});

const encoded = defineFixture({
  name: "two-tills",
  sheets: [
    sheet("Old", { rows: 1, columns: { Name: constant("Böll") } }),
    sheet("New", { rows: 1, columns: { Name: constant("Ōe") } }),
  ],
  outputs: ["csv"],
  csvFiles: [
    { suffix: "old", parts: [{ sheet: "Old", encoding: "windows-1252" }] },
    { suffix: "new", parts: [{ sheet: "New", bom: true }] },
    {
      suffix: "merged",
      parts: [
        { sheet: "New", bom: true },
        { sheet: "Old", encoding: "windows-1252", header: false },
      ],
    },
  ],
});

describe("renderFixture with csvFiles", () => {
  const files = renderFixture(encoded);
  const byPath = new Map(
    files.map((file) => {
      return [file.path, file.bytes];
    }),
  );

  it("names one file per entry and writes no per-sheet csv", () => {
    expect([...byPath.keys()]).toEqual([
      "two-tills/two-tills--old.csv",
      "two-tills/two-tills--new.csv",
      "two-tills/two-tills--merged.csv",
    ]);
  });

  it("encodes a part in the encoding it names", () => {
    const old = byPath.get("two-tills/two-tills--old.csv") as Uint8Array;
    expect(Array.from(old)).toContain(0xf6);
    expect(new TextDecoder("windows-1252").decode(old)).toContain("Böll");
  });

  it("puts the byte order mark in front of the part that asks for it", () => {
    const fresh = byPath.get("two-tills/two-tills--new.csv") as Uint8Array;
    expect(Array.from(fresh.slice(0, 3))).toEqual([0xef, 0xbb, 0xbf]);
  });

  it("concatenates parts and drops the second header", () => {
    const merged = byPath.get("two-tills/two-tills--merged.csv") as Uint8Array;
    const text = new TextDecoder("windows-1252").decode(merged);
    expect(text.match(/Name/g)).toHaveLength(1);
    expect(text).toContain("Böll");
  });

  it("refuses csvFiles without a csv output", () => {
    expect(() => {
      return defineFixture({
        name: "no-csv",
        sheets: [sheet("Old", { rows: 1, columns: { Name: constant("a") } })],
        outputs: ["xlsx"],
        csvFiles: [{ suffix: "old", parts: [{ sheet: "Old" }] }],
      });
    }).toThrow(/csvFiles without a csv output/);
  });

  it("refuses a part naming a sheet that does not exist", () => {
    expect(() => {
      return defineFixture({
        name: "wrong-sheet",
        sheets: [sheet("Old", { rows: 1, columns: { Name: constant("a") } })],
        outputs: ["csv"],
        csvFiles: [{ suffix: "old", parts: [{ sheet: "Missing" }] }],
      });
    }).toThrow(/no sheet named "Missing"/);
  });
});
