export type FormattedNumber = {
  readonly kind: "formatted-number";
  readonly value: number;
  readonly formatCode: string;
  readonly text: string;
};

export type CellValue =
  | string
  | number
  | boolean
  | Date
  | FormattedNumber
  | null;

export type Sheet = {
  name: string;
  preamble: CellValue[][];
  header: CellValue[];
  rows: CellValue[][];
  /** A1-style ranges, 1-based over the rendered sheet (preamble, header, rows). */
  merges?: string[];
};

export type Workbook = {
  sheets: Sheet[];
};
