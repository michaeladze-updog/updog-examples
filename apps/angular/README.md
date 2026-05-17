# Updog for Angular — CSV Importer & Spreadsheet Editor

[![npm](https://img.shields.io/npm/v/@updog/data-editor-wc?label=%40updog%2Fdata-editor-wc)](https://www.npmjs.com/package/@updog/data-editor-wc)
[![Docs](https://img.shields.io/badge/docs-docs.updog.tech-1f6feb)](https://docs.updog.tech)
[![Website](https://img.shields.io/badge/website-updog.tech-1f6feb)](https://updog.tech)

[Updog](https://updog.tech) is a JavaScript SDK that adds a CSV importer and spreadsheet editor to any web app. Users drop in a CSV, Excel, TSV, JSON, or XML file; Updog parses it, matches columns to your schema, validates values, and lets users fix errors or edit data — all in the browser.

- Flat **$199 / domain / month** — no per-import or per-row fees
- Runs **100% client-side** — data never leaves the user's browser
- Handles up to **~1 million rows** in the browser

## Angular integration

This example uses [`@updog/data-editor-wc`](https://www.npmjs.com/package/@updog/data-editor-wc), the framework-agnostic Web Component, inside an Angular 17+ standalone component.

```bash
npm install @updog/data-editor-wc
```

```ts
// importer.ts
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  effect,
  viewChild,
} from "@angular/core";
import "@updog/data-editor-wc";
import type { UpdogEditorElement } from "@updog/data-editor-wc";

@Component({
  selector: "app-importer",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <button type="button" (click)="open()">Open Importer</button>
    <updog-editor #editor></updog-editor>
  `,
})
export class ImporterComponent {
  protected readonly columns = [
    { id: "firstName", title: "First Name" },
    { id: "lastName", title: "Last Name" },
    { id: "email", title: "Email" },
  ];

  private readonly editorRef =
    viewChild.required<ElementRef<UpdogEditorElement>>("editor");

  constructor() {
    effect((onCleanup) => {
      const el = this.editorRef().nativeElement;
      el.configure({
        apiKey: "YOUR_API_KEY",
        columns: this.columns,
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
  }

  open(): void {
    this.editorRef().nativeElement.show();
  }
}
```

> **Note:** Add `CUSTOM_ELEMENTS_SCHEMA` to the component's `schemas` so Angular's template compiler tolerates `<updog-editor>`. Reach into `.nativeElement` to call `configure()` and `show()`.

Load the stylesheet globally via the `styles` array in `angular.json` rather than importing it inside the component — that way the rules apply to the Web Component's light-DOM children no matter where it's mounted:

```jsonc
// angular.json
"styles": [
  "@updog/data-editor-wc/styles.css",
  "src/styles.css"
]
```

Full Web Component API: [docs.updog.tech](https://docs.updog.tech).

## Links

- Website: [updog.tech](https://updog.tech)
- Documentation: [docs.updog.tech](https://docs.updog.tech)
- Pricing: [updog.tech/#pricing](https://updog.tech/#pricing)
- npm: [`@updog/data-editor-wc`](https://www.npmjs.com/package/@updog/data-editor-wc)
- Other framework examples: [React](../react#readme) · [Vue](../vue#readme) · [Svelte](../svelte#readme) · [Next.js](../nextjs#readme) · [Vanilla JS](../vanilla#readme)

## License

The Updog SDK is licensed — see [updog.tech/license](https://updog.tech/license/).
