# Updog for Vue — CSV Importer & Spreadsheet Editor

[![npm](https://img.shields.io/npm/v/@updog/data-editor-wc?label=%40updog%2Fdata-editor-wc)](https://www.npmjs.com/package/@updog/data-editor-wc)
[![Docs](https://img.shields.io/badge/docs-docs.updog.tech-1f6feb)](https://docs.updog.tech)
[![Website](https://img.shields.io/badge/website-updog.tech-1f6feb)](https://updog.tech)

[Updog](https://updog.tech) is a JavaScript SDK that adds a CSV importer and spreadsheet editor to any web app. Users drop in a CSV, Excel, TSV, JSON, or XML file; Updog parses it, matches columns to your schema, validates values, and lets users fix errors or edit data — all in the browser.

- Runs **100% client-side** — data never leaves the user's browser
- Fully customizable and white-label: match your app's theme, fonts, and copy
- Handles up to **~1 million rows** in the browser

## Vue integration

This example uses [`@updog/data-editor-wc`](https://www.npmjs.com/package/@updog/data-editor-wc), the framework-agnostic Web Component, inside a Vue 3 app.

```bash
npm install @updog/data-editor-wc
```

```vue
<!-- Importer.vue -->
<script setup lang="ts">
import { useTemplateRef, watchEffect } from "vue";
import "@updog/data-editor-wc";
import "@updog/data-editor-wc/styles.css";
import type { UpdogEditorElement } from "@updog/data-editor-wc";

const columns = [
  { id: "firstName", title: "First Name" },
  { id: "lastName", title: "Last Name" },
  { id: "email", title: "Email" },
];

const editorRef = useTemplateRef<UpdogEditorElement>("editor");

watchEffect((onCleanup) => {
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
  const onClose = () => el.hide();
  el.addEventListener("close", onClose);
  onCleanup(() => el.removeEventListener("close", onClose));
});

function open() {
  editorRef.value?.show();
}
</script>

<template>
  <button type="button" @click="open">Open Importer</button>
  <updog-editor ref="editor" />
</template>
```

> **Note:** Tell Vue's template compiler that `<updog-editor>` is a custom element so it doesn't try to resolve it as a Vue component. In `vite.config.ts`:
>
> ```ts
> vue({
>   template: {
>     compilerOptions: {
>       isCustomElement: (tag) => tag.startsWith("updog-"),
>     },
>   },
> });
> ```

Full Web Component API: [docs.updog.tech](https://docs.updog.tech).

## Links

- Website: [updog.tech](https://updog.tech)
- Documentation: [docs.updog.tech](https://docs.updog.tech)
- Pricing: [updog.tech/#pricing](https://updog.tech/#pricing)
- npm: [`@updog/data-editor-wc`](https://www.npmjs.com/package/@updog/data-editor-wc)
- Other framework examples: [React](../react#readme) · [Svelte](../svelte#readme) · [Angular](../angular#readme) · [Next.js](../nextjs#readme) · [Vanilla JS](../vanilla#readme)

## License

The Updog SDK is licensed — see [updog.tech/license](https://updog.tech/license/).
