import {
  clock,
  custom,
  date,
  defineFixture,
  isFormattedNumber,
  pick,
  sheet,
} from "../src/index";
import type { CellValue } from "../src/model";

const FREELANCERS = [
  "R. Ashwell",
  "M. Tarrant",
  "J. Okonkwo",
  "P. Lindqvist",
  "S. Marchetti",
  "D. Ferreira",
];

const TWELVE_HOUR = "h:mm AM/PM";

const minutesOf = (value: CellValue): number => {
  if (!isFormattedNumber(value)) {
    return 0;
  }
  return Math.round(value.value * 1440);
};

const asTwelveHour = (minutes: number): string => {
  const hour24 = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  const marker = hour24 < 12 ? "AM" : "PM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${marker}`;
};

export default defineFixture({
  name: "netherby-studio",
  sheets: [
    sheet("Timesheet", {
      rows: 168,
      seed: 19,
      columns: {
        Freelancer: pick(FREELANCERS),
        "Work Date": date("2026-03-02", "2026-03-27"),
        Started: custom((rng) => {
          const minutes = 8 * 60 + rng.int(0, 10) * 15;
          return clock(asTwelveHour(minutes), TWELVE_HOUR);
        }),
        Finished: custom((rng, _rowIndex, row) => {
          const minutes = minutesOf(row.Started) + 6 * 60 + rng.int(0, 12) * 15;
          return clock(asTwelveHour(minutes), TWELVE_HOUR);
        }),
        Hours: custom((_rng, _rowIndex, row) => {
          const worked = minutesOf(row.Finished) - minutesOf(row.Started);
          return Math.round((worked / 60) * 100) / 100;
        }),
      },
      overrides: [
        { at: 6, Finished: clock("5:30", "h:mm"), Hours: 9.25 },
        { at: 17, Started: "9:00 AM PST", Hours: 7 },
        {
          at: 23,
          Started: clock("8:00 PM", TWELVE_HOUR),
          Finished: clock("12:00 AM", TWELVE_HOUR),
          Hours: 4,
        },
        { at: 45, Hours: "6:45" },
        { at: 61, Finished: clock("6:30 AM", TWELVE_HOUR), Hours: 8.5 },
        { at: 72, Started: "", Hours: "" },
      ],
    }),
  ],
  outputs: ["csv", "xlsx"],
});
