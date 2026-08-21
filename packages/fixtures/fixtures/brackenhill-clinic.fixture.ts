import { custom, defineFixture, number, pick, sheet } from "../src/index";
import type { CellValue } from "../src/index";

const MIGRATION_ROW = 43;

const NAMES = [
  "Pippin",
  "Nutmeg",
  "Bramble",
  "Otto",
  "Saffron",
  "Dexter",
  "Juniper",
  "Bruno",
  "Clover",
  "Milo",
  "Hazel",
  "Ziggy",
  "Marlowe",
  "Poppy",
  "Rufus",
  "Ivy",
  "Tobias",
  "Willow",
  "Frankie",
  "Maud",
  "Barnaby",
  "Suki",
  "Alfie",
  "Noor",
];

const SPECIES = ["Dog", "Cat", "Rabbit", "Ferret"];

const DAY = 86_400_000;
const NEWEST = Date.parse("2026-08-14T00:00:00Z");
const GAPS = [3, 5, 2, 8, 4, 6, 3, 9, 5, 4, 7, 2, 6, 3, 8, 5];

const seriesIndex = (rowIndex: number): number => {
  return rowIndex >= 50 ? rowIndex + 5 : rowIndex;
};

const lastSeenAt = (rowIndex: number): Date => {
  let offset = 0;
  for (let i = 0; i < rowIndex; i++) {
    offset += GAPS[i % GAPS.length];
  }
  return new Date(NEWEST - offset * DAY);
};

const iso = (value: Date): string => {
  return value.toISOString().slice(0, 10);
};

const slash = (value: Date): string => {
  const day = String(value.getUTCDate()).padStart(2, "0");
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${value.getUTCFullYear()}`;
};

const boosterAt = (
  visit: Date,
  rng: { int: (min: number, max: number) => number },
): Date => {
  const due = new Date(visit.getTime());
  due.setUTCMonth(due.getUTCMonth() + 9);
  due.setUTCDate(rng.int(1, 12));
  return due;
};

type Planted = { lastSeen?: CellValue; boosterDue?: CellValue };

const PLANTED: Record<number, Planted> = {
  30: { lastSeen: "2026-02-30" },
  43: { lastSeen: "12/01/2026", boosterDue: "10/10/2026" },
  44: { lastSeen: "08.01.2026", boosterDue: "02/10/2026" },
  45: { lastSeen: "05/01/2026", boosterDue: "07/10/2026" },
  46: { lastSeen: "02/01/2026", boosterDue: "" },
  47: { lastSeen: "11/12/2025", boosterDue: "09/09/2026" },
  48: { lastSeen: "09/12/2025", boosterDue: "04/09/2026" },
  49: { lastSeen: "28/11/2025", boosterDue: "06/09/2026" },
  53: { lastSeen: "20251029" },
  57: { lastSeen: "11 Oct 2025", boosterDue: "Jul 5, 2026" },
  61: { boosterDue: "03/04/26" },
  66: { boosterDue: "" },
  83: { boosterDue: "" },
};

const patientId = custom((_rng, rowIndex) => {
  return `BR-${String(4100 + rowIndex * 7).padStart(5, "0")}`;
});

const patientName = custom((rng, rowIndex) => {
  const base = NAMES[rowIndex % NAMES.length];
  return rng.bool(0.18) ? `${base} II` : base;
});

const species = pick(SPECIES, [0.5, 0.34, 0.11, 0.05]);

const lastSeen = custom((_rng, rowIndex): CellValue => {
  const planted = PLANTED[rowIndex];
  if (planted && "lastSeen" in planted) {
    return planted.lastSeen as CellValue;
  }
  const visit = lastSeenAt(seriesIndex(rowIndex));
  return rowIndex < MIGRATION_ROW ? iso(visit) : slash(visit);
});

const boosterDue = custom((rng, rowIndex): CellValue => {
  const planted = PLANTED[rowIndex];
  if (planted && "boosterDue" in planted) {
    return planted.boosterDue as CellValue;
  }
  const due = boosterAt(lastSeenAt(seriesIndex(rowIndex)), rng);
  return rowIndex < MIGRATION_ROW ? iso(due) : slash(due);
});

const patients = sheet("Patients", {
  rows: 128,
  seed: 31,
  columns: {
    "Patient ID": patientId,
    "Patient Name": patientName,
    Species: species,
    "Last Seen": lastSeen,
    "Booster Due": boosterDue,
    "Weight (kg)": number(0.6, 58, { decimals: 1 }),
  },
});

export default defineFixture({
  name: "brackenhill-clinic",
  sheets: [patients],
  outputs: ["csv"],
});
