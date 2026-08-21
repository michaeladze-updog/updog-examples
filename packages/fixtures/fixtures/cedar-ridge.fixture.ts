import { custom, defineFixture, pick, sheet } from "../src/index";
import type { Rng } from "../src/index";

const LAST_NAMES = [
  "Alvarez",
  "Okafor",
  "Nguyen",
  "Delacroix",
  "Whitfield",
  "Ramirez",
  "Baptiste",
  "Ionescu",
  "Kowalski",
  "Fitzgerald",
  "Sandoval",
  "Achebe",
  "Lindqvist",
  "Moreau",
  "Petrov",
  "Halvorsen",
  "Castellanos",
  "Mbeki",
  "Yamada",
  "Novotny",
  "Escobar",
  "Bergstrom",
  "Hollis",
  "Ferreira",
  "Aguilar",
  "Thorne",
  "Vasquez",
  "Ridley",
  "Marchetti",
  "Osei",
];

const FIRST_NAMES: [string, "f" | "m"][] = [
  ["Rosa", "f"],
  ["Chidi", "m"],
  ["Thanh", "f"],
  ["Margot", "f"],
  ["Everett", "m"],
  ["Luz", "f"],
  ["Emile", "m"],
  ["Adriana", "f"],
  ["Piotr", "m"],
  ["Nora", "f"],
  ["Ines", "f"],
  ["Kwame", "m"],
  ["Sigrid", "f"],
  ["Julien", "m"],
  ["Anya", "f"],
  ["Bjorn", "m"],
  ["Camila", "f"],
  ["Naledi", "f"],
  ["Haruki", "m"],
  ["Vera", "f"],
  ["Mateo", "m"],
  ["Elsa", "f"],
  ["Wendell", "m"],
  ["Beatriz", "f"],
  ["Ruben", "m"],
  ["Cordelia", "f"],
  ["Ximena", "f"],
  ["Alden", "m"],
  ["Giulia", "f"],
  ["Femi", "m"],
];

const FEMALE_SPELLINGS = ["F", "Female", "f"];
const FEMALE_WEIGHTS = [0.76, 0.16, 0.08];
const MALE_SPELLINGS = ["M", "MALE", "m"];
const MALE_WEIGHTS = [0.76, 0.16, 0.08];
const OFF_LIST = ["U", "X", "Non-binary", ""];
const OFF_LIST_WEIGHTS = [0.3, 0.22, 0.22, 0.26];

const DAY = 86400000;

const iso = (value: Date): string => {
  return value.toISOString().slice(0, 10);
};

const birthDate = (rng: Rng): Date => {
  const from = Date.parse("1931-01-01T00:00:00Z");
  const to = Date.parse("2024-12-31T00:00:00Z");
  const span = Math.round((to - from) / DAY);
  return new Date(from + rng.int(0, span) * DAY);
};

const twoDigitYear = (value: Date): string => {
  const month = value.getUTCMonth() + 1;
  const day = value.getUTCDate();
  const year = String(value.getUTCFullYear()).slice(2);
  return `${month}/${day}/${year}`;
};

const PAYERS = [
  "Aetna",
  "AETNA",
  "Blue Cross Blue Shield of Texas",
  "BCBS TX",
  "United Healthcare",
  "UHC",
  "Cigna",
  "Humana",
  "Medicare",
  "Self Pay",
];

const PAYER_WEIGHTS = [
  0.14, 0.04, 0.15, 0.07, 0.13, 0.06, 0.11, 0.08, 0.14, 0.08,
];

const MEMBER_PREFIX: Record<string, string> = {
  Aetna: "W",
  AETNA: "W",
  "Blue Cross Blue Shield of Texas": "ZGP",
  "BCBS TX": "ZGP",
  "United Healthcare": "9",
  UHC: "9",
  Cigna: "U",
  Humana: "H",
  Medicare: "1EG4",
};

const ALLERGIES = [
  "",
  "NKDA",
  "Penicillin",
  "PCN",
  "Penicillin; Sulfa drugs",
  "Sulfa drugs; NSAIDs",
  "Latex, Penicillin",
  "Peanuts; Shellfish",
  "Shellfish",
  "Contrast dye; Latex",
  "NSAIDs; Peanuts",
  "Latex",
  "Penicillin; Peanuts; Latex",
];

const ALLERGY_WEIGHTS = [
  0.31, 0.14, 0.11, 0.04, 0.08, 0.05, 0.03, 0.05, 0.04, 0.03, 0.04, 0.05, 0.03,
];

const PROBLEMS = [
  "",
  "E11.9",
  "I10",
  "E11.9; I10",
  "J45.909",
  "I10; J45.909",
  "E11.9; I10; J45.909",
];

const PROBLEM_WEIGHTS = [0.34, 0.16, 0.19, 0.12, 0.09, 0.06, 0.04];

export default defineFixture({
  name: "cedar-ridge",
  sheets: [
    sheet("Roster", {
      rows: 3200,
      seed: 41,
      columns: {
        MRN: custom((_rng, rowIndex) => {
          return String(204000 + rowIndex);
        }),
        "Last Name": pick(LAST_NAMES),
        "First Name": custom((rng) => {
          return rng.pick(FIRST_NAMES)[0];
        }),
        DOB: custom((rng) => {
          const value = birthDate(rng);
          return rng.bool(0.12) ? twoDigitYear(value) : iso(value);
        }),
        Sex: custom((rng, _rowIndex, row) => {
          if (rng.bool(0.05)) {
            return rng.pick(OFF_LIST, OFF_LIST_WEIGHTS);
          }
          const first = String(row["First Name"] ?? "");
          const entry = FIRST_NAMES.find((name) => {
            return name[0] === first;
          });
          return entry?.[1] === "m"
            ? rng.pick(MALE_SPELLINGS, MALE_WEIGHTS)
            : rng.pick(FEMALE_SPELLINGS, FEMALE_WEIGHTS);
        }),
        Email: custom((rng, _rowIndex, row) => {
          const first = String(row["First Name"] ?? "").toLowerCase();
          const last = String(row["Last Name"] ?? "").toLowerCase();
          if (rng.bool(0.17)) {
            return "";
          }
          if (rng.bool(0.02)) {
            return `${first}.${last}@`;
          }
          const domain = rng.pick(
            ["example.com", "mail.example.net", "example.org"],
            [0.6, 0.25, 0.15],
          );
          return `${first}.${last}@${domain}`;
        }),
        Insurance: pick(PAYERS, PAYER_WEIGHTS),
        "Member #": custom((rng, _rowIndex, row) => {
          const payer = String(row.Insurance ?? "");
          const prefix = MEMBER_PREFIX[payer];
          if (!prefix) {
            return "";
          }
          return `${prefix}${String(rng.int(1000000, 9999999))}`;
        }),
        "Coverage Start": custom((rng, _rowIndex, row) => {
          if (!String(row["Member #"] ?? "")) {
            return "";
          }
          const from = Date.parse("2023-01-01T00:00:00Z");
          const to = Date.parse("2026-06-30T00:00:00Z");
          const span = Math.round((to - from) / DAY);
          return iso(new Date(from + rng.int(0, span) * DAY));
        }),
        "Coverage End": custom((rng, _rowIndex, row) => {
          const start = String(row["Coverage Start"] ?? "");
          if (!start) {
            return "";
          }
          if (!rng.bool(0.14)) {
            return "";
          }
          const base = Date.parse(`${start}T00:00:00Z`);
          const backwards = rng.bool(0.06);
          const offset = rng.int(30, 900) * (backwards ? -1 : 1);
          return iso(new Date(base + offset * DAY));
        }),
        Allergies: pick(ALLERGIES, ALLERGY_WEIGHTS),
        SSN: custom((rng) => {
          if (rng.bool(0.13)) {
            return "";
          }
          const group = String(rng.int(10, 99));
          const serial = String(rng.int(1000, 9999));
          return `900-${group}-${serial}`;
        }),
        "Problem List": pick(PROBLEMS, PROBLEM_WEIGHTS),
      },
      overrides: [
        { at: 417, MRN: "204042" },
        { at: 1288, MRN: "204731" },
        { at: 2904, MRN: "205119" },
        { at: 88, "First Name": "" },
        { at: 1902, "Last Name": "" },
      ],
    }),
  ],
  outputs: ["csv"],
});
