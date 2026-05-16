# Updog Examples Monorepo — Design

## Purpose

This repository is a **learning/example monorepo** that shows developers how to integrate the Updog data editor into the most common frontend frameworks. It is not published anywhere and is not deployed. Each app is a minimal "Hello World" starting point with `@updog/data-editor` and `@updog/data-editor-wc` installed as dependencies, ready for a developer to start exploring.

Six apps, one per framework:

- Angular (TS)
- React (TS)
- Vue (TS)
- Svelte (TS)
- Next.js (TS)
- Plain HTML + JS (vanilla)

## Non-goals

- No CI, no release pipeline, no publishing
- No shared UI library or shared component code across apps
- No testing setup beyond what each scaffolder ships by default
- No Turborepo / task caching layer
- No Tailwind or styling frameworks
- No actual rendering of the Updog components — they are installed only, not imported, so each app stays a clean Hello World

## Tooling

- **Package manager:** pnpm (workspaces). Version 9.7.1+ required for catalog support.
- **Node:** 22.12+ (matches Angular CLI, Vite, and create-next-app minimums).
- **Language:** TypeScript everywhere except the plain HTML+JS app.

## Repository layout

```
updog-examples/
├── apps/
│   ├── angular/      # Angular CLI (ng new), TS
│   ├── react/        # Vite react-ts template
│   ├── vue/          # Vite vue-ts template
│   ├── svelte/       # Vite svelte-ts template
│   ├── nextjs/       # create-next-app (TS, App Router, defaults)
│   └── vanilla/      # Vite vanilla template (plain HTML + JS)
├── docs/
│   └── superpowers/specs/    # design + plan documents
├── eslint.config.mjs         # shared base ESLint flat config
├── .prettierrc               # shared Prettier config (defaults)
├── .prettierignore
├── pnpm-workspace.yaml       # workspace + catalog declarations
├── package.json              # root scripts + shared devDeps
├── .gitignore
└── README.md                 # how the repo is organized + how to run each app
```

## Scaffolding

Each app is created with its framework's canonical scaffolder, then left untouched apart from the modifications described below.

| App | Command |
| --- | --- |
| Angular | `ng new angular --directory apps/angular --routing=false --style=css --skip-git` |
| React | `pnpm create vite@latest apps/react --template react-ts` |
| Vue | `pnpm create vite@latest apps/vue --template vue-ts` |
| Svelte | `pnpm create vite@latest apps/svelte --template svelte-ts` |
| Vanilla | `pnpm create vite@latest apps/vanilla --template vanilla` |
| Next.js | `pnpm create next-app@latest apps/nextjs --ts --app --eslint --no-tailwind --no-src-dir --no-import-alias` |

The resulting Hello World content from each scaffolder is kept as-is. No changes to the default page beyond what's needed to make the app build inside the workspace.

## Workspace + dependency management

### Workspace

`pnpm-workspace.yaml` declares `apps/*` as the workspace globs and pins the shared Updog dependency versions via the pnpm catalog feature.

```yaml
packages:
  - "apps/*"
catalog:
  "@updog/data-editor": ^0.1.18
  "@updog/data-editor-wc": ^0.1.18
```

### Updog dependencies

Every app declares both packages under `dependencies`, referencing the catalog so versions are pinned in exactly one place:

```jsonc
"dependencies": {
  "@updog/data-editor": "catalog:",
  "@updog/data-editor-wc": "catalog:"
}
```

The packages are installed but not imported, mounted, or rendered. Apps remain stock Hello World pages.

### Root devDependencies

The root `package.json` holds shared dev tooling so each app does not re-install it:

- `eslint`
- `@typescript-eslint/parser`
- `@typescript-eslint/eslint-plugin`
- `eslint-config-prettier`
- `prettier`
- `typescript`

Framework-specific ESLint plugins (`angular-eslint`, `eslint-plugin-react`, `eslint-plugin-vue`, `eslint-plugin-svelte`, `@next/eslint-plugin-next`) stay in their respective app `devDependencies` so each app remains self-contained for its framework rules.

## ESLint + Prettier

### Prettier

Fully shared. A single `.prettierrc` at the root uses Prettier's defaults. Any per-app Prettier config produced by scaffolders is removed. `prettier --write .` from the root formats the whole monorepo.

### ESLint

- A root `eslint.config.mjs` (flat config) defines the base layer: `eslint:recommended`, `@typescript-eslint` recommended rules, and `eslint-config-prettier` to disable stylistic rules that conflict with Prettier.
- Each app has its own `eslint.config.mjs` that imports the root config and appends a framework block (the rules each scaffolder ships with by default).
- This resolves the "shared root config" + "default ones" requirement: the base layer is DRY, while each framework keeps the lint rules its tooling expects.

## Root scripts

```jsonc
"scripts": {
  "dev:angular":  "pnpm --filter angular  start",
  "dev:react":    "pnpm --filter react    dev",
  "dev:vue":      "pnpm --filter vue      dev",
  "dev:svelte":   "pnpm --filter svelte   dev",
  "dev:nextjs":   "pnpm --filter nextjs   dev",
  "dev:vanilla":  "pnpm --filter vanilla  dev",
  "build":        "pnpm -r build",
  "lint":         "pnpm -r lint",
  "format":       "prettier --write ."
}
```

## README

A root `README.md` lists the six apps, the framework version each was scaffolded against, and the exact command to run each one (`pnpm dev:<app>`). It also documents the Node + pnpm version requirements and explains where the shared Updog dependency versions are pinned (the pnpm catalog).

## Error handling

Not applicable — this is static scaffolding, not a runtime system. The only runtime artifacts are the framework dev servers, each of which handles its own errors as shipped by the scaffolder.

## Testing

Out of scope. Whatever testing scaffolding each CLI emits by default is left in place but not extended. No root test script.
