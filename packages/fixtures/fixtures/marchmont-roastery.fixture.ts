import { custom, defineFixture, sheet } from "../src/index";

/**
 * A wholesale coffee catalogue with no product id column. The product is
 * carried by the SKU prefix, and row 5 spells the product name a second way so
 * that grouping by name and grouping by prefix disagree.
 */
const ROWS = [
  [
    "Ndaro Peaberry",
    "Kenya",
    "Medium",
    "MR-NDA-250-WB",
    "250g",
    "Whole bean",
    "£16.00",
  ],
  [
    "Ndaro Peaberry",
    "Kenya",
    "Medium",
    "MR-NDA-1KG-WB",
    "1kg",
    "Whole bean",
    "£52.00",
  ],
  [
    "Ndaro Peaberry",
    "Kenya",
    "Med",
    "MR-NDA-1KG-FL",
    "1kg",
    "Filter",
    "£52.00",
  ],
  ["Ndaro Peaberry", "Kenya", "Medium", "MR-NDA-5KG-WB", "5kg", "", "£240.00"],
  [
    "Marchmont Ndaro",
    "Kenya",
    "Medium",
    "MR-NDA-250-ES",
    "250g",
    "Espresso",
    "£16.00",
  ],
  [
    "Sela Wash",
    "Ethiopia",
    "Light",
    "MR-SEL-250-WB",
    "250g",
    "Whole bean",
    "18,50 EUR",
  ],
  [
    "Sela Wash",
    "Ethiopia",
    "Light",
    "MR-SEL-1KG-WB",
    "1kg",
    "Whole bean",
    "58,00 EUR",
  ],
  [
    "Sela Wash",
    "Ethiopia",
    "Light",
    "MR-SEL-1KG-FL",
    "1kg",
    "Filter",
    "58,00 EUR",
  ],
  [
    "Cerro Alto",
    "Colombia",
    "Medium-Dark",
    "MR-CER-250-WB",
    "250g",
    "Whole bean",
    "1 250,00 CZK",
  ],
  [
    "Cerro Alto",
    "Colombia",
    "Medium-Dark",
    "MR-CER-1KG-ES",
    "1kg",
    "Espresso",
    "4 100,00 CZK",
  ],
  [
    "Tarn Hollow Blend",
    "Blend",
    "Dark",
    "MR-TAR-1KG-ES",
    "1kg",
    "Espresso",
    "£49.00",
  ],
  [
    "Tarn Hollow Blend",
    "Blend",
    "Dark",
    "MR-TAR-1KG-ES",
    "1kg",
    "Espresso",
    "£49.00",
  ],
];

const at = (column: number) => {
  return custom((_rng, index) => {
    return ROWS[index][column];
  });
};

export default defineFixture({
  name: "marchmont-roastery",
  sheets: [
    sheet("Wholesale", {
      rows: ROWS.length,
      seed: 3,
      columns: {
        Product: at(0),
        Origin: at(1),
        Roast: at(2),
        SKU: at(3),
        Size: at(4),
        Grind: at(5),
        "Unit price": at(6),
      },
    }),
  ],
  outputs: ["csv", "xlsx"],
});
