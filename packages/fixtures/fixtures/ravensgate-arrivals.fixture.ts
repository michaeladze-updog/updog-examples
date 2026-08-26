import { custom, date, defineFixture, pick, sheet } from "../src/index";

const VESSELS = [
  "Kestrel Bay",
  "Aldervik",
  "Marisol Trader",
  "Sable Point",
  "Corvid Star",
  "Thorne Meridian",
  "Ligurian Dawn",
  "Brackwater",
  "Nordkapp Rose",
  "Selkie of Leith",
  "Auravik",
  "Pentland Carrier",
  "Ossian Bay",
  "Halvard Sund",
  "Merrow Light",
  "Fjordline Ember",
  "Castellan Reach",
  "Windrose Marne",
  "Talisker Sound",
  "Ondine Fell",
];

const BERTHS = ["Quay 1", "Quay 2", "Quay 3", "Quay 4", "Quay 5"];

/**
 * The port numbers its calls in one run across the season, so the reference is
 * the row index offset rather than a generator sequence. Row 3 overrides its
 * reference back to the one above it, which is the duplicate the article shows.
 */
const callRef = custom((_rng, rowIndex) => {
  return `PC-2026-${String(413 + rowIndex).padStart(4, "0")}`;
});

/** IMO numbers are seven digits. These are invented and reach no real ship. */
const imo = custom((rng) => {
  return String(rng.int(9000000, 9599999));
});

const arrivals = sheet("Arrivals", {
  rows: 57,
  seed: 23,
  columns: {
    "Call Ref": callRef,
    Vessel: pick(VESSELS),
    IMO: imo,
    Berth: pick(BERTHS),
    ETA: date("2026-03-30", "2026-04-05", { as: "YYYY-MM-DD" }),
    Status: pick(["Expected", "Berthed", "Departed"], [0.6, 0.25, 0.15]),
  },
  overrides: [
    {
      at: 0,
      Vessel: "Kestrel Bay",
      IMO: "IMO 9074729",
      Berth: "Quay 3",
      ETA: "2026-04-02",
      Status: "Expected",
    },
    {
      at: 1,
      Vessel: "Aldervik",
      IMO: "9182741",
      Berth: "Quay 1",
      ETA: "2026-04-02",
      Status: "Along side",
    },
    {
      at: 2,
      Vessel: "Marisol Trader",
      IMO: "9331556",
      Berth: "Quay 4",
      ETA: "2026-04-03",
      Status: "Expected",
    },
    {
      at: 3,
      "Call Ref": "PC-2026-0415",
      Vessel: "Marisol Trader",
      IMO: "9331556",
      Berth: "Quay 4",
      ETA: "2026-04-03",
      Status: "Expected",
    },
    {
      at: 56,
      Vessel: "Sable Point",
      IMO: "9448023",
      Berth: "Quay 2",
      ETA: "2026-04-05",
      Status: "Expected",
    },
  ],
});

export default defineFixture({
  name: "ravensgate-arrivals",
  sheets: [arrivals],
  outputs: ["csv", "xlsx"],
});
