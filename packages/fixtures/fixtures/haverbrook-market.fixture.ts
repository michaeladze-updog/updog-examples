import { custom, defineFixture, sheet } from "../src/index";

/**
 * Haverbrook Market's stall register, exported from the clerk's spreadsheet.
 * Backs `ragged-rows-and-shifted-columns-in-csv-imports`.
 *
 * Three rows carry fewer cells than the header, and each one lands on a
 * different verdict of the alignment engine:
 *
 *   row 6  (P-24)  one cell short at the end   -> one placement survives
 *   row 9  (P-27)  one cell short in the middle -> several placements survive
 *   row 14 (note)  a clerk's footer line        -> no placement survives
 *
 * Ragged rows exist in the CSV alone. A worksheet stores a used range, so the
 * XLSX half of this fixture would pad every short row back to seven cells.
 */

type Row = [string, string, string, string, string, string, string];

const ROWS: Row[] = [
  ["P-13", "Ivy Halloway", "Halloway & Vane", "Cheese", "42", "2026-03-17", "ivy@example.com"],
  ["P-14", "Otto Marsden", "Roper Bakehouse", "Bread", "38", "2026-03-17", "otto@example.com"],
  ["P-15", "Nell Ferrand", "Ferrand Flowers", "Flowers", "30", "2026-03-24", "nell@example.com"],
  ["P-16", "Rhys Coldharbour", "Coldharbour Fish", "Fish", "55", "2026-03-24", "rhys@example.com"],
  ["P-17", "Silas Ashgrove", "Ashgrove Greens", "Vegetables", "44", "2026-03-31", "silas@example.com"],
  ["P-18", "Della Bramwell", "Bramwell Preserves", "Preserves", "26", "2026-03-31", "della@example.com"],
  ["P-24", "Cleo Windrush", "Windrush Honey", "Honey", "24", "2026-04-14", "cleo@example.com"],
  ["P-25", "Auberon Petrie", "Petrie Knives", "Ironmongery", "48", "2026-04-14", "auberon@example.com"],
  ["P-26", "Marisol Enfield", "Enfield Ceramics", "Pottery", "35", "2026-04-21", "marisol@example.com"],
  ["P-27", "Tobias Renn", "Renn Coffee", "Coffee", "40", "2026-04-21", "tobias@example.com"],
  ["P-28", "Xanthe Ollerton", "Ollerton Wool", "Wool", "28", "2026-04-28", "xanthe@example.com"],
  ["P-29", "Bram Kettlewell", "Kettlewell Pies", "Pies", "46", "2026-04-28", "bram@example.com"],
  ["P-30", "Junia Foxwell", "Foxwell Herbs", "Herbs", "22", "2026-05-19", "junia@example.com"],
  ["P-31", "Casimir Vale", "Vale Woodwork", "Woodwork", "52", "2026-05-19", "casimir@example.com"],
];

const at = (column: number) =>
  custom((_rng, rowIndex) => {
    return ROWS[rowIndex][column];
  });

export default defineFixture({
  name: "haverbrook-market",
  sheets: [
    sheet("Pitches", {
      rows: ROWS.length,
      columns: {
        Pitch: at(0),
        Trader: at(1),
        Stall: at(2),
        Goods: at(3),
        "Pitch fee": at(4),
        "First market": at(5),
        Contact: at(6),
      },
      overrides: [
        // P-24 was entered before the clerk had an address for the trader, and
        // the export stopped at the last filled cell.
        { at: 6, $ragged: 6 },
        // P-27 lost the stall name, not the last cell: six values, and the gap
        // sits between two columns that hold free text.
        {
          at: 9,
          $ragged: 2,
          $extra: ["Coffee", "40", "2026-04-21", "tobias@example.com"],
        },
        // The clerk's own note, left under the table.
        {
          at: 13,
          Pitch: "Cash pitches are settled on the day",
          $ragged: 1,
        },
      ],
    }),
  ],
  outputs: ["csv"],
});
