import type { Generator, PartialRow } from "./generators";
import type { CellValue, Sheet } from "./model";
import { createRng } from "./random";

export type Override = {
  at: number;
  $ragged?: number;
  $extra?: CellValue[];
} & Record<string, CellValue | CellValue[] | undefined>;

export type SheetSpec = {
  rows: number;
  seed?: number;
  preamble?: CellValue[][];
  merges?: string[];
  columns: Record<string, Generator>;
  overrides?: Override[];
};

const RESERVED = new Set(["at", "$ragged", "$extra"]);

export function sheet(name: string, spec: SheetSpec): Sheet {
  const header = Object.keys(spec.columns);
  const rng = createRng(spec.seed ?? 1);

  const overrides = new Map<number, Override>();
  for (const override of spec.overrides ?? []) {
    if (override.at < 0 || override.at >= spec.rows) {
      throw new Error(
        `Sheet "${name}": override at ${override.at} is outside 0..${spec.rows - 1}`,
      );
    }
    for (const key of Object.keys(override)) {
      if (!RESERVED.has(key) && !header.includes(key)) {
        throw new Error(
          `Sheet "${name}": override names unknown column "${key}"`,
        );
      }
    }
    overrides.set(override.at, override);
  }

  const rows: CellValue[][] = [];
  for (let index = 0; index < spec.rows; index++) {
    const partial: PartialRow = {};
    for (const column of header) {
      partial[column] = (spec.columns[column] as Generator)(
        rng,
        index,
        partial,
      );
    }

    const override = overrides.get(index);
    if (override) {
      for (const [key, value] of Object.entries(override)) {
        if (!RESERVED.has(key)) {
          partial[key] = value as CellValue;
        }
      }
    }

    let row = header.map((column) => {
      return partial[column] ?? null;
    });
    if (override?.$ragged !== undefined) {
      row = row.slice(0, override.$ragged);
    }
    if (override?.$extra) {
      row = [...row, ...override.$extra];
    }
    rows.push(row);
  }

  return {
    name,
    preamble: spec.preamble ?? [],
    header,
    rows,
    merges: spec.merges ?? [],
  };
}
