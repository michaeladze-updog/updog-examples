# Updog for Svelte — CSV Importer & Spreadsheet Editor

[![npm](https://img.shields.io/npm/v/@updog/data-editor-wc?label=%40updog%2Fdata-editor-wc)](https://www.npmjs.com/package/@updog/data-editor-wc)
[![Docs](https://img.shields.io/badge/docs-docs.updog.tech-1f6feb)](https://docs.updog.tech)
[![Website](https://img.shields.io/badge/website-updog.tech-1f6feb)](https://updog.tech)

[Updog](https://updog.tech) is a JavaScript SDK that adds a CSV importer and spreadsheet editor to any web app. Users drop in a CSV, Excel, TSV, JSON, or XML file; Updog parses it, matches columns to your schema, validates values, and lets users fix errors or edit data — all in the browser.

- Runs **100% client-side** — data never leaves the user's browser
- Fully customizable and white-label: match your app's theme, fonts, and copy
- Handles up to **~1 million rows** in the browser

## Svelte integration

This example uses [`@updog/data-editor-wc`](https://www.npmjs.com/package/@updog/data-editor-wc), the framework-agnostic Web Component, inside a Svelte 5 app.

```bash
npm install @updog/data-editor-wc
```

```svelte
<!-- Importer.svelte -->
<script lang="ts">
  import "@updog/data-editor-wc";
  import "@updog/data-editor-wc/styles.css";
  import type { UpdogEditorElement } from "@updog/data-editor-wc";

  const columns = [
    { id: "firstName", title: "First Name" },
    { id: "lastName", title: "Last Name" },
    { id: "email", title: "Email" },
  ];

  let editorEl: UpdogEditorElement | undefined = $state();

  $effect(() => {
    if (!editorEl) return;
    const el = editorEl;
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
    return () => el.removeEventListener("close", onClose);
  });

  function open() {
    editorEl?.show();
  }
</script>

<button type="button" onclick={open}>Open Importer</button>
<updog-editor bind:this={editorEl}></updog-editor>
```

> **Note:** Bind the element with `bind:this`, then call `configure()` once it's mounted. The Web Component is configured imperatively so you can pass functions (e.g. `onComplete`) directly.

Full Web Component API: [docs.updog.tech](https://docs.updog.tech).

## Links

- Website: [updog.tech](https://updog.tech)
- Documentation: [docs.updog.tech](https://docs.updog.tech)
- Pricing: [updog.tech/#pricing](https://updog.tech/#pricing)
- npm: [`@updog/data-editor-wc`](https://www.npmjs.com/package/@updog/data-editor-wc)
- Other framework examples: [React](../react#readme) · [Vue](../vue#readme) · [Angular](../angular#readme) · [Next.js](../nextjs#readme) · [Vanilla JS](../vanilla#readme)

## License

The Updog SDK is licensed — see [updog.tech/license](https://updog.tech/license/).
