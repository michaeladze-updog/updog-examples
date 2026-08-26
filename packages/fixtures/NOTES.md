# Notes

## Zip determinism is per-machine

`src/xlsx/zip.ts` stamps every entry with a fixed instant, but the ZIP format
stores modification times as local DOS time. Two machines in different
timezones therefore produce files that differ in those bytes while holding
identical content. `fixtures check` runs on one machine and is unaffected.
Anything comparing bytes across machines must unzip first.

## Merged ranges

`Sheet.merges` holds A1-style ranges over the rendered sheet, so a range counts
the preamble rows, the header row and the data rows together and is 1-based.
`src/xlsx/worksheet.ts` writes them as a `<mergeCells>` element after
`</sheetData>`. Nothing generates them: a fixture that wants a merge states the
range itself, because a merge is a claim about the layout rather than about the
data.

`Sheet.header` is `CellValue[]` rather than `string[]` so a sheet whose header
spans two rows can leave cells empty in the lower one. The lower row of such a
header is the `header`, the upper row is the last entry of `preamble`, and the
vertical merges tie them together.

## A numeric cell can carry its own display format

`padded(value, width)` returns a `FormattedNumber`, the one `CellValue` that is
an object. It holds three things: the number, the format code, and the text a
spreadsheet would show. The CSV writer writes the text, because saving a
workbook as CSV writes what was on screen. The XLSX writer writes the number
and registers the format code in `FormatTable`, which numbers custom formats
from 165 and their `cellXfs` entries from index 2, leaving General at 0 and
`yyyy-mm-dd` at 1 where they were.

A format is a rendering instruction rather than a value, so the two writers
disagree on purpose and both are right about their own file. That difference is
the entire subject of the leading-zeros article, and `roundTrip.test.ts` pins
it by reading a generated workbook with SheetJS and asserting `w === "00417"`
over a cell whose `v` is 417.

## A time of day is a fraction of a day carrying its own clock

`clock(text, formatCode)` is the same seam as `padded`, applied to time.
Excel holds a time as a fraction of a day, so `clock("9:00 AM", "h:mm AM/PM")`
returns a `FormattedNumber` whose value is `0.375`, whose format code is the
clock the workbook draws, and whose text is what a person saw. The CSV writer
writes `9:00 AM`; the XLSX writer writes `0.375` under the format code, which
is what a spreadsheet actually stores.

The text is passed in rather than derived, because rendering a format code the
way Excel renders it means reimplementing Excel. Every caller already knows the
text it wants, so the helper checks that the text is a time it can measure and
keeps it verbatim.

The regex takes up to three hour digits, so an elapsed value past twenty-four
hours can be written as `clock("32:30", "[h]:mm")`. An hour outside 1..12 beside
an `am` or `pm` marker throws, since no clock has one.

## hartwell-budget

The only fixture that builds its `Sheet` literally instead of through `sheet()`.
Two reasons. The sheet has two header rows and `sheet()` writes one, derived from
the generator keys. And the vertical merges over each phase block have to name
row numbers that depend on how many rows came before them, so the rows and the
ranges are built in the same loop.

The file is a schedule of values as a general contractor's accounting system
prints it. Row 1 is one merged cell across all nine columns, which is what makes
the importer read the company name as nine column headers. Rows 5 and 6 are one
header split over two rows, with `WORK COMPLETED` merged across two columns. The
`PHASE` cell of each block is merged down its own rows, so the value is written
seven times and covers 632.

Division numbers and names come from Procore's published default cost code list.
The tier-2 numbers past the six Procore prints are invented, which is honest: a
tiered segment exists so a company can define its own. The six-digit codes are
CSI MasterFormat 2020 sections. The four codes marked `eaten` have a two-digit
tier 2, so a General-formatted column reads them as a date, and the fixture
writes them as real `Date` cells to reproduce what the file then holds.

## wrenfield-bom

An indented multi-level bill of materials, the shape a PLM or CAD system prints
when it explodes an assembly. Three products, 829 lines, five levels.

The sheet is built literally rather than through `sheet()` because a BOM is a
tree walked with a stack: a row's level, its find number and its part number all
depend on where the recursion is, and a per-column generator cannot know that.

Every `Part Number` cell is indented two spaces per level. That indentation is
the point of the article the fixture belongs to, since `cleanCell` trims it and
the hierarchy survives only in the `Level` column. Depth notation is used rather
than decimal level notation because First Resonance publishes both and depth is
what SAP Ariba's own import template asks for.

Four planted rows carry the structural dirt: one row claims level 5 directly
under a row claiming level 3, one row's effectivity ends before it starts, and
three quantities are blank. Everything else is the generator, including the four
common fasteners that repeat across the whole file, which is what makes the part
number the wrong choice for a unique key.

The line types are the four Microsoft Learn publishes for a Dynamics 365 BOM
line, written seventeen different ways. `AR` and zero quantities are legal in a
real BOM and the file carries both.

## depot-fleet

A depot's vehicle export, and the only fixture whose header carries the same
name twice. `sheet()` derives the header from the generator keys, so two
`Home Depot` columns cannot be declared there. The second one is declared as
`Depot Code` and the rendered header is patched afterwards, which keeps the
generator addressable by name while the file ships the repeat an importer has
to survive. `Depot Code` reads the depot chosen in the same row, so the two
columns agree.

`Odo` groups thousands with a space and `In Service` writes `DD/MM/YYYY`, so
the file needs both a number format and a date format decided before it lands.

The last row is pinned by an override because the column-mapping article prints
it under the eight rows above and a generated tail would drift away from the
page on the next reseed.

## harlow-court-roster

A hotel group's staff export for the employees article. Rows 0 to 3 are the four
managers, so every value in `Reports To` resolves against a row of the same file
rather than against a database.

Names are indexed rather than drawn. `Email` is built from `Given Name` and
`Family Name`, and a random pair over 20×20 collided about ten times across 96
rows, which drowned the one duplicate person the file is meant to carry. The
given index is `i % 20` and the family index drifts by `floor(i / 20)`, so both
are distinct for any two rows below 400. The file's only duplicate email is now
the planted `Marta Okafor` on line 54, and `A-0047` on line 48 against `A-47` on
line 62 is the same person under two staff numbers.

`First Day` deliberately holds three cell types. Most rows are real `Date`
values, which the CSV writes as `YYYY-MM-DD` and the workbook writes as date
cells, so SheetJS returns them as `t: "d"` and the importer has them in ISO
before any of its own logic runs. Four rows are strings, one per date shape the
article walks through. One row is the number `46085`, which lands in a
General-formatted cell and reaches the importer as the bare Excel serial. The
counts are `{ d: 91, s: 4, n: 1 }`.

`17/03/2026` sits on line 73 on purpose. It is the only value in the column with
a part above 12, so it settles the whole file's EU verdict, which is what makes
`03/04/2026` on line 8 read as 3 April rather than 4 March.

No `000000` number format. The writer carried General and one `yyyy-mm-dd`
format when this fixture was written, and the staff number's `A-` prefix makes
it a string, so the padding survives without one. `padded()` exists now, and
this file has no reason to change.

## brackenhill-clinic

A veterinary practice's patient list, exported after a system migration and
sorted by last visit, newest first. Rows 0 to 42 were recorded by the practice
system installed after the migration and print ISO. Rows 43 and below were
carried over from the old system and print day first with slashes, which is why
one file holds two date shapes at once.

Two constraints make the file say something a random one cannot.

`Booster Due` never disambiguates. The practice books its booster clinics in
the first twelve days of a month, so no value in that column carries a day
above 12, and the column cannot settle its own order however many rows it
holds. `Last Seen` settles it for both, at row 49, `28/11/2025`.

Rows 43 to 49 are written out by hand so the old system's block opens on seven
values that no reader can settle. The generated series resumes five steps later
(`seriesIndex`) so the file stays sorted across the planted block.

The rest of the planted rows are one value per parsing branch: `08.01.2026`
dots, `2026-02-30` a day February never has, `20251029` with no separators,
`11 Oct 2025` and `Jul 5, 2026` named months in both orders, `03/04/26` a
two-digit year, and three empty booster cells.

## padgate-supply

A builders' merchant's trade counter stock export, 184 rows, shipped as a CSV
and as a workbook of the same sheet. Four of its six columns are digits that
are identifiers rather than quantities, which is what makes the file able to
lose padding in five different ways at once.

Stock codes, barcodes, bins and cost centres are `padded()` cells, so the
workbook stores bare numbers under a zero-filling format and the CSV stores the
padded text. Eight planted rows carry the dirt. Row 7 writes the stock code as
a plain number, so its zeros are gone in both files, and row 40 is the same
item with its padding intact, which makes them two keys until something repairs
one of them. Row 12 writes the barcode as a plain number, which the General
format renders as `5.01234E+12` and SheetJS returns as an exact `v`. Row 24
writes the stock code as a real string, the shape an exporter produces when it
knows the field is text. Row 18 carries the apostrophe workaround written
literally into the cell, row 29 carries the `="0115"` formula wrapper, row 34
drops a bin to two digits, and row 51 leaves a cost centre empty.

Barcodes are GTIN-13 values right justified to fourteen digits, which is what
GS1 XML asks for. The base is `5012340000000`, well inside the safe integer
range, so no value in the column depends on float precision.

## netherby-studio

An hourly freelancer's timesheet, 168 rows, shipped as a CSV and as a workbook
of the same sheet. Started and Finished are `clock()` cells on a twelve-hour
format code, so the workbook stores day fractions under `h:mm AM/PM` and the
CSV stores `9:00 AM`. Hours is a plain decimal, which is how every timesheet
product on the market asks for it.

Six planted rows carry the dirt, and each one lands somewhere different.
Row 6 leaves one finish time without its day-period marker, so a single bare
value sits in a column of marked ones. The winning shape for that column carries
a marker and cannot read it, which is what makes the same `5:30` land as text
here and as `05:30` in a column of bare digits. Row 17 carries a lettered zone.
Row 23 is a shift that crosses midnight and finishes at `12:00 AM`. Row 45 writes a duration into the Hours column as `6:45`.
Row 61 carries a finish time whose marker contradicts the Hours column, so every
cell reads and only the row as a whole is questionable. Row 72 leaves the start
empty.

Hours on the planted rows are overridden alongside the times, so every row of
the file agrees with itself except row 61, where the disagreement is the point.

## A legacy encoding is written from the decoder, not from a table

`src/encode.ts` builds its Windows-1252 and Windows-1251 tables by decoding the
bytes `0x80` to `0xFF` with `TextDecoder` and inverting the result. A hand-typed
index of 128 code points would be one typo away from a file that lies, and the
runtime already holds the WHATWG index the SDK's own decoder reads. Node ships
full ICU, so both tables exist wherever the generator runs.

Encoding is one-way and lossy by design. A character the table has no byte for
becomes `?`, the same substitution a spreadsheet makes on the way out, which is
how a fixture can hold a name that was already destroyed before the file
existed. Decoding such a file recovers nothing, and no article should pretend
otherwise.

## Why a CSV file is built from parts

A real merged export is two files concatenated, and the halves disagree about
their encoding. `CsvFile.parts` models exactly that: each part carries its own
encoding and its own byte order mark, and `header: false` turns the second part
into a continuation rather than a second table. The mark belongs to the part
because in the file it belongs to the half that came from Excel.
