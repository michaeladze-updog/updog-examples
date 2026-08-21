import { createRng, custom, defineFixture, sheet } from "../src/index";
import type { CellValue } from "../src/index";

type Property = {
  code: string;
  names: string[];
  nameWeights: number[];
  addresses: string[];
  addressWeights: number[];
  buildings: number;
  floors: number;
};

const PROPERTIES: Property[] = [
  {
    code: "GRN",
    names: [
      "Greenfield Commons",
      "Greenfield Commons Apartments",
      "GREENFIELD COMMONS",
    ],
    nameWeights: [0.92, 0.06, 0.02],
    addresses: ["1400 Greenfield Rd", "1400 Greenfield Road"],
    addressWeights: [0.89, 0.11],
    buildings: 4,
    floors: 4,
  },
  {
    code: "HWK",
    names: ["Hawthorn Yard", "Hawthorn Yard Apts"],
    nameWeights: [0.95, 0.05],
    addresses: ["22 Hawthorn St", "22 Hawthorn Street"],
    addressWeights: [0.93, 0.07],
    buildings: 3,
    floors: 4,
  },
  {
    code: "ELM",
    names: ["Elmcourt Flats"],
    nameWeights: [1],
    addresses: ["815 Elm Court"],
    addressWeights: [1],
    buildings: 2,
    floors: 5,
  },
  {
    code: "RIV",
    names: ["Riverbend Terrace", "Riverbend Terr."],
    nameWeights: [0.97, 0.03],
    addresses: ["60 Riverbend Way"],
    addressWeights: [1],
    buildings: 2,
    floors: 4,
  },
  {
    code: "STN",
    names: ["Stonegate Mews"],
    nameWeights: [1],
    addresses: ["9 Stonegate Ln", "9 Stonegate Lane"],
    addressWeights: [0.96, 0.04],
    buildings: 2,
    floors: 3,
  },
  {
    code: "LKS",
    names: ["Lakeside Row", "Lakeside Row Phase II"],
    nameWeights: [0.94, 0.06],
    addresses: ["118 Lakeside Row"],
    addressWeights: [1],
    buildings: 1,
    floors: 5,
  },
];

const UNITS_PER_FLOOR = 30;

const LAST_NAMES = [
  "Ashworth",
  "Beaumont",
  "Cisneros",
  "Danquah",
  "Eriksen",
  "Fontaine",
  "Grierson",
  "Haddad",
  "Ishikawa",
  "Jelinek",
  "Kowalczyk",
  "Lindgren",
  "Mwangi",
  "Nakamura",
  "Oyelaran",
  "Pemberton",
  "Quintero",
  "Radulescu",
  "Sorokin",
  "Tavares",
  "Ubaldi",
  "Villanueva",
  "Wexler",
  "Yoshida",
  "Zambrano",
  "Broussard",
  "Calderon",
  "Dupont",
  "Engelhardt",
  "Ferrante",
];

const FIRST_NAMES = [
  "Amara",
  "Bastien",
  "Clemence",
  "Dario",
  "Elke",
  "Ferran",
  "Greta",
  "Hamza",
  "Ilse",
  "Joaquin",
  "Katrien",
  "Lachlan",
  "Marisol",
  "Nadim",
  "Ottilie",
  "Priya",
  "Quentin",
  "Rosalind",
  "Soren",
  "Tamsin",
  "Ulrich",
  "Valentina",
  "Wilhelmina",
  "Xavier",
  "Yannick",
  "Zora",
  "Aurelio",
  "Bettina",
  "Casimir",
  "Delphine",
];

const OCCUPIED_STATUS = ["Occupied", "Occ", "MTM", "Notice", "NTV", "Employee"];
const OCCUPIED_WEIGHTS = [0.45, 0.235, 0.115, 0.105, 0.07, 0.025];

const VACANT_STATUS = ["Vacant", "VAC", "Vacant-Ready", "Down", "Model"];
const VACANT_WEIGHTS = [0.36, 0.29, 0.19, 0.11, 0.05];

const DAY = 86400000;

const iso = (value: number): string => {
  return new Date(value).toISOString().slice(0, 10);
};

const monthAndYear = (value: number): string => {
  const date = new Date(value);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${month}/${date.getUTCFullYear()}`;
};

const money = (rng: ReturnType<typeof createRng>, amount: number): string => {
  const grouped = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return rng.bool(0.55) ? `$${grouped}` : grouped;
};

type PlanRow = {
  Prop: string;
  Property: string;
  "Property Address": string;
  Unit: string;
  SqFt: CellValue;
  Beds: number;
  Baths: CellValue;
  Status: string;
  Resident: string;
  Email: string;
  "Lease From": string;
  "Lease To": string;
  "Market Rent": string;
  Rent: string;
};

const buildPlan = (): PlanRow[] => {
  const rng = createRng(23);
  const rows: PlanRow[] = [];

  type Unit = {
    property: Property;
    unit: string;
    beds: number;
    baths: number;
    sqft: number;
    marketRent: number;
    occupied: boolean;
    index: number;
  };

  const units: Unit[] = [];

  for (const property of PROPERTIES) {
    for (let building = 0; building < property.buildings; building++) {
      const letter = String.fromCharCode(65 + building);
      for (let floor = 1; floor <= property.floors; floor++) {
        for (let n = 1; n <= UNITS_PER_FLOOR; n++) {
          const beds = rng.pick([0, 1, 2, 3], [0.08, 0.42, 0.38, 0.12]);
          const baths =
            beds >= 2 ? rng.pick([1, 1.5, 2], [0.3, 0.35, 0.35]) : 1;
          const sqft = 420 + beds * 260 + rng.int(0, 140);
          const marketRent =
            Math.round((980 + beds * 420 + rng.int(0, 260)) / 5) * 5;
          units.push({
            property,
            unit: `${letter}${floor}${String(n).padStart(2, "0")}`,
            beds,
            baths,
            sqft,
            marketRent,
            occupied: rng.bool(0.874),
            index: units.length,
          });
        }
      }
    }
  }

  const asOf = Date.parse("2026-08-01T00:00:00Z");

  const nameFor = (): string => {
    return `${rng.pick(LAST_NAMES)}, ${rng.pick(FIRST_NAMES)}`;
  };

  const emailFor = (resident: string): string => {
    const [last, first] = resident.split(", ");
    const local = `${String(first).toLowerCase()}.${String(last).toLowerCase()}`;
    const domain = rng.pick(
      ["example.com", "mail.example.net", "example.org"],
      [0.62, 0.23, 0.15],
    );
    if (rng.bool(0.014)) {
      return `${local}@example,com`;
    }
    return `${local}@${domain}`;
  };

  const emit = (
    unit: Unit,
    status: string,
    from: number | null,
    to: number | null,
    resident: string | null,
    rentAmount: number | null,
  ): void => {
    const property = unit.property;
    rows.push({
      Prop: property.code,
      Property: rng.pick(property.names, property.nameWeights),
      "Property Address": rng.pick(property.addresses, property.addressWeights),
      Unit: unit.unit,
      SqFt: rng.bool(0.02)
        ? null
        : unit.sqft >= 1000
          ? unit.sqft.toLocaleString("en-US")
          : unit.sqft,
      Beds: unit.beds,
      Baths: unit.baths,
      Status: status,
      Resident: resident ?? "",
      Email:
        resident &&
        status !== "Down" &&
        status !== "Model" &&
        status !== "Vacant" &&
        status !== "VAC" &&
        status !== "Vacant-Ready"
          ? emailFor(resident)
          : "",
      "Lease From":
        from === null ? "" : rng.bool(0.022) ? monthAndYear(from) : iso(from),
      "Lease To": to === null ? "" : iso(to),
      "Market Rent": rng.bool(0.0155) ? "-" : money(rng, unit.marketRent),
      Rent: rentAmount === null ? "" : money(rng, rentAmount),
    });
  };

  const leaseRange = (): [number, number | null] => {
    const start = asOf - rng.int(30, 900) * DAY;
    const monthToMonth = rng.bool(0.09);
    return [start, monthToMonth ? null : start + rng.int(180, 400) * DAY];
  };

  const roommateUnits = new Set<number>();
  const turnoverUnits = new Set<number>();
  const overlapUnits = new Set<number>();

  const occupiedUnits = units.filter((unit) => {
    return unit.occupied;
  });

  const claim = (target: Set<number>, count: number): void => {
    let placed = 0;
    let guard = 0;
    while (placed < count && guard < count * 60) {
      guard++;
      const candidate = rng.pick(occupiedUnits);
      if (
        roommateUnits.has(candidate.index) ||
        turnoverUnits.has(candidate.index) ||
        overlapUnits.has(candidate.index)
      ) {
        continue;
      }
      target.add(candidate.index);
      placed++;
    }
  };

  claim(roommateUnits, 118);
  claim(turnoverUnits, 62);
  claim(overlapUnits, 15);

  for (const unit of units) {
    if (!unit.occupied) {
      const vacantStatus = rng.pick(VACANT_STATUS, VACANT_WEIGHTS);
      const stale = rng.bool(0.058) ? nameFor() : null;
      emit(unit, vacantStatus, null, null, stale, null);
      continue;
    }

    const status = rng.pick(OCCUPIED_STATUS, OCCUPIED_WEIGHTS);
    const [from, to] = leaseRange();
    const rent = unit.marketRent - rng.int(0, 12) * 5;
    const resident = rng.bool(0.004) ? null : nameFor();

    if (turnoverUnits.has(unit.index)) {
      const priorTo = from - rng.int(5, 40) * DAY;
      const priorFrom = priorTo - rng.int(300, 400) * DAY;
      emit(unit, "Occupied", priorFrom, priorTo, nameFor(), rent - 40);
    }

    emit(unit, status, from, to, resident, rent);

    if (roommateUnits.has(unit.index)) {
      emit(unit, status, from, to, nameFor(), rent);
    }

    if (overlapUnits.has(unit.index)) {
      const secondFrom = from + rng.int(20, 150) * DAY;
      const secondTo = secondFrom + rng.int(200, 380) * DAY;
      emit(unit, "Occupied", secondFrom, secondTo, nameFor(), rent + 25);
    }
  }

  return rows;
};

const PLAN = buildPlan();

const column = (key: keyof PlanRow) => {
  return custom((_rng, rowIndex) => {
    return PLAN[rowIndex]?.[key] ?? null;
  });
};

export default defineFixture({
  name: "marbury-roll",
  sheets: [
    sheet("Rent Roll", {
      rows: PLAN.length,
      seed: 23,
      columns: {
        Prop: column("Prop"),
        Property: column("Property"),
        "Property Address": column("Property Address"),
        Unit: column("Unit"),
        SqFt: column("SqFt"),
        Beds: column("Beds"),
        Baths: column("Baths"),
        Status: column("Status"),
        Resident: column("Resident"),
        Email: column("Email"),
        "Lease From": column("Lease From"),
        "Lease To": column("Lease To"),
        "Market Rent": column("Market Rent"),
        Rent: column("Rent"),
      },
    }),
  ],
  outputs: ["csv"],
});
