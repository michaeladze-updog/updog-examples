import { custom, defineFixture, number, padded, sheet } from "../src/index";

const PRODUCTS = [
  "Copper pipe 15mm x 3m",
  "Compression elbow 22mm",
  "Push-fit tee 15mm",
  "Solder ring coupler 28mm",
  "PTFE tape 12mm x 12m",
  "Speedfit stem elbow 10mm",
  "Brass gate valve 22mm",
  "Flux paste 100g",
  "Pipe clip 15mm, bag of 50",
  "Isolating valve 15mm",
  "Waste trap bottle 40mm",
  "Compression stop end 28mm",
  "Copper pipe 22mm x 3m",
  "Reducing coupler 22-15mm",
  "Backnut 1/2 inch",
  "Tap connector 15mm x 1/2",
  "Radiator valve angled 15mm",
  "Chrome pipe cover 15mm",
  "Solvent cement 250ml",
  "Overflow bend 21.5mm",
];

const COST_CENTRES = [75, 80, 115, 240];

const BARCODE_BASE = 5_012_340_000_000;

export default defineFixture({
  name: "padgate-supply",
  sheets: [
    sheet("Stock", {
      rows: 184,
      seed: 11,
      columns: {
        "Stock code": custom((_rng, index) => {
          return padded(401 + index * 3, 5);
        }),
        Barcode: custom((_rng, index) => {
          return padded(BARCODE_BASE + index * 137, 14);
        }),
        Bin: custom((rng) => {
          return padded(rng.int(1, 240), 4);
        }),
        Description: custom((_rng, index) => {
          return PRODUCTS[index % PRODUCTS.length];
        }),
        "Cost centre": custom((rng) => {
          return padded(rng.pick(COST_CENTRES) as number, 4);
        }),
        "Pack qty": number(1, 48),
      },
      overrides: [
        { at: 7, "Stock code": 422, Description: "Push-fit tee 15mm" },
        { at: 12, Barcode: BARCODE_BASE + 1644 },
        { at: 18, "Cost centre": "'0075" },
        { at: 24, "Stock code": "00473" },
        { at: 29, "Cost centre": '="0115"' },
        { at: 34, Bin: 42 },
        {
          at: 40,
          "Stock code": padded(422, 5),
          Description: "Push-fit tee 15mm",
        },
        { at: 51, "Cost centre": "" },
      ],
    }),
  ],
  outputs: ["csv", "xlsx"],
});
