# Updog for React — CSV Importer & Spreadsheet Editor

[![npm](https://img.shields.io/npm/v/@updog/data-editor?label=%40updog%2Fdata-editor)](https://www.npmjs.com/package/@updog/data-editor)
[![Docs](https://img.shields.io/badge/docs-docs.updog.tech-1f6feb)](https://docs.updog.tech)
[![Website](https://img.shields.io/badge/website-updog.tech-1f6feb)](https://updog.tech)

[Updog](https://updog.tech) is a JavaScript SDK that adds a CSV importer and spreadsheet editor to any web app. Users drop in a CSV, Excel, TSV, JSON, or XML file; Updog parses it, matches columns to your schema, validates values, and lets users fix errors or edit data — all in the browser.

- Flat **$199 / domain / month** — no per-import or per-row fees
- Runs **100% client-side** — data never leaves the user's browser
- Handles up to **~1 million rows** in the browser

## React integration

This example uses [`@updog/data-editor`](https://www.npmjs.com/package/@updog/data-editor), the React component.

```bash
npm install @updog/data-editor
```

```tsx
// Importer.tsx
import { useState } from "react";
import { DataEditor } from "@updog/data-editor";
import "@updog/data-editor/styles.css";

type Row = { firstName: string; lastName: string; email: string };

const columns = [
  { id: "firstName", title: "First Name" },
  { id: "lastName", title: "Last Name" },
  { id: "email", title: "Email" },
];

export default function Importer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open Importer
      </button>
      <DataEditor<Row>
        apiKey="YOUR_API_KEY"
        open={open}
        onClose={() => setOpen(false)}
        columns={columns}
        primaryKey="email"
        onComplete={(result) => {
          console.log(result);
          setOpen(false);
        }}
      />
    </>
  );
}
```

> **Note:** The editor renders to canvas and uses Web Workers, so it must run in the browser. For Next.js, see the [Next.js example](../nextjs#readme).

Full prop reference and customization API: [docs.updog.tech](https://docs.updog.tech).

## Links

- Website: [updog.tech](https://updog.tech)
- Documentation: [docs.updog.tech](https://docs.updog.tech)
- Pricing: [updog.tech/#pricing](https://updog.tech/#pricing)
- npm: [`@updog/data-editor`](https://www.npmjs.com/package/@updog/data-editor)
- Other framework examples: [Vue](../vue#readme) · [Svelte](../svelte#readme) · [Angular](../angular#readme) · [Next.js](../nextjs#readme) · [Vanilla JS](../vanilla#readme)

## License

The Updog SDK is licensed — see [updog.tech/license](https://updog.tech/license/).
