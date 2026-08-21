import {
  blank,
  constant,
  date,
  defineFixture,
  number,
  pick,
  seq,
  sheet,
} from "../src/index";

export default defineFixture({
  name: "harbour-lane",
  sheets: [
    sheet("Shipments", {
      rows: 4204,
      seed: 7,
      preamble: [
        ["Harbour Lane Logistics"],
        ["Outbound shipments"],
        ["Exported 2026-06-30"],
        [],
      ],
      columns: {
        "Tracking No": seq("HL-{n:06}"),
        "Ship Date": date("2026-01-01", "2026-06-30"),
        "Destination Port": pick(
          ["Rotterdam", "Felixstowe", "Gdansk", "Algeciras", "Piraeus"],
          [0.34, 0.26, 0.18, 0.13, 0.09],
        ),
        Carrier: pick(
          ["DHL", "UPS", "FedEx", "Maersk"],
          [0.4, 0.26, 0.2, 0.14],
        ),
        "Weight (kg)": number(0.4, 380, { decimals: 2 }),
        "Pallet Count": number(1, 26),
        "Declared Value": number(120, 48000, { decimals: 2 }),
        "Customs Ref": blank(seq("CR-{n:05}"), 0.07),
      },
      overrides: [
        { at: 11, "Weight (kg)": "" },
        { at: 12, "Declared Value": "n/a" },
        { at: 899, "Ship Date": "31/06/2026" },
        { at: 1499, $ragged: 4 },
        { at: 1500, $extra: ["late entry"] },
        { at: 2600, "Destination Port": "  Rotterdam  " },
        { at: 3999, "Tracking No": "HL-004000 " },
      ],
    }),
    sheet("Returns", {
      rows: 38,
      seed: 8,
      columns: {
        "Tracking No": seq("HL-{n:06}"),
        "Return Reason": pick(["Damaged", "Refused", "Address error"]),
        "Received On": date("2026-02-01", "2026-06-30"),
      },
    }),
    sheet("Notes", {
      rows: 0,
      columns: { Note: constant("") },
    }),
  ],
  outputs: ["csv", "xlsx"],
});
