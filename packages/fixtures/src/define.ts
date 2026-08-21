import { toCsv } from "./csv";
import type { Sheet } from "./model";
import { toXlsx } from "./xlsx/index";

export type Output = "csv" | "tsv" | "xlsx";

export type Fixture = {
  name: string;
  sheets: Sheet[];
  outputs: Output[];
};

export type FixtureFile = {
  path: string;
  bytes: Uint8Array;
};

export function defineFixture(fixture: Fixture): Fixture {
  if (fixture.sheets.length === 0) {
    throw new Error(`Fixture "${fixture.name}" has no sheets`);
  }
  if (fixture.outputs.length === 0) {
    throw new Error(`Fixture "${fixture.name}" has no outputs`);
  }
  return fixture;
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function renderFixture(fixture: Fixture): FixtureFile[] {
  const encoder = new TextEncoder();
  const files: FixtureFile[] = [];
  const multiple = fixture.sheets.length > 1;

  for (const output of fixture.outputs) {
    if (output === "xlsx") {
      files.push({
        path: `${fixture.name}/${fixture.name}.xlsx`,
        bytes: toXlsx({ sheets: fixture.sheets }),
      });
      continue;
    }

    const delimiter = output === "tsv" ? "\t" : ",";
    for (const sheet of fixture.sheets) {
      const suffix = multiple ? `--${slug(sheet.name)}` : "";
      files.push({
        path: `${fixture.name}/${fixture.name}${suffix}.${output}`,
        bytes: encoder.encode(toCsv(sheet, { delimiter })),
      });
    }
  }

  return files;
}
