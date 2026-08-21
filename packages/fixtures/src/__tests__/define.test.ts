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
