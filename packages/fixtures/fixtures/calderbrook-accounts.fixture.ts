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
  "Alverston",
  "Bramfield",
  "Caldbeck",
  "Dunholme",
  "Ellerby",
  "Fenwick",
  "Garsdale",
  "Haverton",
  "Ilkeston",
  "Jesmond",
  "Kirkbride",
  "Lyneham",
  "Melbury",
  "Northwold",
  "Ottermill",
  "Padstow",
  "Quenby",
  "Rushmere",
  "Stanbury",
  "Tarleton",
  "Uppingham",
  "Voewood",
  "Wandsford",
  "Yeadon",
  "Ashbourne",
  "Broughton",
];

const TRADES = [
  "Analytics",
  "Biotech",
  "Chemicals",
  "Diagnostics",
  "Energy",
  "Freight",
  "Health",
  "Instruments",
  "Labs",
  "Media",
  "Networks",
  "Optics",
  "Robotics",
  "Systems",
  "Telecom",
  "Utilities",
];

const SUFFIXES = ["Ltd", "PLC", "Group", "Holdings", "AB", "GmbH"];

const FIRST_NAMES = [
  "Adela",
  "Bram",
  "Corin",
  "Delphine",
  "Emeric",
  "Fenella",
  "Gideon",
  "Halvard",
  "Isolde",
  "Jorin",
  "Katrien",
  "Lorcan",
  "Marisol",
  "Nevin",
  "Orla",
  "Perrin",
];

const LAST_NAMES = [
  "Ashgrove",
  "Bellweather",
  "Crandale",
  "Dunmore",
  "Eastleigh",
  "Fairhurst",
  "Greenhalgh",
  "Hartnoll",
  "Ivenshaw",
  "Jerrold",
  "Kilbride",
  "Lymington",
  "Mossgate",
  "Norbury",
  "Ockendon",
  "Pennington",
];

const slug = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 14);
};

const companyAt = (index: number): string => {
  const stem = STEMS[index % STEMS.length];
  const trade = TRADES[(index * 7) % TRADES.length];
  const suffix = SUFFIXES[(index * 5) % SUFFIXES.length];
  return `${stem} ${trade} ${suffix}`;
};

const personAt = (index: number): string => {
  const first = FIRST_NAMES[(index * 3) % FIRST_NAMES.length];
  const last = LAST_NAMES[(index * 11) % LAST_NAMES.length];
  return `${first} ${last}`;
};

export default defineFixture({
  name: "calderbrook-accounts",
  sheets: [
    sheet("Accounts", {
      rows: 180,
      seed: 19,
      columns: {
        "Account ref": seq("CB-{n:04}"),
        "Company name": custom((_rng, index) => {
          return companyAt(index);
        }),
        "Website URL": custom((_rng, index) => {
          return `${slug(companyAt(index))}.example`;
        }),
        "Subscription tier": pick(
          ["Starter", "Growth", "Enterprise"],
          [0.4, 0.4, 0.2],
        ),
        Seats: number(4, 940),
        "Renewal date": date("2026-09-01", "2027-08-31", { as: "YYYY-MM-DD" }),
        Region: pick(["EMEA", "AMER", "APAC"], [0.45, 0.35, 0.2]),
        "Main contact": custom((_rng, index) => {
          return personAt(index);
        }),
        "Contact email": custom((_rng, index) => {
          const person = personAt(index).toLowerCase().split(" ");
          return `${person[0]}.${person[1]}@${slug(companyAt(index))}.example`;
        }),
      },
    }),
  ],
  outputs: ["csv", "xlsx"],
});
