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
