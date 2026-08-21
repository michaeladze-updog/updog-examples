import { createRng, defineFixture } from "../src/index";
import type { CellValue, Sheet } from "../src/index";

type Node = {
  level: number;
  find: number;
  partNumber: string;
  revision: string;
  description: string;
  quantity: CellValue;
  unit: string;
  type: string;
  refDes: string;
  effFrom: string;
  effTo: string;
};

const rng = createRng(83);

const ASSEMBLY_WORDS = [
  "Manifold",
  "Housing",
  "Sensor Stack",
  "Drive Unit",
  "Control Board",
  "Valve Block",
  "Pump Head",
  "Frame Weldment",
  "Cable Harness",
  "Display Module",
  "Filter Cartridge",
  "Coupling Set",
  "Gearbox",
  "Impeller Assembly",
  "Seal Kit",
  "Power Supply",
  "Backplane",
  "Enclosure",
  "Bracket Set",
  "Rotor Assembly",
];

const PART_WORDS = [
  "Hex Bolt M6x20",
  "Washer M6 Plain",
  "Nut M6 Nyloc",
  "O-Ring 24mm Viton",
  "Gasket PTFE 40mm",
  "Bearing 6203-2RS",
  "Shaft 12mm Stainless",
  "Spring 8N",
  "Cap Screw M4x12",
  "Dowel Pin 5x16",
  "Retaining Ring 20mm",
  "Bushing Bronze 10mm",
  "Label Serial 30x15",
  "Cable Tie 100mm",
  "Grommet 8mm",
  "Terminal Block 4W",
  "Ribbon Cable 20W",
  "Connector Housing 6P",
  "Heat Shrink 6mm",
  "Standoff M3x10",
];

const BULK_WORDS = [
  "Wire 0.75mm2 Black",
  "Wire 0.75mm2 Red",
  "Tube PTFE 4x6mm",
  "Sheet Aluminium 1.5mm",
  "Sealant Silicone Clear",
  "Cable 4-Core Screened",
  "Extrusion 20x20 Slot",
  "Foam Tape 12mm",
  "Braided Sleeve 10mm",
  "Strip Copper 3mm",
];

const CONSUMABLES = [
  "Thread Locker Medium",
  "Silicone Grease",
  "Solder Paste SAC305",
  "Epoxy Adhesive 2-Part",
  "Conformal Coating",
  "Isopropyl Alcohol",
];

const ELECTRONIC = [
  "Capacitor 100nF 50V",
  "Resistor 10k 0603",
  "MOSFET N-Ch 30V",
  "Voltage Regulator 3V3",
  "Crystal 16MHz",
  "Diode Schottky 40V",
  "Inductor 4u7",
  "LED Green 0603",
];

const TYPE_ITEM = ["Item", "item", "ITEM", "Standard", "Make"];
const TYPE_ITEM_W = [0.62, 0.16, 0.05, 0.09, 0.08];

const TYPE_PHANTOM = ["Phantom", "phantom", "PHANTOM", "Ph", "Phantom Item"];
const TYPE_PHANTOM_W = [0.48, 0.19, 0.08, 0.14, 0.11];

const TYPE_LEAF = [
  "Item",
  "item",
  "ITEM",
  "Standard",
  "Make",
  "Buy",
  "Purchased",
  "Vendor",
  "vendor",
  "Pegged supply",
  "Pegged",
  "Subcontract",
  "",
];
const TYPE_LEAF_W = [
  0.3, 0.07, 0.02, 0.05, 0.04, 0.09, 0.13, 0.06, 0.03, 0.06, 0.03, 0.05, 0.07,
];

const UNIT_EACH = ["EA", "ea", "Ea", "PC", "PCS", "Each", "pcs", ""];
const UNIT_EACH_W = [0.44, 0.09, 0.04, 0.13, 0.11, 0.06, 0.05, 0.08];

const UNIT_BULK = ["M", "MM", "KG", "G", "L", "ML", "SQM"];
const UNIT_BULK_W = [0.22, 0.16, 0.19, 0.14, 0.13, 0.09, 0.07];

const REVISIONS = ["A", "B", "C", "D", "01", "02", "1", "2", "-", ""];
const REVISIONS_W = [0.21, 0.19, 0.12, 0.05, 0.11, 0.07, 0.06, 0.04, 0.05, 0.1];

const pad = (value: number, width: number): string => {
  return String(value).padStart(width, "0");
};

const indent = (level: number, value: string): string => {
  return `${"  ".repeat(level - 1)}${value}`;
};

const effectivity = (): { from: string; to: string } => {
  const shape = rng.pick(["iso", "us", "blank"], [0.68, 0.19, 0.13]);
  const year = rng.int(2023, 2026);
  const month = rng.int(1, 12);
  const day = rng.int(1, 28);
  if (shape === "blank") {
    return { from: "", to: "" };
  }
  const from =
    shape === "us"
      ? `${pad(month, 2)}/${pad(day, 2)}/${year}`
      : `${year}-${pad(month, 2)}-${pad(day, 2)}`;
  const closed = rng.bool(0.12);
  if (!closed) {
    return { from, to: "" };
  }
  const toYear = year + 1;
  const to =
    shape === "us"
      ? `${pad(month, 2)}/${pad(day, 2)}/${toYear}`
      : `${toYear}-${pad(month, 2)}-${pad(day, 2)}`;
  return { from, to };
};

const quantityFor = (
  kind: "assembly" | "part" | "bulk" | "consumable",
): CellValue => {
  if (kind === "consumable") {
    return rng.pick([0, "0", "AR", 0.02], [0.46, 0.24, 0.12, 0.18]);
  }
  if (kind === "bulk") {
    const value = Number(rng.float(0.05, 4.5).toFixed(3));
    if (rng.bool(0.09)) {
      return String(value).replace(".", ",");
    }
    return value;
  }
  if (kind === "assembly") {
    return rng.pick([1, 1, 1, 2, 4], [0.62, 0.12, 0.08, 0.12, 0.06]);
  }
  return rng.pick(
    [1, 2, 3, 4, 6, 8, 12, 24],
    [0.3, 0.19, 0.09, 0.14, 0.09, 0.08, 0.07, 0.04],
  );
};

const refDesFor = (count: number, start: number): string => {
  const prefix = rng.pick(
    ["C", "R", "U", "D", "L"],
    [0.34, 0.31, 0.14, 0.12, 0.09],
  );
  if (count === 1) {
    return `${prefix}${start}`;
  }
  if (rng.bool(0.44)) {
    return `${prefix}${start}-${prefix}${start + count - 1}`;
  }
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    parts.push(`${prefix}${start + i}`);
  }
  return parts.join(rng.pick([",", ", "], [0.68, 0.32]));
};

const COMMON_FASTENERS = [
  { partNumber: "0453-119", description: "Hex Bolt M6x20 A4" },
  { partNumber: "0453-204", description: "Washer M6 Plain A4" },
  { partNumber: "0461-018", description: "Nut M6 Nyloc A4" },
  { partNumber: "0712-330", description: "O-Ring 24mm Viton" },
];

const nodes: Node[] = [];

let subAssemblyCounter = 1040;
let purchasedCounter = 2100;
let electronicCounter = 51000;
let refDesCursor = 1;

const emit = (node: Node): void => {
  nodes.push(node);
};

const SUB_ASSEMBLY_RATE: Record<number, number> = {
  2: 0.46,
  3: 0.32,
  4: 0.16,
  5: 0,
};

const buildChildren = (level: number, budget: number): number => {
  let spent = 0;
  let find = 10;

  const count =
    level === 2 ? rng.int(9, 16) : level === 5 ? rng.int(3, 8) : rng.int(5, 12);

  for (let index = 0; index < count && spent < budget; index++) {
    const eff = effectivity();
    const makeSubAssembly =
      level < 5 && rng.bool(SUB_ASSEMBLY_RATE[level] ?? 0);

    if (makeSubAssembly) {
      subAssemblyCounter += rng.int(1, 4);
      const partNumber = `SA-${subAssemblyCounter}`;
      const phantom = rng.bool(0.22);
      emit({
        level,
        find,
        partNumber: indent(level, partNumber),
        revision: rng.pick(REVISIONS, REVISIONS_W),
        description: rng.pick(ASSEMBLY_WORDS),
        quantity: quantityFor("assembly"),
        unit: rng.pick(UNIT_EACH, UNIT_EACH_W),
        type: phantom
          ? rng.pick(TYPE_PHANTOM, TYPE_PHANTOM_W)
          : rng.pick(TYPE_ITEM, TYPE_ITEM_W),
        refDes: "",
        effFrom: eff.from,
        effTo: eff.to,
      });
      spent += 1;
      spent += buildChildren(level + 1, budget - spent);
      find += 10;
      continue;
    }

    const kind = rng.pick(
      ["fastener", "part", "electronic", "bulk", "consumable"],
      [0.19, 0.34, 0.24, 0.14, 0.09],
    );

    if (kind === "fastener") {
      const fastener = rng.pick(COMMON_FASTENERS);
      emit({
        level,
        find,
        partNumber: indent(level, fastener.partNumber),
        revision: rng.pick(["A", "B", "-", ""], [0.32, 0.19, 0.19, 0.3]),
        description: fastener.description,
        quantity: quantityFor("part"),
        unit: rng.pick(UNIT_EACH, UNIT_EACH_W),
        type: rng.pick(TYPE_LEAF, TYPE_LEAF_W),
        refDes: "",
        effFrom: eff.from,
        effTo: eff.to,
      });
    } else if (kind === "electronic") {
      electronicCounter += rng.int(1, 9);
      const count2 = rng.pick([1, 2, 3, 4, 6], [0.34, 0.24, 0.16, 0.16, 0.1]);
      emit({
        level,
        find,
        partNumber: indent(level, `EC-${electronicCounter}`),
        revision: rng.pick(REVISIONS, REVISIONS_W),
        description: rng.pick(ELECTRONIC),
        quantity: count2,
        unit: rng.pick(UNIT_EACH, UNIT_EACH_W),
        type: rng.pick(TYPE_LEAF, TYPE_LEAF_W),
        refDes: refDesFor(count2, refDesCursor),
        effFrom: eff.from,
        effTo: eff.to,
      });
      refDesCursor += count2;
    } else if (kind === "bulk") {
      purchasedCounter += rng.int(1, 7);
      emit({
        level,
        find,
        partNumber: indent(
          level,
          `${pad(purchasedCounter, 4)}-${pad(rng.int(1, 999), 3)}`,
        ),
        revision: rng.pick(REVISIONS, REVISIONS_W),
        description: rng.pick(BULK_WORDS),
        quantity: quantityFor("bulk"),
        unit: rng.pick(UNIT_BULK, UNIT_BULK_W),
        type: rng.pick(TYPE_LEAF, TYPE_LEAF_W),
        refDes: "",
        effFrom: eff.from,
        effTo: eff.to,
      });
    } else if (kind === "consumable") {
      purchasedCounter += rng.int(1, 7);
      emit({
        level,
        find,
        partNumber: indent(
          level,
          `${pad(purchasedCounter, 4)}-${pad(rng.int(1, 999), 3)}`,
        ),
        revision: rng.pick(["-", "", "A"], [0.42, 0.4, 0.18]),
        description: rng.pick(CONSUMABLES),
        quantity: quantityFor("consumable"),
        unit: rng.pick(["ML", "G", "EA", ""], [0.32, 0.28, 0.22, 0.18]),
        type: rng.pick(TYPE_LEAF, TYPE_LEAF_W),
        refDes: "",
        effFrom: eff.from,
        effTo: eff.to,
      });
    } else {
      purchasedCounter += rng.int(1, 7);
      emit({
        level,
        find,
        partNumber: indent(
          level,
          `${pad(purchasedCounter, 4)}-${pad(rng.int(1, 999), 3)}`,
        ),
        revision: rng.pick(REVISIONS, REVISIONS_W),
        description: rng.pick(PART_WORDS),
        quantity: quantityFor("part"),
        unit: rng.pick(UNIT_EACH, UNIT_EACH_W),
        type: rng.pick(TYPE_LEAF, TYPE_LEAF_W),
        refDes: "",
        effFrom: eff.from,
        effTo: eff.to,
      });
    }

    spent += 1;
    find += 10;
  }

  return spent;
};

const PRODUCTS = [
  { partNumber: "WF-1000", description: "Kestrel 400 Flow Meter", budget: 470 },
  {
    partNumber: "WF-2000",
    description: "Kestrel 620 Dosing Skid",
    budget: 560,
  },
  {
    partNumber: "WF-3400",
    description: "Merlin 90 Inline Analyser",
    budget: 380,
  },
];

for (const product of PRODUCTS) {
  const eff = effectivity();
  emit({
    level: 1,
    find: 0,
    partNumber: product.partNumber,
    revision: rng.pick(["A", "B", "C", "02"], [0.34, 0.34, 0.19, 0.13]),
    description: product.description,
    quantity: 1,
    unit: "EA",
    type: "Item",
    refDes: "",
    effFrom: eff.from,
    effTo: eff.to,
  });
  buildChildren(2, product.budget);
}

const planted: string[] = [];

const findIndex = (
  predicate: (node: Node, index: number) => boolean,
  from = 0,
): number => {
  for (let index = from; index < nodes.length; index++) {
    if (predicate(nodes[index] as Node, index)) {
      return index;
    }
  }
  return -1;
};

const jumpAt = findIndex((node, index) => {
  const previous = nodes[index - 1];
  return (
    index > 240 &&
    node.level === 3 &&
    previous !== undefined &&
    previous.level === 3
  );
});
if (jumpAt !== -1) {
  const node = nodes[jumpAt] as Node;
  node.level = 5;
  node.partNumber = indent(5, node.partNumber.trim());
  planted.push(
    `level jump to 5 at row ${jumpAt + 2}, part ${node.partNumber.trim()}`,
  );
}

const reversedAt = findIndex((node, index) => {
  return index > 120 && node.effFrom.startsWith("20") && node.effTo === "";
});
if (reversedAt !== -1) {
  const node = nodes[reversedAt] as Node;
  node.effTo = "2024-03-01";
  node.effFrom = "2026-05-14";
  planted.push(
    `effectivity reversed at row ${reversedAt + 2}, part ${node.partNumber.trim()}`,
  );
}

const blankQtyRows = [64, 512, 800];
for (const row of blankQtyRows) {
  const node = nodes[row];
  if (node) {
    node.quantity = "";
    planted.push(
      `blank quantity at row ${row + 2}, part ${node.partNumber.trim()}`,
    );
  }
}

const orphanAt = findIndex((node, index) => {
  return index > 700 && node.level === 2;
});
if (orphanAt !== -1) {
  const node = nodes[orphanAt] as Node;
  node.find = 0;
  planted.push(
    `find number blank at row ${orphanAt + 2}, part ${node.partNumber.trim()}`,
  );
}

const header: CellValue[] = [
  "Level",
  "Find",
  "Part Number",
  "Rev",
  "Description",
  "Qty",
  "UOM",
  "Type",
  "Ref Des",
  "Eff From",
  "Eff To",
];

const rows: CellValue[][] = nodes.map((node) => {
  return [
    node.level,
    node.find === 0 ? "" : node.find,
    node.partNumber,
    node.revision,
    node.description,
    node.quantity,
    node.unit,
    node.type,
    node.refDes,
    node.effFrom,
    node.effTo,
  ];
});

const bom: Sheet = {
  name: "BOM",
  preamble: [],
  header,
  rows,
};

export const plantedNotes = planted;

export default defineFixture({
  name: "wrenfield-bom",
  sheets: [bom],
  outputs: ["csv", "xlsx"],
});
