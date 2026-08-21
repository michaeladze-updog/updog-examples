import type { CellValue } from "./model";
import type { Rng } from "./random";

export type PartialRow = Record<string, CellValue>;

export type Generator = (
  rng: Rng,
  rowIndex: number,
  row: PartialRow,
) => CellValue;

const SEQ_TOKEN = /\{n(?::0(\d+))?\}/g;

const DAY = 86400000;

const LOREM = [
  "harbour",
  "lane",
  "pallet",
  "crate",
  "manifest",
  "dock",
  "bay",
  "route",
  "consignment",
  "haul",
];

export function seq(pattern: string): Generator {
  return (_rng, rowIndex) => {
    return pattern.replace(SEQ_TOKEN, (_match, width?: string) => {
      const value = String(rowIndex + 1);
      return width ? value.padStart(Number(width), "0") : value;
    });
  };
}

export function constant(value: CellValue): Generator {
  return () => {
    return value;
  };
}

export function pick(values: CellValue[], weights?: number[]): Generator {
  return (rng) => {
    return rng.pick(values, weights);
  };
}

export function number(
  min: number,
  max: number,
  options: { decimals?: number } = {},
): Generator {
  const factor = 10 ** (options.decimals ?? 0);
  return (rng) => {
    return Math.round(rng.float(min, max) * factor) / factor;
  };
}

function formatDate(value: Date, pattern: string): string {
  const year = String(value.getUTCFullYear());
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return pattern
    .replace(/YYYY/g, year)
    .replace(/MM/g, month)
    .replace(/DD/g, day);
}

export function date(
  from: string,
  to: string,
  options: { as?: string } = {},
): Generator {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) {
    throw new Error(`date needs YYYY-MM-DD bounds, got "${from}".."${to}"`);
  }
  const span = Math.round((end - start) / DAY);
  return (rng) => {
    const value = new Date(start + rng.int(0, span) * DAY);
    return options.as ? formatDate(value, options.as) : value;
  };
}

export function text(words: number): Generator {
  return (rng) => {
    const parts: string[] = [];
    for (let index = 0; index < words; index++) {
      parts.push(rng.pick(LOREM));
    }
    return parts.join(" ");
  };
}

export function email(options: { from: string[]; domain?: string }): Generator {
  const domain = options.domain ?? "example.com";
  return (_rng, _rowIndex, row) => {
    const parts = options.from
      .map((key) => {
        return String(row[key] ?? "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "");
      })
      .filter(Boolean);
    return `${parts.join(".")}@${domain}`;
  };
}

export function blank(inner: Generator, probability: number): Generator {
  return (rng, rowIndex, row) => {
    return rng.bool(probability) ? null : inner(rng, rowIndex, row);
  };
}

export function custom(fn: Generator): Generator {
  return fn;
}
