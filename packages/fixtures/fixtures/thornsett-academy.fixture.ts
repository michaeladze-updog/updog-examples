import { custom, defineFixture, pick, seq, sheet } from "../src/index";
import type { Rng } from "../src/index";

const FORENAMES = [
  "Amara",
  "Bilal",
  "Caoimhe",
  "Dmitri",
  "Elif",
  "Fionn",
  "Greta",
  "Hamza",
  "Imani",
  "Jonas",
  "Kavya",
  "Lukas",
  "Maeve",
  "Noor",
  "Otto",
  "Priya",
  "Rosalind",
  "Soren",
  "Tomas",
  "Ursula",
  "Vinh",
  "Willa",
  "Yusuf",
  "Zara",
];

const SURNAMES = [
  "Ashworth",
  "Bellamy",
  "Brightwell",
  "Calderon",
  "Considine",
  "Draycott",
  "Dunmore",
  "Ebrahim",
  "Everleigh",
  "Fenwick",
  "Gallacher",
  "Hollingworth",
  "Ijaz",
  "Jephcott",
  "Kirilov",
  "Lanyon",
  "Mwangi",
  "Nordstrom",
  "Ottley",
  "Pemberton",
  "Quiller",
  "Rasmussen",
  "Selby",
  "Trelawney",
  "Underhill",
  "Vasilenko",
  "Wardell",
  "Yeardley",
  "Zabala",
];

const GUARDIANS = [
  "Bernadette",
  "Cyrus",
  "Dilys",
  "Emmett",
  "Farida",
  "Gideon",
  "Harriet",
  "Ivor",
  "Josephine",
  "Krystian",
  "Lorna",
  "Malachy",
  "Nadia",
  "Osric",
  "Rowena",
  "Sylvester",
];

const HOUSES = [
  "Ashdown House",
  "Bramley House",
  "Cransley House",
  "Denholm House",
];

const pad = (value: number): string => {
  return String(value).padStart(2, "0");
};

/**
 * A birthday inside one English academic-year band, so the year group below can
 * be read straight off it. Band 0 is the September 2010 to August 2011 cohort,
 * which sits in Year 11 during 2026/27. Every day of the month is past the
 * twelfth, per standard.md, so no reader can take the file for a date-order
 * problem.
 */
const birthday = (rng: Rng): string => {
  const band = rng.int(0, 4);
  const startYear = 2010 + band;
  const monthIndex = rng.int(0, 11);
  const month = monthIndex < 4 ? 9 + monthIndex : monthIndex - 3;
  const year = monthIndex < 4 ? startYear : startYear + 1;
  return `${year}-${pad(month)}-${pad(rng.int(13, 28))}`;
};

const yearGroupOf = (dob: string): number => {
  const [year, month] = dob.split("-").map(Number);
  const startYear = (month as number) >= 9 ? (year as number) : (year as number) - 1;
  return 2021 - startYear;
};

const roll = sheet("Roll", {
  rows: 384,
  seed: 19,
  columns: {
    "Student no.": seq("TA-{n:04}"),
    Forename: pick(FORENAMES),
    Surname: pick(SURNAMES),
    DOB: custom((rng) => {
      return birthday(rng);
    }),
    Year: custom((_rng, _rowIndex, row) => {
      return `Yr ${yearGroupOf(String(row.DOB))}`;
    }),
    "School house": pick(HOUSES),
    "Contact email": custom((rng, _rowIndex, row) => {
      const guardian = rng.pick(GUARDIANS);
      const surname = String(row.Surname);
      return `${guardian}.${surname}@holtmail.example`.toLowerCase();
    }),
  },
});

export default defineFixture({
  name: "thornsett-academy",
  sheets: [roll],
  outputs: ["csv", "xlsx"],
});
