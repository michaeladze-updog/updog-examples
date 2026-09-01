import { custom, defineFixture, sheet } from "../src/index";

const ROWS = [
  ["RS-2041", "Anna van der Berg", "Slow Tide", "$1,250.00"],
  ["RS-2042", "Ines Duarte", "Harrow Lane", "$980.40"],
  ["RS-2043", "Petr Havlik", "Nightjar", "$1,004.50"],
];

const col = (index: number) => {
  return custom((_rng, rowIndex) => ROWS[rowIndex][index]);
};

export default defineFixture({
  name: "transform-rows-during-csv-import",
  sheets: [
    sheet("Royalties", {
      rows: 3,
      seed: 1,
      columns: {
        Ref: col(0),
        Artist: col(1),
        Track: col(2),
        Payment: col(3),
      },
    }),
  ],
  outputs: ["csv"],
});
