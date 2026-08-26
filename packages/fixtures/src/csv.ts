import { isFormattedNumber } from "./formatted";
import type { CellValue, Sheet } from "./model";

export type CsvOptions = {
  delimiter?: string;
  eol?: string;
  bom?: boolean;
  quoteAll?: boolean;
  header?: boolean;
};

const BOM = "﻿";

export function formatCell(value: CellValue): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (isFormattedNumber(value)) {
    return value.text;
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return String(value);
}

function needsQuote(field: string, delimiter: string): boolean {
  return (
    field.includes(delimiter) ||
    field.includes('"') ||
    field.includes("\n") ||
    field.includes("\r")
  );
}

export function toCsv(sheet: Sheet, options: CsvOptions = {}): string {
  const delimiter = options.delimiter ?? ",";
  const eol = options.eol ?? "\n";
  const source: CellValue[][] =
    options.header === false
      ? [...sheet.rows]
      : [...sheet.preamble, sheet.header, ...sheet.rows];

  const lines = source.map((row) => {
    return row
      .map((cell) => {
        const field = formatCell(cell);
        if (options.quoteAll || needsQuote(field, delimiter)) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      })
      .join(delimiter);
  });

  return `${options.bom ? BOM : ""}${lines.join(eol)}${eol}`;
}
