import { escapeText } from "./xml";

export class StringTable {
  private readonly index = new Map<string, number>();
  private readonly order: string[] = [];
  private references = 0;

  intern(value: string): number {
    this.references += 1;
    const existing = this.index.get(value);
    if (existing !== undefined) {
      return existing;
    }
    const next = this.order.length;
    this.index.set(value, next);
    this.order.push(value);
    return next;
  }

  toXml(): string {
    const items = this.order
      .map((value) => {
        return `<si><t xml:space="preserve">${escapeText(value)}</t></si>`;
      })
      .join("");
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${this.references}" uniqueCount="${this.order.length}">${items}</sst>`;
  }
}
