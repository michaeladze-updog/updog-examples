import { custom, date, defineFixture, pick, seq, sheet } from "../src/index";
import type { CellValue, PartialRow } from "../src/index";

const MODELS = [
  "Ford Transit 350",
  "Ford Transit Custom 300",
  "Mercedes Sprinter 315",
  "Mercedes Sprinter 317",
  "Vauxhall Vivaro 2900",
  "Renault Trafic SL28",
  "Peugeot Boxer 335",
];

const DEPOTS = ["North", "South", "East", "Wakefield"];

const DEPOT_CODES: Record<string, string> = {
  North: "DEP-N",
  South: "DEP-S",
  East: "DEP-E",
  Wakefield: "DEP-WF",
};

const LETTERS = "ABCDEFGHJKLMNOPRSTUVWXY";
const AREAS = ["BX", "LT", "YA", "SN", "WF", "LS", "MK", "PE"];

const plate = custom((rng) => {
  const area = rng.pick(AREAS);
  const age = String(rng.int(16, 25)).padStart(2, "0");
  const tail = Array.from({ length: 3 }, () => {
    return LETTERS[rng.int(0, LETTERS.length - 1)];
  }).join("");
  return `${area}${age} ${tail}`;
});

const odometer = custom((rng) => {
  const km = rng.int(4_000, 240_000);
  return String(km).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
});

const depotCode = custom((_rng, _rowIndex, row: PartialRow): CellValue => {
  return DEPOT_CODES[String(row["Home Depot"])] ?? "";
});

const vehicles = sheet("Vehicles", {
  rows: 214,
  seed: 31,
  columns: {
    "Vehicle #": seq("FL-{n:04}"),
    Reg: plate,
    "Make/Model": pick(MODELS),
    Odo: odometer,
    "In Service": date("2018-04-01", "2026-05-31", { as: "DD/MM/YYYY" }),
    "Home Depot": pick(DEPOTS, [0.34, 0.27, 0.24, 0.15]),
    "Depot Code": depotCode,
  },
  overrides: [
    {
      at: 213,
      Reg: "YD22 NPZ",
      "Make/Model": "Vauxhall Vivaro 2900",
      Odo: "88 402",
      "In Service": "14/03/2022",
      "Home Depot": "South",
      "Depot Code": "DEP-S",
    },
  ],
});

vehicles.header[6] = "Home Depot";

export default defineFixture({
  name: "depot-fleet",
  sheets: [vehicles],
  outputs: ["csv", "xlsx"],
});
