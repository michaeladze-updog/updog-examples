import { createRng, custom, defineFixture, sheet } from "../src/index";
import type { CellValue } from "../src/index";

const SITES = [
  "WYE-114",
  "WYE-118",
  "WYE-121",
  "WYE-126",
  "LUG-203",
  "LUG-207",
  "LUG-212",
  "ARR-301",
  "ARR-305",
  "DEE-402",
  "DEE-407",
  "TAF-511",
];

const DAYS = [
  2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 16, 17, 18, 19, 20, 23, 24, 25, 26, 29,
];

type Determinand = {
  code: string;
  method: string;
  min: number;
  max: number;
  decimals: number;
};

const DETERMINANDS: Determinand[] = [
  {
    code: "NO3-N",
    method: "Ion chromatography",
    min: 0.42,
    max: 11.8,
    decimals: 2,
  },
  {
    code: "PO4-P",
    method: "Colorimetric",
    min: 0.008,
    max: 0.464,
    decimals: 3,
  },
  { code: "NH4-N", method: "Colorimetric", min: 0.02, max: 1.58, decimals: 2 },
  { code: "DO", method: "Probe", min: 6.2, max: 13.4, decimals: 1 },
];

const MIDDLE_ROWS = 473;

type Reading = {
  site: string;
  day: number;
  det: Determinand;
  result: string;
  labRef: string;
};

const sampled = (day: number): string => {
  return `${String(day).padStart(2, "0")} Mar 2026`;
};

const key = (site: string, day: number, code: string): string => {
  return `${site}|${day}|${code}`;
};

const PINNED = new Set([
  key("WYE-114", 4, "NO3-N"),
  key("WYE-118", 4, "PO4-P"),
  key("WYE-118", 5, "NH4-N"),
  key("LUG-207", 5, "DO"),
  key("LUG-207", 29, "NO3-N"),
]);

const downsample = <T>(list: T[], target: number): T[] => {
  if (list.length < target) {
    throw new Error(`wye-lab-march: ${list.length} combos, needs ${target}`);
  }
  const kept: T[] = [];
  let carry = 0;
  for (const item of list) {
    carry += target;
    if (carry >= list.length) {
      carry -= list.length;
      kept.push(item);
    }
  }
  return kept;
};

const build = (): Reading[] => {
  const rng = createRng(19);
  const combos: { site: string; day: number; det: Determinand }[] = [];

  for (const day of DAYS) {
    for (const site of SITES) {
      if (rng.bool(0.12)) continue;
      for (const det of DETERMINANDS) {
        if (rng.bool(0.28)) continue;
        if (PINNED.has(key(site, day, det.code))) continue;
        combos.push({ site, day, det });
      }
    }
  }

  let ref = 8841;
  const middle = downsample(combos, MIDDLE_ROWS).map(
    ({ site, day, det }): Reading => {
      const value = rng.float(det.min, det.max).toFixed(det.decimals);
      if (det.code === "DO") {
        return { site, day, det, result: value, labRef: "" };
      }
      ref += rng.int(1, 9);
      return { site, day, det, result: value, labRef: `L-${ref}` };
    },
  );

  const nitrate = DETERMINANDS[0] as Determinand;
  const phosphate = DETERMINANDS[1] as Determinand;
  const ammonia = DETERMINANDS[2] as Determinand;
  const oxygen = DETERMINANDS[3] as Determinand;

  return [
    {
      site: "WYE-114",
      day: 4,
      det: nitrate,
      result: "6.31",
      labRef: "L-8841",
    },
    {
      site: "WYE-114",
      day: 4,
      det: nitrate,
      result: "6.90",
      labRef: "L-8902",
    },
    {
      site: "WYE-118",
      day: 4,
      det: phosphate,
      result: "<0.05",
      labRef: "L-8843",
    },
    {
      site: "WYE-118",
      day: 5,
      det: ammonia,
      result: "0.42 mg/l",
      labRef: "L-8850",
    },
    { site: "LUG-207", day: 5, det: oxygen, result: "9.8", labRef: "" },
    ...middle,
    {
      site: "LUG-207",
      day: 29,
      det: nitrate,
      result: "4.02",
      labRef: "L-9310",
    },
  ];
};

const ROWS = build();

const cell = (read: (row: Reading) => CellValue) => {
  return custom((_rng, rowIndex) => {
    return read(ROWS[rowIndex] as Reading);
  });
};

const readings = sheet("Readings", {
  rows: ROWS.length,
  columns: {
    Site: cell((row) => {
      return row.site;
    }),
    "Date sampled": cell((row) => {
      return sampled(row.day);
    }),
    "Det.": cell((row) => {
      return row.det.code;
    }),
    Result: cell((row) => {
      return row.result;
    }),
    Method: cell((row) => {
      return row.det.method;
    }),
    "Lab ref": cell((row) => {
      return row.labRef;
    }),
  },
});

export default defineFixture({
  name: "wye-lab-march",
  sheets: [readings],
  outputs: ["csv"],
});
