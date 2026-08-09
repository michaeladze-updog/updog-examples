# Updog for Nuxt — CSV Importer & Spreadsheet Editor

[![npm](https://img.shields.io/npm/v/@updog/data-editor-wc?label=%40updog%2Fdata-editor-wc)](https://www.npmjs.com/package/@updog/data-editor-wc)
[![Docs](https://img.shields.io/badge/docs-docs.updog.tech-1f6feb)](https://docs.updog.tech)
[![Website](https://img.shields.io/badge/website-updog.tech-1f6feb)](https://updog.tech)

[Updog](https://updog.tech) is a JavaScript SDK that adds a CSV importer and spreadsheet editor to any web app. Users drop in a CSV, Excel, TSV, JSON, or XML file; Updog parses it, matches columns to your schema, validates values, and lets users fix errors or edit data — all in the browser.

- Runs **100% client-side** — data never leaves the user's browser
- Fully customizable and white-label: match your app's theme, fonts, and copy
- Handles up to **~1 million rows** in the browser

## Nuxt integration

This example uses [`@updog/data-editor-wc`](https://www.npmjs.com/package/@updog/data-editor-wc), the framework-agnostic Web Component, inside a Nuxt 4 app with server rendering on.

```bash
npm install @updog/data-editor-wc
```

The editor is a custom element, so it registers itself against the browser DOM. Import it in the click handler and render it inside `<ClientOnly>`:

```vue
<!-- app/app.vue -->
<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from "vue";
import type {
  DataEditorColumn,
  UpdogEditorElement,
} from "@updog/data-editor-wc";

const columns: DataEditorColumn[] = [
  { id: "firstName", title: "First Name" },
  { id: "lastName", title: "Last Name" },
  { id: "email", title: "Email" },
];

const ready = ref(false);
const editorRef = useTemplateRef<UpdogEditorElement>("editor");

let setupPromise: Promise<void> | null = null;

function setupEditor() {
  if (!setupPromise) {
    setupPromise = (async () => {
      await import("@updog/data-editor-wc");
      await import("@updog/data-editor-wc/styles.css");
      ready.value = true;

      await nextTick();
      await customElements.whenDefined("updog-editor");

      const el = editorRef.value;
      if (!el) return;

      el.configure({
        apiKey: "YOUR_API_KEY",
        columns,
        primaryKey: "email",
        onComplete: (result) => {
          console.log(result);
          el.hide();
        },
      });

      el.addEventListener("close", () => el.hide());
    })();
  }

  return setupPromise;
}

async function open() {
  await setupEditor();
  editorRef.value?.show();
}
</script>

<template>
  <button type="button" @click="open">Open Importer</button>
  <ClientOnly>
    <updog-editor v-if="ready" ref="editor" />
  </ClientOnly>
</template>
```

> **Note:** A top-level `import "@updog/data-editor-wc"` returns 500 from `nuxt dev` with `ReferenceError: HTMLElement is not defined`. The production build survives it, because Nitro drops the import from the server bundle, so the problem shows up in development only.

Two more Nuxt specifics:

- Tell the Vue compiler that `<updog-editor>` is a custom element, in `nuxt.config.ts`:

  ```ts
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith("updog-"),
    },
  }
  ```

- Nuxt adds a `prefetch` link for every dynamic chunk, so the editor downloads in the background on each page load. Switch it off for dynamic entries:

  ```ts
  hooks: {
    "build:manifest": (manifest) => {
      for (const entry of Object.values(manifest)) {
        if (entry.isDynamicEntry) {
          entry.prefetch = false;
          entry.preload = false;
        }
      }
    },
  }
  ```

Full Web Component API: [docs.updog.tech](https://docs.updog.tech).

## Links

- Website: [updog.tech](https://updog.tech)
- Documentation: [docs.updog.tech](https://docs.updog.tech)
- Pricing: [updog.tech/#pricing](https://updog.tech/#pricing)
- npm: [`@updog/data-editor-wc`](https://www.npmjs.com/package/@updog/data-editor-wc)
- Other framework examples: [React](../react#readme) · [Vue](../vue#readme) · [Svelte](../svelte#readme) · [Angular](../angular#readme) · [Next.js](../nextjs#readme) · [Vanilla JS](../vanilla#readme) · [SvelteKit](../sveltekit#readme)

## License

The Updog SDK is licensed — see [updog.tech/license](https://updog.tech/license/).
