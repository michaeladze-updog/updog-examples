import { createRng, custom, defineFixture, sheet } from "../src/index";
import type { CellValue } from "../src/index";

const STEMS = [
  "Alderman",
  "Ballantyne",
  "Castleford",
  "Denholm",
  "Eastgate",
  "Fairweather",
  "Grimsby",
  "Hollingworth",
  "Ingleby",
  "Jarrow",
  "Kettleby",
  "Lansdowne",
  "Marchmont",
  "Netherfield",
  "Oakhurst",
  "Pemberton",
  "Quarrington",
  "Rushcliffe",
  "Saltburn",
  "Thirlmere",
  "Ullswater",
  "Verwood",
  "Wolverton",
  "Yarborough",
  "Ashworth",
  "Brackenridge",
  "Culverton",
  "Draycott",
  "Elmswell",
  "Farndale",
];

const TRADES = [
  "Fasteners",
  "Bearings",
  "Castings",
  "Tooling",
  "Abrasives",
  "Hydraulics",
  "Gasket",
  "Coatings",
  "Extrusions",
  "Forgings",
  "Packaging",
  "Lubricants",
  "Electrical",
  "Pneumatics",
  "Machining",
  "Fabrication",
  "Plating",
  "Foundry",
  "Seals",
  "Springs",
  "Valves",
  "Weldments",
  "Logistics",
  "Calibration",
];

const SUFFIXES = [
  "Inc",
  "Inc.",
  "LLC",
  "Ltd",
  "Ltd.",
  "Corp",
  "Co",
  "GmbH",
  "S.A. de C.V.",
  "PLC",
];

const STATUS = [
  "active",
  "Active",
  "A",
  "ACTIVE",
  "inactive",
  "Inactive",
  "I",
  "draft",
  "Draft",
  "Pending",
  "On Hold",
  "",
];
const STATUS_W = [
  0.34, 0.18, 0.05, 0.03, 0.09, 0.05, 0.02, 0.06, 0.03, 0.07, 0.04, 0.04,
];

const ORG_TYPE = [
  "Corporation",
  "LLC",
  "Limited Liability Company",
  "Sole Proprietor",
  "Sole Prop",
  "Partnership",
  "S-Corp",
  "Non-Profit",
  "",
];
const ORG_TYPE_W = [0.3, 0.22, 0.04, 0.08, 0.03, 0.09, 0.09, 0.04, 0.11];

const COUNTRY = [
  "US",
  "USA",
  "United States",
  "U.S.",
  "CA",
  "Canada",
  "DE",
  "Germany",
  "Deutschland",
  "MX",
  "Mexico",
  "GB",
  "United Kingdom",
  "",
];
const COUNTRY_W = [
  0.3, 0.11, 0.09, 0.02, 0.07, 0.05, 0.06, 0.04, 0.02, 0.06, 0.04, 0.05, 0.04,
  0.05,
];

const CURRENCY = [
  "USD",
  "usd",
  "US Dollar",
  "EUR",
  "Euro",
  "CAD",
  "MXN",
  "GBP",
  "",
];
const CURRENCY_W = [0.44, 0.05, 0.04, 0.13, 0.03, 0.08, 0.07, 0.09, 0.07];

const TERMS = [
  "Net 30",
  "NET30",
  "Net30",
  "N30",
  "30 days",
  "Net 45",
  "Net 60",
  "Net 15",
  "2/10 Net 30",
  "Due on receipt",
  "Immediate",
  "COD",
  "Net 90",
  "",
];
const TERMS_W = [
  0.26, 0.07, 0.05, 0.03, 0.04, 0.11, 0.09, 0.06, 0.05, 0.06, 0.03, 0.03, 0.05,
  0.07,
];

const MATCH_LEVEL = [
  "2-way",
  "2 way",
  "Two-way",
  "2 Way Match",
  "3-way",
  "3 way",
  "3 Way Match",
  "3-way-direct",
  "Three way direct",
  "none",
  "None",
  "",
];
const MATCH_LEVEL_W = [
  0.19, 0.06, 0.04, 0.03, 0.24, 0.07, 0.05, 0.08, 0.02, 0.09, 0.05, 0.08,
];

const TRUEISH = ["True", "true", "TRUE", "T", "yes", "Yes", "YES", "Y", "1"];
const FALSEISH = ["False", "false", "FALSE", "F", "no", "No", "N", "0"];

const DIVERSITY = [
  "MBE",
  "WBE",
  "WOSB",
  "SDVOSB",
  "VOSB",
  "HUBZone",
  "DBE",
  "Minority Business Enterprise",
  "Woman-Owned Small Business",
];

const PAY_GROUP = ["US-AP", "EU-AP", "CA-AP", "MX-AP", "UK-AP", ""];
const PAY_GROUP_W = [0.42, 0.14, 0.1, 0.09, 0.09, 0.16];

const RISK_TIER = [
  "1",
  "2",
  "3",
  "Low",
  "Medium",
  "High",
  "Tier 1",
  "Tier 2",
  "Tier 3",
  "",
];
const RISK_TIER_W = [
  0.16, 0.19, 0.14, 0.08, 0.09, 0.06, 0.07, 0.06, 0.04, 0.11,
];

const PLANTS = [
  "PLT-01",
  "PLT-02",
  "PLT-03",
  "PLT-04",
  "PLT-05",
  "PLT-06",
  "PLT-07",
  "PLT-08",
  "PLT-09",
  "PLT-10",
  "PLT-11",
  "PLT-12",
];

type Row = {
  "Supplier Number": string;
  "Company Name": string;
  "Display Name": string;
  "SIM Status": string;
  "Organization Type": string;
  "Federal Tax ID": string;
  DUNS: string;
  "Country of Operation": string;
  "Preferred Currency": string;
  "Payment Term": string;
  "Invoice Matching Level": string;
  "Minority Indicator": string;
  "Minority Type": string;
  "Primary Contact Email": string;
  "Pay Group": string;
  "Risk Tier": string;
  "Insurance Expiry": string;
  "Plants Served": string;
};

const ROWS = 3120;
const rng = createRng(59);

const pad = (value: number, width: number): string => {
  return String(value).padStart(width, "0");
};

const digits = (count: number): string => {
  let out = "";
  for (let i = 0; i < count; i++) {
    out += String(rng.int(0, 9));
  }
  return out;
};

const isoDate = (): { iso: string; us: string } => {
  const year = rng.int(2026, 2028);
  const month = rng.int(1, 12);
  const day = rng.int(1, 28);
  return {
    iso: `${year}-${pad(month, 2)}-${pad(day, 2)}`,
    us: `${pad(month, 2)}/${pad(day, 2)}/${year}`,
  };
};

const buildRows = (): Row[] => {
  const rows: Row[] = [];

  for (let index = 0; index < ROWS; index++) {
    const stem = rng.pick(STEMS);
    const trade = rng.pick(TRADES);
    const suffix = rng.pick(SUFFIXES);
    const legal = `${stem} ${trade} ${suffix}`;

    const diverse = rng.bool(0.22);
    const indicatorBlank = rng.bool(0.06);
    const indicator = indicatorBlank
      ? ""
      : diverse
        ? rng.pick(TRUEISH)
        : rng.pick(FALSEISH);

    // A supplier flagged as not diverse that still carries a certification.
    const strayType = !diverse && !indicatorBlank && rng.bool(0.008);

    // A real D-U-N-S is nine random digits, so about one in ten opens with a
    // zero. Excel eats that zero and nothing else in the column changes.
    const dunsFull = digits(9);
    const dunsShape = rng.pick(["kept", "dashed", "blank"], [0.84, 0.05, 0.11]);
    const eaten = dunsFull.startsWith("0") && rng.bool(0.86);
    const duns =
      dunsShape === "blank"
        ? ""
        : dunsShape === "dashed"
          ? `${dunsFull.slice(0, 2)}-${dunsFull.slice(2, 5)}-${dunsFull.slice(5)}`
          : eaten
            ? dunsFull.slice(1)
            : dunsFull;

    const einBody = digits(9);
    const einShape = rng.pick(["dashed", "plain", "blank"], [0.55, 0.36, 0.09]);
    const ein =
      einShape === "blank"
        ? ""
        : einShape === "dashed"
          ? `${einBody.slice(0, 2)}-${einBody.slice(2)}`
          : einBody;

    const localPart = `${stem.toLowerCase()}.${trade.toLowerCase()}`;
    const domain = `${stem.toLowerCase()}${trade.toLowerCase().slice(0, 3)}.com`;
    const emailShape = rng.pick(
      ["one", "two", "noAt", "blank"],
      [0.78, 0.09, 0.05, 0.08],
    );
    const email =
      emailShape === "blank"
        ? ""
        : emailShape === "two"
          ? `ap@${domain}; ${localPart}@${domain}`
          : emailShape === "noAt"
            ? `${localPart}.${domain}`
            : `${localPart}@${domain}`;

    const plantCount = rng.pick([0, 1, 2, 3, 4], [0.09, 0.3, 0.31, 0.21, 0.09]);
    const chosen: string[] = [];
    while (chosen.length < plantCount) {
      const plant = rng.pick(PLANTS);
      if (!chosen.includes(plant)) chosen.push(plant);
    }
    const separator = rng.pick([";", ", ", " / "], [0.62, 0.3, 0.08]);
    const plants = chosen.join(separator);

    const stamp = isoDate();
    const expiryShape = rng.pick(["iso", "us", "blank"], [0.62, 0.24, 0.14]);
    const expiry =
      expiryShape === "blank"
        ? ""
        : expiryShape === "us"
          ? stamp.us
          : stamp.iso;

    rows.push({
      "Supplier Number": `V-${pad(100001 + index, 6)}`,
      "Company Name": legal,
      "Display Name": rng.bool(0.62) ? `${stem} ${trade}` : "",
      "SIM Status": rng.pick(STATUS, STATUS_W),
      "Organization Type": rng.pick(ORG_TYPE, ORG_TYPE_W),
      "Federal Tax ID": ein,
      DUNS: duns,
      "Country of Operation": rng.pick(COUNTRY, COUNTRY_W),
      "Preferred Currency": rng.pick(CURRENCY, CURRENCY_W),
      "Payment Term": rng.pick(TERMS, TERMS_W),
      "Invoice Matching Level": rng.pick(MATCH_LEVEL, MATCH_LEVEL_W),
      "Minority Indicator": indicator,
      "Minority Type": diverse || strayType ? rng.pick(DIVERSITY) : "",
      "Primary Contact Email": email,
      "Pay Group": rng.pick(PAY_GROUP, PAY_GROUP_W),
      "Risk Tier": rng.pick(RISK_TIER, RISK_TIER_W),
      "Insurance Expiry": expiry,
      "Plants Served": plants,
    });
  }

  // The old system let two records share one number, and left some blank.
  const taken = new Set<number>();
  const claim = (count: number): number[] => {
    const picked: number[] = [];
    let guard = 0;
    while (picked.length < count && guard < count * 400) {
      guard++;
      const at = rng.int(0, ROWS - 1);
      if (taken.has(at)) continue;
      taken.add(at);
      picked.push(at);
    }
    return picked;
  };

  for (const at of claim(24)) {
    const donor = rng.int(0, ROWS - 1);
    if (donor === at) continue;
    (rows[at] as Row)["Supplier Number"] = (rows[donor] as Row)[
      "Supplier Number"
    ];
  }

  for (const at of claim(40)) {
    (rows[at] as Row)["Supplier Number"] = "";
  }

  return rows;
};

const PLAN = buildRows();

const column = (key: keyof Row) => {
  return custom((_rng, rowIndex) => {
    return (PLAN[rowIndex]?.[key] ?? null) as CellValue;
  });
};

export default defineFixture({
  name: "thornbury-vendors",
  sheets: [
    sheet("Suppliers", {
      rows: PLAN.length,
      seed: 59,
      columns: {
        "Supplier Number": column("Supplier Number"),
        "Company Name": column("Company Name"),
        "Display Name": column("Display Name"),
        "SIM Status": column("SIM Status"),
        "Organization Type": column("Organization Type"),
        "Federal Tax ID": column("Federal Tax ID"),
        DUNS: column("DUNS"),
        "Country of Operation": column("Country of Operation"),
        "Preferred Currency": column("Preferred Currency"),
        "Payment Term": column("Payment Term"),
        "Invoice Matching Level": column("Invoice Matching Level"),
        "Minority Indicator": column("Minority Indicator"),
        "Minority Type": column("Minority Type"),
        "Primary Contact Email": column("Primary Contact Email"),
        "Pay Group": column("Pay Group"),
        "Risk Tier": column("Risk Tier"),
        "Insurance Expiry": column("Insurance Expiry"),
        "Plants Served": column("Plants Served"),
      },
    }),
  ],
  outputs: ["csv"],
});
