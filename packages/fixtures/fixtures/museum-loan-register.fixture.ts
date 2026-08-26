import { custom, defineFixture, pick, seq, sheet } from "../src/index";

const LENDERS = [
  "Ashgrove Trust",
  "Pellworth Collection",
  "Rowan & Vale Estate",
  "Halstow Foundation",
  "Marden Bequest",
  "Ivelet House",
];

const FORMS = [
  "Study",
  "Portrait",
  "View",
  "Interior",
  "Sketch",
  "Panel",
  "Cast",
];

const SUBJECTS = [
  "a Harbour",
  "a Weaver",
  "the North Gate",
  "a Reading Room",
  "Two Sisters",
  "a Winter Field",
  "the Old Mill",
  "a Standing Figure",
];

const HANDLING = ["Gloves", "Two-person lift", "No flash", "Crate only"];

export default defineFixture({
  name: "museum-loan-register",
  sheets: [
    sheet("Loans", {
      rows: 186,
      seed: 31,
      columns: {
        "Object no.": seq("MLR-{n:05}"),
        "Object title": custom((rng) => {
          return `${rng.pick(FORMS)} of ${rng.pick(SUBJECTS)}`;
        }),
        Lender: pick(LENDERS),
        Condition: pick(
          ["Stable", "Fragile", "Under treatment", "Unstable"],
          [0.62, 0.2, 0.11, 0.07],
        ),
        "Loan status": pick(
          ["Returned", "Approved", "Requested", "Declined"],
          [0.4, 0.3, 0.22, 0.08],
        ),
        "Handling notes": custom((rng) => {
          const first = rng.pick(HANDLING);
          if (rng.int(0, 2) === 0) return first;
          const second = rng.pick(HANDLING.filter((v) => v !== first));
          return `${first}; ${second}`;
        }),
      },
      overrides: [
        { at: 7, "Loan status": "Not approved" },
        { at: 12, "Loan status": "Rejected" },
        { at: 21, "Loan status": "Denied" },
        { at: 29, "Loan status": "RET" },
        { at: 44, Condition: "Un-stable" },
        { at: 65, Condition: "In treatment" },
        { at: 93, "Handling notes": "Gloves; flash" },
        { at: 116, "Handling notes": "Gloves; no photography" },
        { at: 140, "Handling notes": "Gloves; Keep upright" },
      ],
    }),
  ],
  outputs: ["csv", "xlsx"],
});
