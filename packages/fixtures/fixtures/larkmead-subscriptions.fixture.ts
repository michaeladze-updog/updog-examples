import { custom, defineFixture, number, pick, seq, sheet } from "../src/index";

const STEMS = [
  "Ashvale",
  "Brindon",
  "Culverton",
  "Dellingham",
  "Eastmarsh",
  "Fairholt",
  "Glenmore",
  "Harkness",
  "Inglewood",
  "Kettleby",
  "Longmere",
  "Marchford",
  "Netherfold",
  "Oakhanger",
  "Pentridge",
  "Quarrendon",
  "Rowanhead",
  "Southwick",
  "Thurloxton",
  "Wilbraham",
];

const TRADES = [
  "Studio",
  "Clinic",
  "Fitness",
  "Bakery",
  "Garage",
  "Salon",
  "Nursery",
  "Joinery",
  "Print",
  "Tutors",
  "Veterinary",
  "Florists",
  "Removals",
  "Plumbing",
];

const SUFFIXES = ["Ltd", "LLP", "Co", "Group"];

const PLANS = ["Lite", "Core", "Agency"];
const CYCLES = ["Monthly", "Quarterly", "Annual"];
const CYCLE_MONTHS: Record<string, number> = {
  Monthly: 1,
  Quarterly: 3,
  Annual: 12,
};

const FIRST_DAY = 13;
const LAST_DAY = 28;
const REFERENCE = Date.UTC(2026, 7, 29);

const iso = (year: number, month: number, day: number): string => {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const companyAt = (index: number): string => {
  const stem = STEMS[index % STEMS.length];
  const trade = TRADES[(index * 3) % TRADES.length];
  const suffix = SUFFIXES[(index * 7) % SUFFIXES.length];
  return `${stem} ${trade} ${suffix}`;
};

const slug = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 16);
};

export default defineFixture({
  name: "larkmead-subscriptions",
  sheets: [
    sheet("Subscriptions", {
      rows: 240,
      seed: 13,
      columns: {
        "Subscription ID": seq("LM-{n:04}"),
        "Account name": custom((_rng, index) => {
          return companyAt(index);
        }),
        Plan: pick(PLANS, [0.45, 0.35, 0.2]),
        "Billing frequency": pick(CYCLES, [0.55, 0.2, 0.25]),
        Quantity: number(1, 120),
        "Price per unit": number(4, 90, { decimals: 2 }),
        "Contract start": custom((rng) => {
          const year = rng.pick([2024, 2025, 2026], [0.3, 0.45, 0.25]);
          const month = rng.int(0, year === 2026 ? 5 : 11);
          return iso(year, month, rng.int(FIRST_DAY, LAST_DAY));
        }),
        "Renewal due": custom((_rng, _index, row) => {
          const start = String(row["Contract start"]);
          const [year, month, day] = start.split("-").map(Number);
          const step = CYCLE_MONTHS[String(row["Billing frequency"])] ?? 12;
          let next = new Date(Date.UTC(year, month - 1, day));

          while (next.getTime() <= REFERENCE) {
            next = new Date(
              Date.UTC(
                next.getUTCFullYear(),
                next.getUTCMonth() + step,
                next.getUTCDate(),
              ),
            );
          }

          return iso(
            next.getUTCFullYear(),
            next.getUTCMonth(),
            next.getUTCDate(),
          );
        }),
        "Billing contact email": custom((_rng, index) => {
          return `billing@${slug(companyAt(index))}.example`;
        }),
      },
    }),
  ],
  outputs: ["csv", "xlsx"],
});
