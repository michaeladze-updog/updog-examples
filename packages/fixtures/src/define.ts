import { toCsv } from "./csv";
import type { Encoding } from "./encode";
import { UTF8_BOM, concatBytes, encodeText } from "./encode";
import type { Sheet } from "./model";
import { toXlsx } from "./xlsx/index";

export type Output = "csv" | "tsv" | "xlsx";

export type CsvPart = {
  sheet?: string;
  encoding?: Encoding;
  bom?: boolean;
  header?: boolean;
};

export type CsvFile = {
  suffix: string;
  parts: CsvPart[];
};

export type Fixture = {
  name: string;
  sheets: Sheet[];
  outputs: Output[];
  csvFiles?: CsvFile[];
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
  if (fixture.csvFiles) {
    if (!fixture.outputs.includes("csv")) {
      throw new Error(
        `Fixture "${fixture.name}" declares csvFiles without a csv output`,
      );
    }
    for (const file of fixture.csvFiles) {
      if (file.parts.length === 0) {
        throw new Error(
          `Fixture "${fixture.name}" has a csv file "${file.suffix}" with no parts`,
        );
      }
      for (const part of file.parts) {
        sheetNamed(fixture, part.sheet);
      }
    }
  }
  return fixture;
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function sheetNamed(fixture: Fixture, name?: string): Sheet {
  if (name === undefined) {
    if (fixture.sheets.length !== 1) {
      throw new Error(
        `Fixture "${fixture.name}" has ${fixture.sheets.length} sheets, so a csv part must name one`,
      );
    }
    return fixture.sheets[0];
  }
  const found = fixture.sheets.find((candidate) => {
    return candidate.name === name;
  });
  if (!found) {
    throw new Error(`Fixture "${fixture.name}" has no sheet named "${name}"`);
  }
  return found;
}

function renderCsvFile(fixture: Fixture, file: CsvFile): FixtureFile {
  const chunks: Uint8Array[] = [];
  for (const part of file.parts) {
    if (part.bom) {
      chunks.push(UTF8_BOM);
    }
    const text = toCsv(sheetNamed(fixture, part.sheet), {
      header: part.header,
    });
    chunks.push(encodeText(text, part.encoding ?? "utf-8"));
  }
  return {
    path: `${fixture.name}/${fixture.name}--${slug(file.suffix)}.csv`,
    bytes: concatBytes(chunks),
  };
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

    if (output === "csv" && fixture.csvFiles) {
      for (const file of fixture.csvFiles) {
        files.push(renderCsvFile(fixture, file));
      }
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
