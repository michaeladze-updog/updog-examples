import { custom, defineFixture, sheet } from "../src/index";

/**
 * A bakery wholesaler's stock count across three sites. Identity takes two
 * columns, so row 10 has no site at all, rows 11 and 12 repeat one pair, and
 * row 14 writes a site name short. Rows 5 and 6 both carry a half, one counted
 * in pieces and one weighed, and row 7 writes a loss in accounting brackets.
 */
const ROWS = [
  ["WP-FLR-T55", "Wistow Mill", "480", "120", "200", "each"],
  ["WP-FLR-T55", "Ryburn Depot", "96", "24", "60", "each"],
  ["WP-FLR-T55", "Fenton Cold Store", "0", "0", "40", "each"],
  ["WP-FLR-WHM", "Wistow Mill", "212.5", "45", "100", "each"],
  ["WP-BTR-25", "Fenton Cold Store", "12.5", "4", "10", "kg"],
  ["WP-YST-FRS", "Fenton Cold Store", "(4)", "0", "20", "kg"],
  ["WP-YST-FRS", "Ryburn Depot", "30", "6", "20", "kg"],
  ["WP-SGR-CST", "Wistow Mill", "640", "0", "250", "each"],
  ["WP-SGR-CST", "", "75", "0", "250", "each"],
  ["WP-CHC-70", "Ryburn Depot", "144", "36", "60", "each"],
  ["WP-CHC-70", "Ryburn Depot", "150", "36", "60", "each"],
  ["WP-CHC-70", "Wistow Mill", "60", "12", "60", "each"],
  ["WP-CHC-70", "Fenton", "26", "0", "60", "each"],
];

const at = (column: number) => {
  return custom((_rng, index) => {
    return ROWS[index][column];
  });
};

export default defineFixture({
  name: "wistow-provisions",
  sheets: [
    sheet("Stock count", {
      rows: ROWS.length,
      seed: 11,
      columns: {
        "Item code": at(0),
        Site: at(1),
        "On hand": at(2),
        Allocated: at(3),
        "Reorder at": at(4),
        Unit: at(5),
      },
    }),
  ],
  outputs: ["csv", "xlsx"],
});
