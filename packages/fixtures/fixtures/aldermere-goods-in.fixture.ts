import { custom, defineFixture, number, pick, seq, sheet } from "../src/index";

/**
 * A 3PL warehouse's inbound bookings, exported from the system it ran before.
 * The file is clean on purpose: every header reaches a differently named column
 * on its own, and all three option lists are spelled the way the importer
 * declares them. Every slot date lands between the 13th and the 28th, so no
 * value can be read as a day and month swapping places.
 */

const STEMS = [
  "Tarnwick",
  "Beckhurst",
  "Colwyn",
  "Drayfold",
  "Elverton",
  "Fossgate",
  "Grindale",
  "Halverne",
  "Inglebrook",
  "Jarrowmere",
  "Kelsall",
  "Lindholme",
  "Marfield",
  "Nethercote",
  "Orrell",
  "Pelsham",
  "Quarnby",
  "Redmoss",
  "Skelbrook",
  "Thurlow",
  "Uldale",
  "Vernham",
  "Westhorpe",
  "Yarborne",
];

const TRADES = [
  "Packaging",
  "Timber",
  "Fasteners",
  "Adhesives",
  "Abrasives",
  "Coatings",
  "Textiles",
  "Castings",
  "Seals",
  "Bearings",
  "Insulation",
  "Glassworks",
];

const SUFFIXES = ["Ltd", "PLC", "Group", "Works", "LLP", "Supplies"];

const MONTHS = [
  "2026-09",
  "2026-10",
  "2026-11",
  "2026-12",
  "2027-01",
  "2027-02",
];

const supplierAt = (index: number): string => {
  const stem = STEMS[index % STEMS.length];
  const trade = TRADES[(index * 5) % TRADES.length];
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
  name: "aldermere-goods-in",
  sheets: [
    sheet("Goods in", {
      rows: 280,
      seed: 31,
      columns: {
        "Delivery no.": seq("AG-{n:04}"),
        "Supplier name": custom((_rng, index) => {
          return supplierAt(index);
        }),
        "Carrier name": pick(
          [
            "Ravenhill Haulage",
            "Copsey Transport",
            "Marden Freight",
            "Delwyn Logistics",
          ],
          [0.34, 0.26, 0.24, 0.16],
        ),
        "Pallets received": number(1, 33),
        "Gross weight (kg)": number(180, 21500, { decimals: 2 }),
        "Slot date": custom((rng) => {
          const month = MONTHS[rng.int(0, MONTHS.length - 1)];
          const day = String(rng.int(13, 28)).padStart(2, "0");
          return `${month}-${day}`;
        }),
        Dock: pick(["Dock 1", "Dock 2", "Dock 3"], [0.4, 0.35, 0.25]),
        "Load status": pick(
          ["Booked", "Arrived", "Unloaded"],
          [0.5, 0.28, 0.22],
        ),
        "Booking contact email": custom((_rng, index) => {
          return `bookings@${slug(supplierAt(index))}.example`;
        }),
      },
    }),
  ],
  outputs: ["csv", "xlsx"],
});
