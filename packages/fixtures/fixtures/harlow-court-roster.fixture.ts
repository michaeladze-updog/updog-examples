import { custom, defineFixture, number, sheet } from "../src/index";
import type { CellValue, PartialRow } from "../src/index";

const GIVEN = [
  "Ana",
  "Callum",
  "Dilara",
  "Emeka",
  "Fiona",
  "Grigor",
  "Hana",
  "Iustin",
  "Joana",
  "Kwame",
  "Liesel",
  "Mira",
  "Nikola",
  "Oscar",
  "Petra",
  "Rafael",
  "Saoirse",
  "Tevita",
  "Ulla",
  "Viktor",
];

const FAMILY = [
  "Abara",
  "Bergqvist",
  "Cardoso",
  "Delaney",
  "Eriksen",
  "Fahey",
  "Gallardo",
  "Haugen",
  "Ivanova",
  "Jarrett",
  "Kovac",
  "Lindqvist",
  "Marchetti",
  "Novak",
  "Ostrowski",
  "Pemberton",
  "Quinlan",
  "Rasmussen",
  "Szabo",
  "Tanaka",
];

const TEAM_SPELLINGS = [
  "Front of House",
  "Back of House",
  "Back-of-house",
  "Housekeeping",
  "House Keeping",
  "Maintenance",
  "Reception",
];

const MANAGER_SPELLINGS = [
  "Marta Okafor",
  "Priya Raman",
  "Tomasz Wieczorek",
  "Ines Duarte",
];

type Planted = {
  staff?: string;
  given?: string;
  family?: string;
  team?: CellValue;
  reportsTo?: CellValue;
  firstDay?: CellValue;
};

const PLANTED: Record<number, Planted> = {
  0: {
    staff: "A-0001",
    given: "Marta",
    family: "Okafor",
    team: "Front of House",
    reportsTo: "Ines Duarte",
  },
  1: {
    staff: "A-0002",
    given: "Priya",
    family: "Raman",
    team: "Housekeeping",
    reportsTo: "Marta Okafor",
  },
  2: {
    staff: "A-0003",
    given: "Tomasz",
    family: "Wieczorek",
    team: "Maintenance",
    reportsTo: "Marta Okafor",
  },
  3: {
    staff: "A-0004",
    given: "Ines",
    family: "Duarte",
    team: "Reception",
    reportsTo: "Marta Okafor",
  },
  6: { reportsTo: "M. Okafor", firstDay: "03/04/2026" },
  11: { reportsTo: "Okafor, Marta" },
  17: { reportsTo: "Dana Whitfield" },
  23: { team: "FOH" },
  24: { team: "Front Desk" },
  29: { team: "Housekeping" },
  30: { team: "Maint." },
  35: { firstDay: "03/04/26" },
  41: { firstDay: 46085 },
  52: { staff: "A-0053", given: "Marta", family: "Okafor" },
  60: { staff: "A-47", given: "Hana", family: "Ivanova" },
  58: { firstDay: "4 March 2026" },
  71: { firstDay: "17/03/2026" },
};

const staffNo = custom((_rng, rowIndex) => {
  return (
    PLANTED[rowIndex]?.staff ?? `A-${String(rowIndex + 1).padStart(4, "0")}`
  );
});

const givenName = custom((_rng, rowIndex) => {
  return PLANTED[rowIndex]?.given ?? GIVEN[rowIndex % GIVEN.length];
});

const familyName = custom((_rng, rowIndex) => {
  const planted = PLANTED[rowIndex]?.family;
  if (planted) return planted;
  const drift =
    (rowIndex % FAMILY.length) + Math.floor(rowIndex / FAMILY.length);
  return FAMILY[drift % FAMILY.length];
});

const workEmail = custom((_rng, _rowIndex, row: PartialRow): CellValue => {
  const given = String(row["Given Name"] ?? "").toLowerCase();
  const family = String(row["Family Name"] ?? "").toLowerCase();
  return `${given}.${family}@harlowcourt.example`;
});

const team = custom((rng, rowIndex): CellValue => {
  const planted = PLANTED[rowIndex];
  if (planted && "team" in planted) return planted.team as CellValue;
  return rng.pick(TEAM_SPELLINGS);
});

const reportsTo = custom((rng, rowIndex): CellValue => {
  const planted = PLANTED[rowIndex];
  if (planted && "reportsTo" in planted) return planted.reportsTo as CellValue;
  return rng.pick(MANAGER_SPELLINGS);
});

const DAY = 86_400_000;
const FIRST_DAY_FROM = Date.parse("2019-02-01T00:00:00Z");
const FIRST_DAY_SPAN = 2_600;

const firstDay = custom((rng, rowIndex): CellValue => {
  const planted = PLANTED[rowIndex];
  if (planted && "firstDay" in planted) return planted.firstDay as CellValue;
  return new Date(FIRST_DAY_FROM + rng.int(0, FIRST_DAY_SPAN) * DAY);
});

const roster = sheet("Roster", {
  rows: 96,
  seed: 19,
  columns: {
    "Staff No": staffNo,
    "Given Name": givenName,
    "Family Name": familyName,
    Email: workEmail,
    Team: team,
    "Reports To": reportsTo,
    "First Day": firstDay,
    "Hrs/Week": number(16, 40, { decimals: 1 }),
  },
});

export default defineFixture({
  name: "harlow-court-roster",
  sheets: [roster],
  outputs: ["csv", "xlsx"],
});
