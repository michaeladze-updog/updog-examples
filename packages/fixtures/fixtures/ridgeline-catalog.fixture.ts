import { custom, defineFixture, sheet } from "../src/index";

const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const VARIANTS = SIZES.length;

const FAMILIES = [
  ["Cirque", "Hooded Fleece", "Apparel & Accessories > Clothing > Outerwear"],
  [
    "Talus",
    "Merino Base Layer",
    "Apparel & Accessories > Clothing > Shirts & Tops",
  ],
  ["Corrie", "Insulated Gilet", "Apparel & Accessories > Clothing > Outerwear"],
  ["Fellgate", "Trail Tee", "Apparel & Accessories > Clothing > Shirts & Tops"],
  [
    "Kelder",
    "Softshell Jacket",
    "Apparel & Accessories > Clothing > Outerwear",
  ],
  ["Braemar", "Walking Trouser", "Apparel & Accessories > Clothing > Trousers"],
  ["Sarn", "Quarter Zip", "Apparel & Accessories > Clothing > Shirts & Tops"],
  ["Wrayfell", "Rain Shell", "Apparel & Accessories > Clothing > Outerwear"],
  [
    "Otterburn",
    "Lined Overshirt",
    "Apparel & Accessories > Clothing > Shirts & Tops",
  ],
  ["Glenmorie", "Down Parka", "Apparel & Accessories > Clothing > Outerwear"],
  ["Pikestone", "Hiking Short", "Apparel & Accessories > Clothing > Shorts"],
  [
    "Ardnoe",
    "Wool Beanie",
    "Apparel & Accessories > Clothing Accessories > Hats",
  ],
];

const COLOURWAYS = ["Slate", "Moss", "Ember", "Bracken", "Chalk", "Ink"];

const group = (rowIndex: number): number => {
  return Math.floor(rowIndex / VARIANTS);
};

const slot = (rowIndex: number): number => {
  return rowIndex % VARIANTS;
};

const family = (rowIndex: number): string[] => {
  return FAMILIES[group(rowIndex) % FAMILIES.length];
};

const colourway = (rowIndex: number): string => {
  return COLOURWAYS[
    Math.floor(group(rowIndex) / FAMILIES.length) % COLOURWAYS.length
  ];
};

const handleFor = (rowIndex: number): string => {
  const [name, item] = family(rowIndex);
  const slugged = `${name}-${item}-${colourway(rowIndex)}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  return `${slugged}-${String(group(rowIndex) + 1).padStart(5, "0")}`;
};

const titleFor = (rowIndex: number): string => {
  const [name, item] = family(rowIndex);
  return `${name} ${item}, ${colourway(rowIndex)}`;
};

const checkDigit = (body: string): number => {
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    const digit = Number(body[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  return (10 - (sum % 10)) % 10;
};

const gtin13 = (serial: number): string => {
  const body = `5065${String(serial).padStart(8, "0")}`;
  return `${body}${checkDigit(body)}`;
};

const gtin12 = (serial: number): string => {
  const body = `076543${String(serial % 100_000).padStart(5, "0")}`;
  return `${body}${checkDigit(body)}`;
};

export default defineFixture({
  name: "ridgeline-catalog",
  sheets: [
    sheet("Products", {
      rows: 196_000,
      seed: 31,
      columns: {
        "URL handle": custom((_rng, rowIndex) => {
          return handleFor(rowIndex);
        }),
        Title: custom((_rng, rowIndex) => {
          return slot(rowIndex) === 0 ? titleFor(rowIndex) : "";
        }),
        Vendor: custom((_rng, rowIndex) => {
          return slot(rowIndex) === 0 ? "Ridgeline Outfitters" : "";
        }),
        "Product category": custom((_rng, rowIndex) => {
          return slot(rowIndex) === 0 ? family(rowIndex)[2] : "";
        }),
        Status: custom((_rng, rowIndex) => {
          if (slot(rowIndex) !== 0) return "";
          return group(rowIndex) % 17 === 0 ? "draft" : "active";
        }),
        SKU: custom((_rng, rowIndex) => {
          return `RO-${String(group(rowIndex) + 1).padStart(5, "0")}-${SIZES[slot(rowIndex)]}`;
        }),
        Barcode: custom((_rng, rowIndex) => {
          const serial = group(rowIndex) * VARIANTS + slot(rowIndex) + 1;
          if (serial % 53 === 0) return null;
          if (serial % 29 === 0) return Number(gtin12(serial));
          return Number(gtin13(serial));
        }),
        "Option1 name": custom((_rng, rowIndex) => {
          return slot(rowIndex) === 0 ? "Size" : "";
        }),
        "Option1 value": custom((_rng, rowIndex) => {
          return SIZES[slot(rowIndex)];
        }),
        Price: custom((rng, rowIndex) => {
          const pennies = rng.int(0, 3) === 0 ? "99" : "00";
          if (group(rowIndex) % FAMILIES.length === 9) {
            const premium = 1180 + (group(rowIndex) % 7) * 20 + slot(rowIndex);
            return `$${String(premium).slice(0, 1)},${String(premium).slice(1)}.${pennies}`;
          }
          const base = 18 + (group(rowIndex) % 11) * 9 + slot(rowIndex);
          return `$${base}.${pennies}`;
        }),
        "Inventory quantity": custom((rng, rowIndex) => {
          if (slot(rowIndex) === 6 && group(rowIndex) % 23 === 0) return "";
          return rng.int(0, 240);
        }),
        "Weight value (grams)": custom((rng) => {
          return rng.int(90, 1450);
        }),
      },
      overrides: [
        { at: 7, SKU: "RO-00001-XS" },
        { at: 14, SKU: "RO-00001-XS" },
        { at: 4_235, Barcode: 5065000000000 },
        { at: 90_006, SKU: "RO-12858-XS" },
        { at: 195_993, SKU: "RO-00001-XS" },
      ],
    }),
  ],
  outputs: ["xlsx"],
});
