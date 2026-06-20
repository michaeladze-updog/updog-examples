# Updog for JavaScript & HTML — CSV Importer & Spreadsheet Editor

[![npm](https://img.shields.io/npm/v/@updog/data-editor-wc?label=%40updog%2Fdata-editor-wc)](https://www.npmjs.com/package/@updog/data-editor-wc)
[![Docs](https://img.shields.io/badge/docs-docs.updog.tech-1f6feb)](https://docs.updog.tech)
[![Website](https://img.shields.io/badge/website-updog.tech-1f6feb)](https://updog.tech)

[Updog](https://updog.tech) is a JavaScript SDK that adds a CSV importer and spreadsheet editor to any web app. Users drop in a CSV, Excel, TSV, JSON, or XML file; Updog parses it, matches columns to your schema, validates values, and lets users fix errors or edit data — all in the browser.

- Runs **100% client-side** — data never leaves the user's browser
- Fully customizable and white-label: match your app's theme, fonts, and copy
- Handles up to **~1 million rows** in the browser

## Vanilla JS / HTML integration

This example uses [`@updog/data-editor-wc`](https://www.npmjs.com/package/@updog/data-editor-wc), the framework-agnostic Web Component. No framework required — drop `<updog-editor>` into any HTML page.

```bash
npm install @updog/data-editor-wc
```

```html
<!-- index.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Import Customers</title>
  </head>
  <body>
    <button id="open-btn">Open Importer</button>
    <updog-editor id="editor"></updog-editor>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

```js
// src/main.js
import "@updog/data-editor-wc";
import "@updog/data-editor-wc/styles.css";

const editor = document.getElementById("editor");

editor.configure({
  apiKey: "YOUR_API_KEY",
  columns: [
    { id: "firstName", title: "First Name" },
    { id: "lastName", title: "Last Name" },
    { id: "email", title: "Email" },
  ],
  primaryKey: "email",
  onComplete: (result) => {
    console.log(result);
    editor.hide();
  },
});

editor.addEventListener("close", () => editor.hide());

document
  .getElementById("open-btn")
  .addEventListener("click", () => editor.show());
```

> **Note:** Load the package as an ES module (`<script type="module">`). Updog's Web Component runs in any page with the DOM and `customElements` available — including server-rendered HTML from Rails, Django, Laravel, Astro, Eleventy, Hugo, etc.

Full Web Component API: [docs.updog.tech](https://docs.updog.tech).

## Links

- Website: [updog.tech](https://updog.tech)
- Documentation: [docs.updog.tech](https://docs.updog.tech)
- Pricing: [updog.tech/#pricing](https://updog.tech/#pricing)
- npm: [`@updog/data-editor-wc`](https://www.npmjs.com/package/@updog/data-editor-wc)
- Other framework examples: [React](../react#readme) · [Vue](../vue#readme) · [Svelte](../svelte#readme) · [Angular](../angular#readme) · [Next.js](../nextjs#readme)

## License

The Updog SDK is licensed — see [updog.tech/license](https://updog.tech/license/).
