# @updog-examples/fixtures

Generates the sample CSV and XLSX files used in articles about Updog Importer.
A fixture is one module; the same module always produces the same bytes.

## Commands

```bash
pnpm fixtures build                  # every fixture -> out/<name>/
pnpm fixtures build --only harbour-lane
pnpm fixtures build --out ../../apps/react/public/fixtures
pnpm fixtures check                  # regenerate and compare bytes with out/
pnpm test                            # unit tests, including a SheetJS round trip
```

`out/` is committed. `check` compares against it, which is how a stray
`Math.random()` or `new Date()` gets caught.

## Writing a fixture

Add `fixtures/<article-slug>.fixture.ts`:

```ts
import { date, defineFixture, number, pick, seq, sheet } from "../src/index";

export default defineFixture({
  name: "article-slug",
  sheets: [
    sheet("Shipments", {
      rows: 4204,
      seed: 7,
      preamble: [["Harbour Lane Logistics"], []],
      columns: {
        "Tracking No": seq("HL-{n:06}"),
        "Ship Date": date("2026-01-01", "2026-06-30"),
        "Weight (kg)": number(0.4, 380, { decimals: 2 }),
        Carrier: pick(["DHL", "UPS"], [0.6, 0.4]),
      },
      overrides: [{ at: 12, "Weight (kg)": "" }],
    }),
  ],
  outputs: ["csv", "xlsx"],
});
```

## CSV files with their own encoding

By default a fixture writes one UTF-8 CSV per sheet, with no byte order mark.
`csvFiles` replaces that with an explicit list, and each file is built from one
or more parts:

```ts
export default defineFixture({
  name: "cawdray-books",
  sheets: [sheet("Till", { ... }), sheet("System", { ... })],
  outputs: ["csv"],
  csvFiles: [
    { suffix: "till-cp1252", parts: [{ sheet: "Till", encoding: "windows-1252" }] },
    { suffix: "system", parts: [{ sheet: "System", bom: true }] },
    {
      suffix: "merged",
      parts: [
        { sheet: "System", bom: true },
        { sheet: "Till", encoding: "windows-1252", header: false },
      ],
    },
  ],
});
```

The file is named `<fixture>--<suffix>.csv`. A part names a `sheet` (optional
when the fixture has one), an `encoding` (`utf-8`, `windows-1252` or
`windows-1251`, default `utf-8`), a `bom` flag that writes `EF BB BF` in front
of that part, and `header: false` to drop the preamble and header row, which is
what makes a second part read as a continuation of the first.

A character the target table cannot hold is written as `?`, which is what a
real exporter does: `Ōe, Kenzaburō` written to Windows-1252 becomes
`?e, Kenzabur?`, and the information is gone before the file exists.

`seq` numbers from 1, so row index 0 renders as `HL-000001`. `overrides` are
0-based over the generated rows and exclude the preamble, so the row reading
`HL-000013` is `{ at: 12 }`.

`$ragged: n` truncates a row to `n` cells. `$extra: [...]` appends cells past
the header. `rows: 0` gives a header with no data, which is how an empty sheet
is expressed.

With one sheet a CSV is named after the fixture; with several it gains a
`--<sheet>` suffix. The XLSX always holds every sheet.

## Generators

| Generator                        | Produces                                 |
| -------------------------------- | ---------------------------------------- |
| `seq(pattern)`                   | `"HL-{n:06}"` -> `HL-000001`             |
| `constant(value)`                | the same value everywhere                |
| `pick(values, weights?)`         | one of `values`                          |
| `number(min, max, { decimals })` | a number in range                        |
| `date(from, to, { as })`         | a `Date`, or a string when `as` is given |
| `text(words)`                    | a short phrase                           |
| `email({ from, domain })`        | built from earlier columns in the row    |
| `blank(inner, probability)`      | `inner`, or `null` at the given rate     |
| `custom(fn)`                     | anything, with `(rng, rowIndex, row)`    |

Two helpers are cells rather than generators, and both return a number carrying
its own display format. Use either inside `custom` or an override.

`padded(value, width)` makes the workbook store `417` under `00000` while the
CSV stores `00417`.

`clock(text, formatCode?)` makes the workbook store a fraction of a day under a
time format while the CSV stores the text: `clock("9:00 AM", "h:mm AM/PM")`
writes `0.375` into the sheet and `9:00 AM` into the CSV. The format code
defaults to `hh:mm`. The text is kept verbatim, so it has to be the time the
format code would show.

Columns evaluate in declaration order, so `email` and `custom` can read columns
declared above them.

## Why the XLSX writer is our own

The importer previews a sheet by reading it with a row cap and reports the true
row count from SheetJS's `!fullref`, which only appears when the file declares
`<dimension>`. A writer that omits that element makes a 4204-row sheet report
49 rows. `src/xlsx/worksheet.ts` computes `<dimension>` from the widest row
present, and `src/xlsx/__tests__/roundTrip.test.ts` reads a generated file back
with `sheetRows: 50` and asserts the full range.
