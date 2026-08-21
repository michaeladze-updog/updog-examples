import { defineFixture } from "../src/index";
import type { CellValue, Sheet } from "../src/model";
import { createRng } from "../src/random";

const HEADER_TOP: CellValue[] = [
  "PHASE",
  "ITEM NO.",
  "DESCRIPTION OF WORK",
  "COST TYPE",
  "SCHEDULED VALUE",
  "WORK COMPLETED",
  null,
  "MATERIALS PRESENTLY STORED",
  "BALANCE TO FINISH",
];

const HEADER_BOTTOM: CellValue[] = [
  null,
  null,
  null,
  null,
  null,
  "FROM PREVIOUS APPLICATION",
  "THIS PERIOD",
  null,
  null,
];

const COST_TYPES: [string, number][] = [
  ["L", 14],
  ["M", 13],
  ["S", 12],
  ["E", 7],
  ["Labor", 9],
  ["Material", 8],
  ["Subcontract", 7],
  ["Equipment", 5],
  ["LAB", 4],
  ["MAT", 4],
  ["Sub", 4],
  ["Subcontractor", 4],
  ["O", 3],
  ["Prof Services", 2],
  ["Owner", 2],
  ["", 2],
];

type Code = { tier1: string; tier2: string; name: string; eaten?: true };

const CATALOGUE: Record<string, Code[]> = {
  "Enabling Works": [
    { tier1: "01", tier2: "010", name: "Project Manager" },
    { tier1: "01", tier2: "500", name: "Temporary Facilities and Controls" },
    { tier1: "01", tier2: "740", name: "Cleaning" },
    { tier1: "02", tier2: "220", name: "Site Demolition" },
    { tier1: "02", tier2: "230", name: "Site Clearing" },
    { tier1: "02", tier2: "315", name: "Excavation and Backfill" },
    {
      tier1: "02",
      tier2: "20",
      name: "Hazardous Material Survey",
      eaten: true,
    },
    { tier1: "02", tier2: "480", name: "Dewatering" },
  ],
  Substructure: [
    { tier1: "03", tier2: "100", name: "Concrete Reinforcement" },
    { tier1: "03", tier2: "210", name: "Cast-In-Place Concrete" },
    { tier1: "03", tier2: "300", name: "Footings" },
    { tier1: "03", tier2: "320", name: "Slab on Grade" },
    { tier1: "02", tier2: "360", name: "Piling" },
    { tier1: "03", tier2: "410", name: "Precast Concrete Panels" },
    { tier1: "07", tier2: "130", name: "Waterproofing Below Grade" },
  ],
  Superstructure: [
    { tier1: "03", tier2: "210", name: "Cast-In-Place Concrete" },
    { tier1: "03", tier2: "450", name: "Precast Structural Framing" },
    { tier1: "05", tier2: "120", name: "Structural Steel Framing" },
    { tier1: "05", tier2: "310", name: "Steel Deck" },
    { tier1: "05", tier2: "12", name: "Steel Erection", eaten: true },
    { tier1: "06", tier2: "100", name: "Rough Carpentry" },
    { tier1: "03", tier2: "100", name: "Concrete Reinforcement" },
  ],
  Envelope: [
    { tier1: "07", tier2: "210", name: "Thermal Insulation" },
    { tier1: "07", tier2: "410", name: "Metal Roof Panels" },
    { tier1: "07", tier2: "540", name: "Thermoplastic Membrane Roofing" },
    { tier1: "07", tier2: "920", name: "Joint Sealants" },
    { tier1: "08", tier2: "410", name: "Aluminium Entrances and Storefronts" },
    { tier1: "08", tier2: "440", name: "Curtain Wall" },
    { tier1: "04", tier2: "200", name: "Unit Masonry" },
  ],
  Interiors: [
    { tier1: "09", tier2: "250", name: "Gypsum Board Assemblies" },
    { tier1: "09", tier2: "510", name: "Acoustical Ceilings" },
    { tier1: "09", tier2: "650", name: "Resilient Flooring" },
    { tier1: "09", tier2: "30", name: "Tiling", eaten: true },
    { tier1: "09", tier2: "910", name: "Painting" },
    { tier1: "08", tier2: "110", name: "Steel Doors and Frames" },
    { tier1: "10", tier2: "280", name: "Toilet Accessories" },
    { tier1: "12", tier2: "480", name: "Entrance Floor Mats" },
  ],
  "Mechanical and Electrical": [
    { tier1: "15", tier2: "100", name: "Plumbing Piping" },
    { tier1: "15", tier2: "400", name: "Plumbing Fixtures" },
    {
      tier1: "06",
      tier2: "24",
      name: "Interior Architectural Woodwork",
      eaten: true,
    },
    { tier1: "15", tier2: "700", name: "Air Handling Units" },
    { tier1: "15", tier2: "820", name: "Ductwork" },
    { tier1: "16", tier2: "120", name: "Conductors and Cables" },
    { tier1: "16", tier2: "510", name: "Interior Lighting" },
    { tier1: "16", tier2: "720", name: "Fire Alarm" },
    { tier1: "14", tier2: "210", name: "Electric Traction Elevators" },
  ],
  Sitework: [
    { tier1: "02", tier2: "510", name: "Water Distribution" },
    { tier1: "02", tier2: "630", name: "Storm Drainage" },
    { tier1: "02", tier2: "740", name: "Asphalt Paving" },
    { tier1: "02", tier2: "770", name: "Curbs and Gutters" },
    { tier1: "02", tier2: "930", name: "Planting" },
    { tier1: "17", tier2: "100", name: "General Conditions Markup" },
    { tier1: "17", tier2: "200", name: "Contingency" },
  ],
};

const MASTERFORMAT: Record<string, string> = {
  "02-315": "31 23 00",
  "02-740": "32 12 00",
  "03-100": "03 20 00",
  "03-210": "03 30 00",
  "03-410": "03 40 00",
  "03-450": "03 40 00",
  "04-200": "04 20 00",
  "07-210": "07 21 00",
  "07-540": "07 54 00",
  "08-440": "08 44 00",
  "09-250": "09 29 00",
  "09-910": "09 91 00",
  "15-100": "22 11 00",
  "16-510": "26 51 00",
};

const PHASES = Object.keys(CATALOGUE);

const PHASE_SIZES = [64, 88, 96, 82, 118, 126, 58];

const FIRST_DATA_ROW = 7;

const money = (value: number): string =>
  `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const asExcelDate = (tier1: string, tier2: string): Date =>
  new Date(Date.UTC(2026, Number(tier1) - 1, Number(tier2)));

const rng = createRng(41);

const merges: string[] = [
  "A1:I1",
  "A2:I2",
  "A3:I3",
  "A5:A6",
  "B5:B6",
  "C5:C6",
  "D5:D6",
  "E5:E6",
  "F5:G5",
  "H5:H6",
  "I5:I6",
];

const costType = (): string =>
  rng.pick(
    COST_TYPES.map(([value]) => value),
    COST_TYPES.map(([, weight]) => weight),
  );

const writeCode = (code: Code): CellValue => {
  const dashed = `${code.tier1}-${code.tier2}`;
  const roll = rng.next();
  if (code.eaten) {
    return roll < 0.72 ? asExcelDate(code.tier1, code.tier2) : dashed;
  }
  const section = MASTERFORMAT[dashed];
  if (section && roll < 0.34) return section;
  if (roll > 0.93) return `${code.tier1}.${code.tier2}`;
  return dashed;
};

const blankRow = (): CellValue[] => [
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
];

const rows: CellValue[][] = [];
let grandTotal = 0;

for (let p = 0; p < PHASES.length; p++) {
  const phase = PHASES[p] as string;
  const codes = CATALOGUE[phase] as Code[];
  const size = PHASE_SIZES[p] as number;
  const blockStart = FIRST_DATA_ROW + rows.length;
  let phaseTotal = 0;

  for (let i = 0; i < size; i++) {
    const code = codes[rng.int(0, codes.length - 1)] as Code;
    const scheduled = Math.round(rng.float(2400, 486000) * 100) / 100;
    const previous = Math.round(scheduled * rng.float(0, 0.78) * 100) / 100;
    const period =
      Math.round((scheduled - previous) * rng.float(0, 0.4) * 100) / 100;
    const stored = rng.bool(0.18)
      ? Math.round(rng.float(500, 42000) * 100) / 100
      : 0;
    phaseTotal += scheduled;
    grandTotal += scheduled;
    rows.push([
      i === 0 ? phase : null,
      writeCode(code),
      code.name,
      costType(),
      money(scheduled),
      money(previous),
      money(period),
      stored === 0 ? null : money(stored),
      money(Math.round((scheduled - previous - period - stored) * 100) / 100),
    ]);
  }

  merges.push(`A${blockStart}:A${blockStart + size - 1}`);

  const subtotal = blankRow();
  subtotal[2] = `${phase} Total`;
  subtotal[4] = money(Math.round(phaseTotal * 100) / 100);
  rows.push(subtotal);
  rows.push(blankRow());
}

const total = blankRow();
total[2] = "PROJECT TOTAL";
total[4] = money(Math.round(grandTotal * 100) / 100);
rows.push(total);
rows.push(blankRow());

const preparedBy = blankRow();
preparedBy[2] = "Prepared by R. Alvarez, Project Accountant";
rows.push(preparedBy);

const note = blankRow();
note[2] =
  "Values shown are current contract amounts including approved change orders.";
rows.push(note);

const budget: Sheet = {
  name: "Budget Detail",
  preamble: [
    ["HARTWELL CONSTRUCTION GROUP"],
    ["Riverside Transit Center, Project 24-118"],
    ["Budget Detail, Period Ending 07/31/2026"],
    [],
    HEADER_TOP,
  ],
  header: HEADER_BOTTOM,
  rows,
  merges,
};

export default defineFixture({
  name: "hartwell-budget",
  sheets: [budget],
  outputs: ["xlsx"],
});
