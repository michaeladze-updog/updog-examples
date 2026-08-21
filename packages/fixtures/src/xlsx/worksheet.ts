import { isFormattedNumber } from "../formatted";
import type { CellValue, Sheet } from "../model";
import type { StringTable } from "./sharedStrings";
import { FormatTable, STYLE_DATE } from "./styles";

const DAY = 86400000;
const EXCEL_EPOCH = Date.UTC(1899, 11, 30);

export function columnName(index: number): string {
  let remaining = index + 1;
  let name = "";
  while (remaining > 0) {
    const digit = (remaining - 1) % 26;
    name = String.fromCharCode(65 + digit) + name;
    remaining = Math.floor((remaining - 1) / 26);
  }
  return name;
}

export function toSerial(value: Date): number {
  const utcMidnight = Date.UTC(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate(),
  );
  return (utcMidnight - EXCEL_EPOCH) / DAY;
}

function cellXml(
  value: CellValue,
  ref: string,
  strings: StringTable,
  formats: FormatTable,
): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  if (value instanceof Date) {
    return `<c r="${ref}" s="${STYLE_DATE}"><v>${toSerial(value)}</v></c>`;
  }
  if (isFormattedNumber(value)) {
    const style = formats.styleFor(value.formatCode);
    return `<c r="${ref}" s="${style}"><v>${value.value}</v></c>`;
  }
  if (typeof value === "number") {
    return `<c r="${ref}"><v>${value}</v></c>`;
  }
  if (typeof value === "boolean") {
    return `<c r="${ref}" t="b"><v>${value ? 1 : 0}</v></c>`;
  }
  return `<c r="${ref}" t="s"><v>${strings.intern(value)}</v></c>`;
}

export function worksheetXml(
  sheet: Sheet,
  strings: StringTable,
  formats: FormatTable = new FormatTable(),
): string {
  const source: CellValue[][] = [
    ...sheet.preamble,
    sheet.header,
    ...sheet.rows,
  ];

  const width = source.reduce((widest, row) => {
    return Math.max(widest, row.length);
  }, 1);
  const ref = `A1:${columnName(width - 1)}${Math.max(source.length, 1)}`;

  const body = source
    .map((row, rowIndex) => {
      const cells = row
        .map((value, columnIndex) => {
          return cellXml(
            value,
            `${columnName(columnIndex)}${rowIndex + 1}`,
            strings,
            formats,
          );
        })
        .join("");
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join("");

  const merges = sheet.merges ?? [];
  const mergeCells = merges.length
    ? `<mergeCells count="${merges.length}">${merges
        .map((range) => {
          return `<mergeCell ref="${range}"/>`;
        })
        .join("")}</mergeCells>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="${ref}"/><sheetData>${body}</sheetData>${mergeCells}</worksheet>`;
}
