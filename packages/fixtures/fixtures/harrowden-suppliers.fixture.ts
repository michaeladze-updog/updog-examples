import {
  custom,
  date,
  defineFixture,
  number,
  pick,
  seq,
  sheet,
} from "../src/index";

const STEMS = [
  "Ambleforth",
  "Barrowden",
  "Cheswick",
  "Dunsmere",
  "Edgeworth",
  "Frampton",
  "Galloway",
  "Hartshorne",
  "Innesford",
  "Jevington",
  "Knayton",
  "Larkhall",
  "Mirfield",
  "Newsholme",
  "Oswaldkirk",
  "Penrhos",
  "Quorndon",
  "Redmarley",
  "Sedgeberrow",
  "Tavistoke",
  "Ulverston",
  "Vaynor",
  "Whitbourne",
  "Yatesbury",
  "Alnmouth",
  "Bexwell",
];

const TRADES = [
  "Cartons",
  "Crates",
  "Films",
  "Labels",
  "Pallets",
  "Haulage",
  "Freight",
  "Couriers",
  "Warehousing",
  "Polymers",
  "Adhesives",
  "Alloys",
  "Pigments",
  "Timber",
  "Glassworks",
  "Cleaning",
  "Calibration",
  "Tooling",
  "Filters",
  "Lubricants",
];

const CATEGORY_OF_TRADE: Record<string, string> = {
  Cartons: "Packaging",
  Crates: "Packaging",
  Films: "Packaging",
  Labels: "Packaging",
  Pallets: "Packaging",
  Haulage: "Logistics",
  Freight: "Logistics",
  Couriers: "Logistics",
  Warehousing: "Logistics",
  Polymers: "Raw materials",
  Adhesives: "Raw materials",
  Alloys: "Raw materials",
  Pigments: "Raw materials",
  Timber: "Raw materials",
  Glassworks: "Raw materials",
  Cleaning: "Maintenance",
  Calibration: "Maintenance",
  Tooling: "Maintenance",
  Filters: "Maintenance",
  Lubricants: "Maintenance",
};

const SUFFIXES = ["Ltd", "PLC", "Group", "BV", "SRL", "Oy"];

const FIRST_NAMES = [
  "Anselm",
  "Brioney",
  "Caius",
  "Deryn",
  "Eamon",
  "Ffion",
  "Gwilym",
  "Hesper",
  "Idris",
  "Jolanta",
  "Kester",
  "Linnet",
  "Merrick",
  "Nessa",
  "Osric",
  "Petra",
];

const LAST_NAMES = [
  "Ambleside",
  "Barrowclough",
  "Chevington",
  "Dunwoody",
  "Elverton",
  "Fanshawe",
  "Gadsby",
  "Halliwell",
  "Inkpen",
  "Jelbart",
  "Kinnaird",
  "Lockhart",
  "Marchbank",
  "Nettleford",
  "Oldbury",
  "Prescott",
];

const slug = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 14);
};

const tradeAt = (index: number): string => {
  return TRADES[(index * 7) % TRADES.length];
};

const companyAt = (index: number): string => {
  const stem = STEMS[index % STEMS.length];
  const suffix = SUFFIXES[(index * 5) % SUFFIXES.length];
  return `${stem} ${tradeAt(index)} ${suffix}`;
};

const personAt = (index: number): string => {
  const first = FIRST_NAMES[(index * 3) % FIRST_NAMES.length];
  const last = LAST_NAMES[(index * 11) % LAST_NAMES.length];
  return `${first} ${last}`;
};

export default defineFixture({
  name: "harrowden-suppliers",
  sheets: [
    sheet("Suppliers", {
      rows: 640,
      seed: 44,
      columns: {
        "Vendor code": seq("HW-{n:04}"),
        "Vendor name": custom((_rng, index) => {
          return companyAt(index);
        }),
        "Spend category": custom((_rng, index) => {
          return CATEGORY_OF_TRADE[tradeAt(index)];
        }),
        Incoterm: pick(["EXW", "FOB", "DAP", "DDP"], [0.2, 0.25, 0.35, 0.2]),
        "Lead time (days)": number(3, 60),
        "Approved on": date("2024-01-08", "2026-08-14", { as: "YYYY-MM-DD" }),
        Status: pick(["Approved", "Pending", "Suspended"], [0.7, 0.22, 0.08]),
        "Buyer contact": custom((_rng, index) => {
          return personAt(index);
        }),
        "E-mail": custom((_rng, index) => {
          const person = personAt(index).toLowerCase().split(" ");
          return `${person[0]}.${person[1]}@${slug(companyAt(index))}.example`;
        }),
      },
    }),
  ],
  outputs: ["csv", "xlsx"],
});
