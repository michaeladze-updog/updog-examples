# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

Minimal example apps showing how to embed the Updog Importer SDK in eight frontend frameworks, plus a fixture generator that produces the sample files used in articles about the product. The SDK itself lives in a separate repository; here it is consumed from npm.

The example apps are published documentation — the README links each one as a tutorial. Keep them minimal and idiomatic for their framework. Test scaffolding, harnesses and generated data belong in `packages/`, not inside an app.

## Commands

pnpm workspace, `pnpm@9.7.1`, Node >= 22.12, ESM throughout. Prettier for formatting, ESLint for JS only.

```bash
pnpm dev:react          # also dev:vue dev:nuxt dev:svelte dev:sveltekit dev:nextjs dev:angular dev:vanilla
pnpm build              # pnpm -r build, skips packages with no build script
pnpm test               # pnpm -r --if-present test
pnpm lint               # pnpm -r --if-present lint
pnpm format             # prettier --write .
pnpm format:check
```

Fixture generator:

```bash
pnpm fixtures build                              # every fixture -> packages/fixtures/out/<name>/
pnpm fixtures build --only harbour-lane
pnpm fixtures build --out ../../apps/react/public/fixtures
pnpm fixtures check                              # regenerate and compare bytes; exits 1 on drift

cd packages/fixtures && pnpm test                # vitest
cd packages/fixtures && pnpm vitest run src/xlsx/__tests__/roundTrip.test.ts   # one file
cd packages/fixtures && pnpm vitest run -t "reports the full range"            # one test
cd packages/fixtures && pnpm exec tsc --noEmit
```

Root ESLint ignores `**/*.ts` and `**/*.tsx`, so TypeScript is checked by `tsc`, never by lint. Do not add ESLint TypeScript plugins to work around this.

## Two SDK packages, two integration shapes

Every app does the same thing — open an importer, hand it a column schema, log the result — but through one of two entry points. Which one an app uses determines how it wires up, and this is the single most important thing to understand before editing any app.

**`@updog/data-editor` — React component.** Used by `apps/react` and `apps/nextjs`. Declarative: render `<DataEditor open onClose columns primaryKey onComplete />` and drive it with state. In Next.js the importer component carries `"use client"`.

**`@updog/data-editor-wc` — `<updog-editor>` custom element.** Used by the other six apps. Imperative and identical across frameworks:

```js
import "@updog/data-editor-wc";
import "@updog/data-editor-wc/styles.css";

el.configure({ apiKey, columns, primaryKey, onComplete });
el.addEventListener("close", () => el.hide());
el.show();
```

The element holds its own state. `configure()` is re-run inside the framework's effect primitive (`watchEffect`, `$effect`, Angular `effect`) so a prop change reconfigures it, and the `close` listener is cleaned up on teardown.

### SSR changes the import, not the API

`apps/nuxt` and `apps/sveltekit` render on the server, where `customElements` does not exist. They cannot import the web component at module scope. Instead they defer it to a click:

```js
await import("@updog/data-editor-wc");
await import("@updog/data-editor-wc/styles.css");
// flush the render that adds <updog-editor> to the DOM (nextTick / tick)
await customElements.whenDefined("updog-editor");
el.configure({ ... });
el.show();
```

The dynamic import is guarded by a module-level promise so repeated clicks set up once. Non-SSR web-component apps (`vue`, `svelte`, `vanilla`, `angular`) import at the top of the file and skip all of this.

`apps/angular` additionally needs `CUSTOM_ELEMENTS_SCHEMA` on the component, or the template rejects the unknown `<updog-editor>` tag.

### Version pinning

Both SDK packages resolve through the `catalog:` entry in `pnpm-workspace.yaml`. Bump the version there, never in an app's `package.json`.

## packages/fixtures

Generates the CSV and XLSX sample files for articles. One module per article; the same module always produces the same bytes.

The architecture is a single seam. `src/model.ts` defines `Workbook` / `Sheet` / `CellValue`; generation produces it and serialization consumes it, and neither side references the other:

```
random.ts       seed              -> deterministic number stream
generators.ts   (rng, rowIndex, row) -> cell value
sheet.ts        sheet spec        -> Sheet
model.ts        <-- the seam
csv.ts          Sheet             -> string
xlsx/           Workbook          -> Uint8Array
define.ts       fixture module    -> files
bin/generate.ts CLI
```

Rules that keep this working:

- `src/random.ts` is the only file allowed to be non-deterministic. Nothing else may call `Math.random()`, `Date.now()`, or `new Date()` with no arguments. `pnpm fixtures check` exists to catch violations, which is why `packages/fixtures/out/` is committed rather than ignored.
- Overrides are applied after a row is generated, so adding one never shifts the random stream for later rows.
- `seq` numbers from 1 while override `at` is 0-based: the row reading `HL-000013` is `{ at: 12 }`.

### Why the XLSX writer is hand-rolled

`src/xlsx/` writes OOXML directly over `fflate` rather than using a spreadsheet library. The importer previews a sheet by reading it with a row cap and reports the true row count from SheetJS's `!fullref`, which only appears when the file declares `<dimension>`. A writer that omits that element makes a 4204-row sheet report 49 rows. `src/xlsx/worksheet.ts` computes `<dimension>` from the widest row actually present.

SheetJS is a **devDependency only**, used in `src/xlsx/__tests__/roundTrip.test.ts` as an independent reader: it reads a generated file back with `sheetRows: 50` and asserts the full range. Writing with the same library that reads would make the file and the reader agree by construction and hide this class of bug. Do not move `xlsx` into `dependencies`.

`fflate` entries carry a fixed modification time so repeated runs produce identical bytes. That determinism is per-machine — the ZIP format stores local DOS time, so two machines in different timezones differ in those bytes. See `packages/fixtures/NOTES.md`.

## Conventions

- No code comments. Rationale that needs recording goes in a `NOTES.md` next to the code.
- Arrow function bodies use braces and an explicit `return`, never a concise expression body.
- Do not commit. Leave work staged or unstaged for the repository owner.

## Running an article's fixture through `apps/react` with Playwright MCP

This is the standard verification loop for a blog article, and it runs the same
way every time. `apps/react` is the harness. Nothing here is committed by
default — revert the app when the run ends, unless the user says to keep it, as
they did on 2026-09-01 for `haverbrook-market`.

### The loop

1. Write `packages/fixtures/fixtures/<name>.fixture.ts`. This file **is**
   committed; it is the sanctioned asset system.
2. `pnpm fixtures build --only <name>` and read the CSV bytes. They have to
   match the article's `<Sheet>` exactly.
3. `pnpm fixtures build --only <name> --out ../../apps/react/public/fixtures`
   so the dev server can serve the file to the page. See the warning below.
4. Paste the article's exact `columns`, `transformer`, `primaryKey` and
   `onComplete` into `apps/react/src/Importer.tsx`. Park the result on `window`
   instead of posting it.
5. `pnpm dev:react`, drive the wizard, read the result.
6. `git checkout apps/react` and delete only the fixture directory you added.

### The traps, all of them hit at least once

**`apps/react/public/fixtures` already holds committed files.** `brackenhill-clinic.csv`
and `hartwell-budget.xlsx` live there. `rm -rf` on that directory deletes them.
Remove only `public/fixtures/<name>/`, and check `git status` before finishing.

**The starved tab has one real cure, and `bringToFront` is only half of it.**
The MCP drives the user's own Google Chrome, so a raised tab inside a
backgrounded window still reports `document.visibilityState === "hidden"`, and
`browser_tabs select` and `browser_resize` do not change that. Run
`osascript -e 'tell application "Google Chrome" to activate'` from Bash, then
`browser_tabs select`. Measured 2026-09-01: an Import that had sat on
`aria-busy="true"` for minutes finished the instant the tab became visible, and
a double rAF went from never firing to 12 ms. Do this at step 0 and the
`browser_evaluate` click workaround below stops being necessary.

**Validation messages are readable without the canvas.** The grid's accessible
mirror gives one `role="gridcell"` per cell with `data-value`, and a cell that
carries a message points `aria-describedby` at an element holding it. That is
how "This might be in the wrong column." was read off three cells of one row:

```js
() => {
  const tr = [...document.querySelectorAll("table tr")].find((r) =>
    r.textContent.includes("P-27"),
  );
  return [...tr.children].map((c) => {
    const d = c.getAttribute("aria-describedby");
    return { text: c.textContent.trim(), note: d ? document.getElementById(d)?.textContent : null };
  });
};
```

**Real clicks never land.** `browser_click` fails with `waiting for element to
be visible, enabled and stable`. The tab is frame-starved, so the stability
check never passes. Click through `browser_evaluate` instead:

```js
() => {
  const b = [...document.querySelectorAll("button")].find(
    (x) => x.textContent.trim() === "Next",
  );
  b.click();
  return "ok";
};
```

`browser_click` is still worth one call when you need its error message, since
strict-mode violations print the element's full attributes, which is how
`aria-busy="true"` on the Import button was found.

**The file input takes files through a fetch, not a file chooser.**
`browser_file_upload` wants an open chooser and there is no reliable way to open
one. Serve the fixture from `public/` and build a `File` in the page:

```js
const res = await fetch("/fixtures/<name>/<name>.csv");
const dt = new DataTransfer();
dt.items.add(new File([await res.blob()], "<name>.csv", { type: "text/csv" }));
input.files = dt.files;
input.dispatchEvent(new Event("change", { bubbles: true }));
```

**An `async` evaluate often dies with `Resulting promise was garbage
collected`.** The upload usually still happened. Check the page state rather
than retrying, and split long async blocks into one call each.

**Steps advance slowly and silently.** Clicking `Next` returns the heading of
the step you were on, not the one you land on. Call again to read the new
state. `Import` on twelve rows sat at `aria-busy="true"` for about 18 seconds,
reproducibly, on a clean single-click run. **That is the harness, not the SDK.**
Never log it as a bug and never quote a browser timing measured here.

**A blocked Import is usually a confirmation dialog.** Submit opens
`Confirm submission` listing the row counts and an error count. Find the dialog
by text, then the button inside it, or the outer `Submit` is what you keep
clicking.

**The canvas grid has no DOM text, but `document.body.innerText` carries the
whole thing** as tab-separated rows, with the filter counts above it. This one
read gives the row count, every stored cell value, and the error breakdown:

```js
() => {
  const t = document.body.innerText;
  const i = t.indexOf("<FirstHeader>\t");
  return { summary: t.slice(0, i), grid: t.slice(i, i + 1800) };
};
```

**Port drift.** The user usually has 5173 and 5174 taken, so vite lands on 5175. Read the port out of the dev server log rather than assuming it, and stop
the server by its task id, never with `pkill`, which would kill their sessions.

### What the run is for

Reading the numbers back into the article. On the catalogue run the payload came
back with three products where the draft claimed four, because a product whose
rows are all invalid never reaches the handler. Two paragraphs of that article
exist because the run contradicted the draft. Budget for that, and re-read the
prose against what the grid actually reported.

### Added by the REST round-trip run, 2026-08-27

**Playwright MCP can wedge.** After a `browser_close`, every later Playwright
call hung past 120 seconds and had to be stopped by task id. The
`claude-in-chrome` tools drove the same run without trouble, and their
`file_upload` puts a file straight into the hidden input by ref, so the
`public/fixtures` fetch dance above is only needed when that tool is absent.

**StrictMode doubles a `loadData` run.** `apps/react/src/main.tsx` wraps the app
in `<StrictMode>`, so an article that fills the grid from an API sees every
source loaded twice, and the row counts and seeded change counts double.
Comment StrictMode out for the run, and revert it with the rest.

**A stub API fits in `vite.config.ts`.** A plugin with
`configureServer(server) { server.middlewares.use("/api/thing", handler) }`
serves the GET the editor loads from and logs the POST, PATCH and DELETE the
handler sends. The dev-server log is then the record of what actually went out.

**Console tracking starts late.** `read_console_messages` only sees messages
logged after its first call, so a submit handler's output is missed. Patch
`console.log` into an array on `window` before driving the wizard and read that
array afterwards.

**A radio card ignores a scripted click.** On the Add-or-update step,
`input.click()` leaves the selection where it was. Click the card itself by
coordinate from a screenshot. The same is true of the wizard's Import button,
which took a real mouse click after several scripted ones did nothing.

**The Add-or-update step is a fork worth running twice.** It preselects Update
by <primary key>, and the two branches give different results for the same file.
An article that describes what an import does to existing rows has to say which
branch it means.

### Added by the DuckDB run, 2026-08-28

**The Playwright MCP tab fires no animation frames at all.** A `requestAnimationFrame`
loop inside `browser_evaluate` never ticks, and the call has to be killed by task id.
The wizard's Import button then sits at `aria-busy="true"` forever. It completed once,
early in the run, and never again in the same session. Drive the wizard in the first
few minutes or use `claude-in-chrome`.

**The canvas grid can be edited from `browser_evaluate`.** Geometry is fixed:
`MARKER_COLUMN_SIZE` 76, header 36, row 34, plus each column's `size`. Dispatch
`mousedown` + `mouseup` + `dblclick` with `clientX`/`clientY` on `.updog-grid__canvas`
and the editor appears as `.updog-grid__cell-editor-overlay input`. Write it with the
native value setter, an `input` event and an Enter `keydown`:

```js
const setter = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype,
  "value",
).set;
setter.call(input, "0.42");
input.dispatchEvent(new Event("input", { bubbles: true }));
input.dispatchEvent(
  new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
);
```

**`.updog-grid-a11y` carries the stored value, `innerText` carries the display value.**
The hidden mirror table holds `data-value="2026-03-04"` on the same cell whose text
reads `3/4/2026`. Read `data-value` for anything the article claims about the data.

**A dynamic `import()` of an app module from `browser_evaluate` makes a second
instance.** Vite serves the app's copy as `/src/duck.ts?t=...` after any HMR, so
`import('/src/duck.ts')` returns a different module and boots a second database. Park
the singleton on `window` from inside the app instead.

**A JS-free page in `public/` is the only way to release OPFS handles.** DuckDB holds
sync access handles for the whole life of the page, so `removeEntry` answers
`NoModificationAllowedError` and `getFile()` reports size 0. Serve a plain
`public/blank.html`, navigate there, and the handles are gone.

**Submit's confirmation dialog is the second `[role=dialog]`.** Find it by
`innerText.startsWith('Confirm submission')`, then the `Submit` inside it.

### Added by the inventory run, 2026-08-28

**A hung Playwright MCP call is usually a permission prompt nobody answered.**
`browser_resize` and `browser_navigate` both sat past 120 seconds and were
stopped by task id, and the browser was waiting on an approval the user had to
give. Ask before assuming the tool is broken, and give the earlier
`Playwright MCP can wedge` note the same reading.

**A local Playwright script is the faster driver either way.** A script run from
`updog/packages/e2e` (which already has `@playwright/test`) drove the whole
verification headless, with none of the traps above and no approval to wait on.
Real `click()` lands, `setInputFiles()` takes the fixture straight from
`packages/fixtures/out/`, and `page.on("console")` catches the submit handler's
output without patching `console.log`.

```js
import { chromium } from "@playwright/test";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5174/");
await page.getByRole("button", { name: "Open Importer" }).click();
await page.setInputFiles('input[type="file"]', CSV);
```

Write it as `packages/e2e/run.mjs` in the `updog` repository, run it with
`node run.mjs`, and delete it at the end. Nothing goes into this repository.

**`loadData` hands rows to `onChunk`, it does not return them.** A seeded run
written as `loadData={async () => STORED}` silently loads nothing, the grid opens
empty, and the primary-key step stays hidden because there is nothing to merge
into. The shape is `loadData={async (onChunk) => { onChunk(STORED, { source: "Name", done: true }); }}`.

**The primary-key step is conditional, and it is easy to miss.**
`core/flow/deriveStepIds.ts:48` shows it only when the upload has a merge target,
which is rows already in the grid at open, or more than one workbook. One file
into an empty grid never sees it, and the declared `primaryKey` still anchors.
To make it appear, stage the same fixture twice, as the CSV and as the XLSX.

**Two workbooks of one fixture is a cheap merge test.** The second file lands on
the first through the key, so a thirteen-row file staged twice ends on the rows
that carry no key. That one number, 1 row of 13, is the whole merge story.

### Added by the inventory re-verification, 2026-08-28

**A `?mode=` switch on `Importer.tsx` beats editing the file per scenario.** Read
`new URLSearchParams(location.search).get("mode")` at module scope and branch the
one thing each scenario changes — the `editor` on a column, `variant`, `loadData`,
whether `onComplete` throws. One dev server then serves every variant and the
driver script is a loop over modes.

**Playwright MCP dies on Import in a multi-workbook upload.** The button sits at
`aria-busy="true"` past 30 seconds and never resolves. The same click through a
local headless script finishes in about two seconds. Single-file Import does
complete over MCP, so the wedge is not a wizard bug.

**`Show example values from <header>` exists only on the uploader-variant column
step.** Reached through the grid's `Add data source` button the trigger is gone,
so a scenario that drops a column has to aim at
`button[aria-label="Clear selection"]` by index. The buttons are in source header
order, which is worth asserting before clicking one.

**Dropping either part of a composite key removes the whole Add-or-update step.**
Not just the card. With `primaryKey={["sku", "warehouse"]}` and no `unique`
column in the schema, clearing `Site` or `Item code` sends the wizard straight
from Match values to Import.

**A resolving `onComplete` empties the grid, a throwing one leaves it untouched.**
After a resolve the source list is gone and the grid holds headers only; after a
throw every row and every error is still there, and so is the confirmation
dialog. Both are worth checking in one run, since an article usually claims one
and assumes the other.

### Added by the royalties run, 2026-09-01

**The frame-starved tab is a hidden tab, and `page.bringToFront()` cures it.**
Probe first: `document.hidden` was `true` and a double `requestAnimationFrame`
never ticked, exactly the wedge the earlier runs describe. One
`browser_run_code_unsafe` call with `await page.bringToFront()` made
`document.hidden` false and rAF tick at ~163ms, and the whole session then ran
on the front door: real `browser_click` landed every time, the dropzone opened
a real file chooser, `browser_file_upload` took the fixture, and Import
finished in about a second. Re-read the "real clicks never land" and
"file input takes files through a fetch" traps through this lens — they
describe the hidden-tab state, and none of them fired once the tab was
visible.

**`browser_file_upload` only takes paths under the MCP allowed roots.** The
server ran with roots in the `updog` repo, so a fixture path in
`updog-examples` was refused. Copy the built CSV into
`updog/.playwright-mcp/<file>.csv`, upload from there, delete the copy at the
end — no `public/fixtures` dance needed.

**The import wizard opens from the grid's `Add data source`.** `open` on
`<DataEditor>` lands on the empty Edit Data screen first; the Select files
step is one click deeper.

**The uploader steps are plain DOM and `browser_snapshot` reads the landed
grid too.** The a11y tree carried every stored cell (`Anna`, `van der Berg`,
`USD`), the `2/4 matched` counter and the `Rows with errors 0` count, so the
`innerText` slicing from the earlier runs was never needed. The unmatched-row
tooltip renders in a portal at `body` level; hover the info icon and query
`[class*="tooltip"]` globally, `[role="tooltip"]` matches nothing.

### Keep this section growing

Every run that meets a new trap, a faster selector, or a surprising SDK
behaviour adds a bullet here in the same pass. The section is the reason the
next run is shorter than this one.
