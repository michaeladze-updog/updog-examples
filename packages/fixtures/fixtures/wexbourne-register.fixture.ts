import { createRng, defineFixture } from "../src/index";
import type { CellValue, Sheet } from "../src/index";

type Row = {
  policyNumber: string;
  transCode: string;
  transDate: string;
  effDate: string;
  expDate: string;
  lob: string;
  holder: string;
  carrier: string;
  billType: string;
  premium: CellValue;
  commPercent: CellValue;
  commAmount: CellValue;
  producer: string;
  sortKey: number;
};

const rng = createRng(41);

const DAY = 86400000;

const pad = (value: number, width: number): string => {
  return String(value).padStart(width, "0");
};

const iso = (ms: number): string => {
  const value = new Date(ms);
  return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1, 2)}-${pad(value.getUTCDate(), 2)}`;
};

const us = (ms: number): string => {
  const value = new Date(ms);
  return `${pad(value.getUTCMonth() + 1, 2)}/${pad(value.getUTCDate(), 2)}/${value.getUTCFullYear()}`;
};

const writeDate = (ms: number): string => {
  return rng.bool(0.17) ? us(ms) : iso(ms);
};

type Carrier = {
  code: string;
  prefix: string;
  digits: number;
  names: string[];
  weights: number[];
};

const CARRIERS: Carrier[] = [
  {
    code: "ARDSLEY",
    prefix: "AM-",
    digits: 8,
    names: [
      "Ardsley Mutual",
      "ARDSLEY MUTUAL INS CO",
      "Ardsley Mut",
      "Ardsley Mutual Insurance Company",
      "ardsley mutual",
    ],
    weights: [0.44, 0.21, 0.14, 0.13, 0.08],
  },
  {
    code: "KEMWOOD",
    prefix: "KC",
    digits: 7,
    names: [
      "Kemwood Casualty",
      "KEMWOOD CAS",
      "Kemwood Casualty Co",
      "Kemwood",
    ],
    weights: [0.41, 0.26, 0.19, 0.14],
  },
  {
    code: "PELHAM",
    prefix: "PI-",
    digits: 7,
    names: [
      "Pelham Indemnity",
      "PELHAM IND",
      "Pelham Indemnity Group",
      "Pelham Ind.",
    ],
    weights: [0.39, 0.24, 0.21, 0.16],
  },
  {
    code: "STANWICK",
    prefix: "SFM",
    digits: 8,
    names: [
      "Stanwick Fire & Marine",
      "STANWICK F&M",
      "Stanwick Fire and Marine",
      "Stanwick F & M",
    ],
    weights: [0.38, 0.27, 0.2, 0.15],
  },
  {
    code: "VALEBROOK",
    prefix: "VN",
    digits: 9,
    names: [
      "Valebrook National",
      "VALEBROOK NATL",
      "Valebrook Nat'l",
      "Valebrook",
    ],
    weights: [0.4, 0.25, 0.18, 0.17],
  },
  {
    code: "NORTHGATE",
    prefix: "NS-",
    digits: 6,
    names: [
      "Northgate Specialty",
      "NORTHGATE SPEC",
      "Northgate Specialty Lines",
    ],
    weights: [0.46, 0.31, 0.23],
  },
];

type Line = {
  field: string;
  commercial: boolean;
  written: string[];
  weights: number[];
};

const LINES: Line[] = [
  {
    field: "Commercial Auto",
    commercial: true,
    written: ["BAUTO", "CAUTO", "Comm Auto", "Commercial Auto", "Auto"],
    weights: [0.31, 0.19, 0.18, 0.24, 0.08],
  },
  {
    field: "General Liability",
    commercial: true,
    written: ["CGL", "GL", "General Liability", "Gen Liab"],
    weights: [0.36, 0.24, 0.26, 0.14],
  },
  {
    field: "Workers Compensation",
    commercial: true,
    written: [
      "WORK",
      "WC",
      "Work Comp",
      "Workers Comp",
      "WORKERS COMPENSATION",
    ],
    weights: [0.3, 0.22, 0.18, 0.21, 0.09],
  },
  {
    field: "Commercial Property",
    commercial: true,
    written: ["PROP", "CPROP", "Commercial Property", "Comm Prop"],
    weights: [0.33, 0.21, 0.28, 0.18],
  },
  {
    field: "Umbrella",
    commercial: true,
    written: ["UMBR", "Umbrella", "Comm Umbrella", "UMB"],
    weights: [0.34, 0.33, 0.16, 0.17],
  },
  {
    field: "Homeowners",
    commercial: false,
    written: ["HOME", "HO3", "Homeowners", "HO"],
    weights: [0.3, 0.24, 0.31, 0.15],
  },
  {
    field: "Personal Auto",
    commercial: false,
    written: ["PAUTO", "Personal Auto", "PPA", "Auto"],
    weights: [0.33, 0.29, 0.16, 0.22],
  },
];

const LINE_WEIGHTS = [0.19, 0.21, 0.16, 0.13, 0.06, 0.13, 0.12];

const BILL_TYPES: Record<string, { written: string[]; weights: number[] }> = {
  "Direct Billing": {
    written: ["D", "Direct Bill", "Direct", "DB", "DIRECT BILL"],
    weights: [0.33, 0.26, 0.16, 0.15, 0.1],
  },
  "Agency Billing": {
    written: ["A", "Agency Bill", "Agency", "AB", "AGENCY BILL"],
    weights: [0.35, 0.25, 0.15, 0.15, 0.1],
  },
};

const BUSINESS_HEADS = [
  "Kessler",
  "Marchetti",
  "Underhill",
  "Boyne",
  "Trask",
  "Calloway",
  "Rennick",
  "Halvorsen",
  "Dupree",
  "Ostrander",
  "Fairweather",
  "Nyquist",
  "Bramble",
  "Lindqvist",
  "Whitcomb",
  "Arbogast",
  "Delacroix",
  "Standish",
  "Renfro",
  "Kowalczyk",
  "Ferraro",
  "Tolliver",
  "Ashby",
  "Petrossian",
  "Wexler",
];

const BUSINESS_TAILS = [
  "Haulage",
  "Contracting",
  "Millwork",
  "Machine Works",
  "Produce",
  "Fabrication",
  "Roofing",
  "Landscaping",
  "Foundry",
  "Bakery",
  "Cold Storage",
  "Electrical",
  "Plumbing & Heating",
  "Cabinetry",
  "Excavating",
  "Printing",
  "Auto Body",
  "Dairy",
  "Freight",
  "Welding",
];

const BUSINESS_SUFFIX = ["LLC", "Inc", "Co", "Corp", "Ltd", ""];
const BUSINESS_SUFFIX_W = [0.29, 0.21, 0.14, 0.11, 0.06, 0.19];

const PERSON_FIRST = [
  "Marguerite",
  "Desmond",
  "Yolanda",
  "Terrence",
  "Priya",
  "Adaeze",
  "Rutger",
  "Ingrid",
  "Casimir",
  "Beatriz",
  "Osman",
  "Freya",
  "Malachy",
  "Noor",
  "Vidal",
  "Solveig",
  "Amara",
  "Emeric",
  "Josefa",
  "Bartholomew",
];

const PERSON_LAST = [
  "Aldridge",
  "Vasquez",
  "Okonkwo",
  "Sandoval",
  "Thorne",
  "Bhattacharya",
  "Lindgren",
  "Mercier",
  "Falkenrath",
  "Nakagawa",
  "Oyelaran",
  "Castellanos",
  "Petrakis",
  "Wojcik",
  "Rasmussen",
  "Adeyemi",
  "Novotny",
  "Guerrero",
  "Halloran",
  "Sturgeon",
];

const PRODUCERS = [
  "HFN-04",
  "HFN-11",
  "TRW-02",
  "TRW-08",
  "MCL-01",
  "MCL-15",
  "GBY-06",
  "GBY-22",
];

const abbreviateBusiness = (name: string): string => {
  return name
    .toUpperCase()
    .replace(/BROTHERS/g, "BROS")
    .replace(/ & /g, " AND ")
    .replace(/, (LLC|INC|CO|CORP|LTD)$/, " $1");
};

type Policy = {
  number: string;
  carrier: Carrier;
  line: Line;
  holder: string;
  holderVariant: string;
  billField: string;
  producer: string;
  effMs: number;
  termDays: number;
  basePremium: number;
  rate: number;
};

const usedNumbers = new Set<string>();

const policyNumber = (carrier: Carrier): string => {
  for (let attempt = 0; attempt < 40; attempt++) {
    const body = pad(rng.int(1, 10 ** carrier.digits - 1), carrier.digits);
    const value = `${carrier.prefix}${body}`;
    if (!usedNumbers.has(value)) {
      usedNumbers.add(value);
      return value;
    }
  }
  throw new Error("policy number space exhausted");
};

const holderFor = (line: Line): { name: string; variant: string } => {
  if (line.commercial) {
    const head = rng.pick(BUSINESS_HEADS);
    const tail = rng.pick(BUSINESS_TAILS);
    const suffix = rng.pick(BUSINESS_SUFFIX, BUSINESS_SUFFIX_W);
    const name = suffix ? `${head} ${tail}, ${suffix}` : `${head} ${tail}`;
    return { name, variant: abbreviateBusiness(name) };
  }
  const first = rng.pick(PERSON_FIRST);
  const last = rng.pick(PERSON_LAST);
  return { name: `${first} ${last}`, variant: `${last}, ${first}` };
};

const POLICY_COUNT = 540;
const policies: Policy[] = [];

const WINDOW_START = Date.parse("2023-01-02T00:00:00Z");
const WINDOW_SPAN = 900;

for (let index = 0; index < POLICY_COUNT; index++) {
  const carrier = rng.pick(CARRIERS);
  const line = rng.pick(LINES, LINE_WEIGHTS);
  const holder = holderFor(line);
  const termDays = line.commercial ? 365 : rng.pick([365, 182], [0.72, 0.28]);
  const base = line.commercial
    ? Math.round(rng.float(1800, 74000) * 100) / 100
    : Math.round(rng.float(420, 3900) * 100) / 100;
  policies.push({
    number: policyNumber(carrier),
    carrier,
    line,
    holder: holder.name,
    holderVariant: holder.variant,
    billField: rng.pick(
      ["Direct Billing", "Agency Billing"],
      line.commercial ? [0.38, 0.62] : [0.81, 0.19],
    ),
    producer: rng.pick(PRODUCERS),
    effMs: WINDOW_START + rng.int(0, WINDOW_SPAN) * DAY,
    termDays,
    basePremium: base,
    rate: rng.pick(
      [10, 12, 12.5, 15, 17.5, 20],
      [0.14, 0.22, 0.12, 0.31, 0.11, 0.1],
    ),
  });
}

const TRANS = {
  newBusiness: {
    field: "New Business",
    written: ["NBS", "New Business", "NEW", "N/B"],
    weights: [0.44, 0.32, 0.14, 0.1],
  },
  renewal: {
    field: "Renewal",
    written: ["RWL", "Renewal", "REN", "Renew"],
    weights: [0.46, 0.3, 0.14, 0.1],
  },
  endorsement: {
    field: "Endorsement",
    written: ["PCH", "Endorsement", "END", "Policy Change", "endorsement"],
    weights: [0.4, 0.25, 0.14, 0.13, 0.08],
  },
  cancellation: {
    field: "Cancellation",
    written: ["XLC", "Cancellation", "Cancel", "XLN", "CAN"],
    weights: [0.36, 0.22, 0.19, 0.13, 0.1],
  },
  reinstatement: {
    field: "Reinstatement",
    written: ["REI", "Reinstatement", "Reinstate"],
    weights: [0.52, 0.29, 0.19],
  },
  audit: {
    field: "Audit",
    written: ["PAB", "Audit", "Premium Audit", "AUD"],
    weights: [0.41, 0.25, 0.21, 0.13],
  },
  rewrite: {
    field: "Rewrite",
    written: ["REW", "Rewrite"],
    weights: [0.7, 0.3],
  },
  nonRenewal: {
    field: "Non-Renewal",
    written: ["NRA", "Non-Renewal", "NON RENEW"],
    weights: [0.58, 0.24, 0.18],
  },
};

const writeMoney = (value: number): CellValue => {
  const shape = rng.pick(["plain", "currency", "grouped"], [0.62, 0.21, 0.17]);
  const fixed = Math.abs(value).toFixed(2);
  const grouped = fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const sign = value < 0 ? "-" : "";
  if (shape === "currency") {
    return `${sign}$${grouped}`;
  }
  if (shape === "grouped") {
    return `${sign}${grouped}`;
  }
  return Math.round(value * 100) / 100;
};

const writeRate = (rate: number): CellValue => {
  const shape = rng.pick(
    ["percent", "fraction", "signed", "blank"],
    [0.71, 0.19, 0.06, 0.04],
  );
  if (shape === "blank") {
    return "";
  }
  if (shape === "fraction") {
    const value = rate / 100;
    return rng.bool(0.34) ? String(value).replace(/^0/, "") : value;
  }
  if (shape === "signed") {
    return `${rate}%`;
  }
  return rate;
};

const rows: Row[] = [];

const emit = (
  policy: Policy,
  kind: { field: string; written: string[]; weights: number[] },
  options: {
    transMs: number;
    effMs: number;
    expMs: number | null;
    premium: number;
    holderVariant?: boolean;
  },
): void => {
  const commission =
    Math.round(options.premium * (policy.rate / 100) * 100) / 100;
  const billing = BILL_TYPES[policy.billField];
  rows.push({
    policyNumber: policy.number,
    transCode: rng.pick(kind.written, kind.weights),
    transDate: iso(options.transMs),
    effDate: writeDate(options.effMs),
    expDate: options.expMs === null ? "" : writeDate(options.expMs),
    lob: rng.pick(policy.line.written, policy.line.weights),
    holder: options.holderVariant ? policy.holderVariant : policy.holder,
    carrier: rng.pick(policy.carrier.names, policy.carrier.weights),
    billType: billing ? rng.pick(billing.written, billing.weights) : "",
    premium: writeMoney(options.premium),
    commPercent: writeRate(policy.rate),
    commAmount: writeMoney(commission),
    producer: rng.bool(0.07) ? "" : policy.producer,
    sortKey: options.transMs,
  });
};

for (const policy of policies) {
  let termStart = policy.effMs;
  const terms = rng.pick([1, 2, 3, 4], [0.34, 0.31, 0.22, 0.13]);
  let cancelled = false;

  for (let term = 0; term < terms && !cancelled; term++) {
    const termEnd = termStart + policy.termDays * DAY;
    const isNew = term === 0;
    const kind = isNew ? TRANS.newBusiness : TRANS.renewal;
    const premium =
      Math.round(
        policy.basePremium * (1 + term * rng.float(0.02, 0.11)) * 100,
      ) / 100;

    emit(policy, kind, {
      transMs: termStart - rng.int(0, 18) * DAY,
      effMs: termStart,
      expMs: termEnd,
      premium,
      holderVariant: rng.bool(0.11),
    });

    const endorsements = rng.pick([0, 1, 2, 3], [0.42, 0.31, 0.18, 0.09]);
    for (let e = 0; e < endorsements; e++) {
      const at = termStart + rng.int(10, policy.termDays - 20) * DAY;
      const delta =
        (Math.round(premium * rng.float(0.02, 0.19) * 100) / 100) *
        (rng.bool(0.36) ? -1 : 1);
      emit(policy, TRANS.endorsement, {
        transMs: at + rng.int(0, 9) * DAY,
        effMs: at,
        expMs: rng.bool(0.62) ? termEnd : null,
        premium: delta,
        holderVariant: rng.bool(0.09),
      });
    }

    if (policy.line.field === "Workers Compensation" && rng.bool(0.55)) {
      const auditAt = termEnd + rng.int(30, 120) * DAY;
      const auditDelta =
        (Math.round(premium * rng.float(0.03, 0.22) * 100) / 100) *
        (rng.bool(0.42) ? -1 : 1);
      emit(policy, TRANS.audit, {
        transMs: auditAt,
        effMs: termEnd,
        expMs: null,
        premium: auditDelta,
      });
    }

    if (rng.bool(0.14)) {
      const at = termStart + rng.int(25, policy.termDays - 30) * DAY;
      const unearned =
        -Math.round(
          ((premium * (policy.termDays - (at - termStart) / DAY)) /
            policy.termDays) *
            100,
        ) / 100;
      emit(policy, TRANS.cancellation, {
        transMs: at + rng.int(1, 12) * DAY,
        effMs: at,
        expMs: null,
        premium: unearned,
      });
      if (rng.bool(0.27)) {
        emit(policy, TRANS.reinstatement, {
          transMs: at + rng.int(14, 40) * DAY,
          effMs: at + rng.int(14, 40) * DAY,
          expMs: termEnd,
          premium: -unearned,
        });
      } else {
        cancelled = true;
      }
    }

    termStart = termEnd;
  }

  if (!cancelled && rng.bool(0.05)) {
    emit(policy, TRANS.nonRenewal, {
      transMs: termStart - rng.int(45, 75) * DAY,
      effMs: termStart,
      expMs: null,
      premium: 0,
    });
  }
  if (!cancelled && rng.bool(0.03)) {
    emit(policy, TRANS.rewrite, {
      transMs: termStart + rng.int(1, 20) * DAY,
      effMs: termStart,
      expMs: termStart + policy.termDays * DAY,
      premium: policy.basePremium,
    });
  }
}

rows.sort((left, right) => {
  return left.sortKey - right.sortKey;
});

const planted: string[] = [];

const findRow = (
  predicate: (row: Row, index: number) => boolean,
  from = 0,
): number => {
  for (let index = from; index < rows.length; index++) {
    if (predicate(rows[index] as Row, index)) {
      return index;
    }
  }
  return -1;
};

const isCode = (row: Row, kind: { written: string[] }): boolean => {
  return kind.written.includes(row.transCode);
};

const negativeNew = findRow((row, index) => {
  return index > 300 && isCode(row, TRANS.newBusiness) && row.premium !== "";
});
if (negativeNew !== -1) {
  const row = rows[negativeNew] as Row;
  row.premium = -4180.5;
  row.commAmount = -627.08;
  planted.push(
    `new business row carrying a negative premium at row ${negativeNew + 2}, policy ${row.policyNumber}`,
  );
}

const positiveCancel = findRow((row, index) => {
  return index > 500 && isCode(row, TRANS.cancellation);
});
if (positiveCancel !== -1) {
  const row = rows[positiveCancel] as Row;
  row.premium = 2260;
  row.commAmount = 339;
  planted.push(
    `cancellation row carrying a positive premium at row ${positiveCancel + 2}, policy ${row.policyNumber}`,
  );
}

const orphanTargets = [820, 1340, 1910];
for (const target of orphanTargets) {
  const at = findRow((row, index) => {
    return index > target && isCode(row, TRANS.endorsement);
  });
  if (at !== -1) {
    const row = rows[at] as Row;
    const carrier = CARRIERS[rng.int(0, CARRIERS.length - 1)] as Carrier;
    row.policyNumber = `${carrier.prefix}${pad(rng.int(1, 10 ** carrier.digits - 1), carrier.digits)}`;
    planted.push(
      `endorsement pointing at a policy no other row carries at row ${at + 2}, policy ${row.policyNumber}`,
    );
  }
}

const blankHolders = [117, 604, 1188, 1755, 2102];
for (const target of blankHolders) {
  const row = rows[target];
  if (row) {
    row.holder = "";
    planted.push(
      `blank policy holder at row ${target + 2}, policy ${row.policyNumber}`,
    );
  }
}

const sharedNumber = findRow((row, index) => {
  return index > 1000 && isCode(row, TRANS.newBusiness);
});
if (sharedNumber !== -1) {
  const donor = rows[sharedNumber] as Row;
  const other = findRow((row, index) => {
    return (
      index > sharedNumber + 40 &&
      isCode(row, TRANS.newBusiness) &&
      row.carrier !== donor.carrier
    );
  });
  if (other !== -1) {
    const row = rows[other] as Row;
    const before = row.policyNumber;
    row.policyNumber = donor.policyNumber;
    planted.push(
      `two carriers on one policy number at rows ${sharedNumber + 2} and ${other + 2}, ${donor.policyNumber} (was ${before})`,
    );
  }
}

const backdated = findRow((row, index) => {
  return index > 1500 && isCode(row, TRANS.endorsement) && row.expDate !== "";
});
if (backdated !== -1) {
  const row = rows[backdated] as Row;
  row.effDate = "2021-11-30";
  planted.push(
    `endorsement effective before its policy term at row ${backdated + 2}, policy ${row.policyNumber}`,
  );
}

const header: CellValue[] = [
  "Policy Number",
  "Trans Code",
  "Trans Date",
  "Policy Eff Date",
  "Policy Exp Date",
  "LOB Code",
  "Policy Holder Name",
  "Carrier",
  "Bill Type",
  "Premium",
  "Comm Percent",
  "Comm Amount",
  "Producer Code",
];

const cells: CellValue[][] = rows.map((row) => {
  return [
    row.policyNumber,
    row.transCode,
    row.transDate,
    row.effDate,
    row.expDate,
    row.lob,
    row.holder,
    row.carrier,
    row.billType,
    row.premium,
    row.commPercent,
    row.commAmount,
    row.producer,
  ];
});

const register: Sheet = {
  name: "Register",
  preamble: [],
  header,
  rows: cells,
};

export const plantedNotes = planted;

export default defineFixture({
  name: "wexbourne-register",
  sheets: [register],
  outputs: ["csv", "xlsx"],
});
