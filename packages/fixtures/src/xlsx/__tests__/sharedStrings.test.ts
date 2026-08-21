import { describe, expect, it } from "vitest";
import { StringTable } from "../sharedStrings";
import { STYLE_DATE, STYLE_GENERAL, stylesXml } from "../styles";

describe("StringTable", () => {
  it("interns each distinct string once, in first-seen order", () => {
    const table = new StringTable();
    expect(table.intern("DHL")).toBe(0);
    expect(table.intern("UPS")).toBe(1);
    expect(table.intern("DHL")).toBe(0);
  });

  it("counts references separately from unique entries", () => {
    const table = new StringTable();
    table.intern("DHL");
    table.intern("DHL");
    table.intern("UPS");
    expect(table.toXml()).toContain('count="3"');
    expect(table.toXml()).toContain('uniqueCount="2"');
  });

  it("escapes and preserves whitespace", () => {
    const table = new StringTable();
    table.intern(" a & b ");
    expect(table.toXml()).toContain(
      '<si><t xml:space="preserve"> a &amp; b </t></si>',
    );
  });

  it("emits a valid empty table", () => {
    expect(new StringTable().toXml()).toContain('count="0"');
  });
});

describe("stylesXml", () => {
  it("declares the date format at the date style index", () => {
    expect(STYLE_GENERAL).toBe(0);
    expect(STYLE_DATE).toBe(1);
    expect(stylesXml()).toContain('formatCode="yyyy-mm-dd"');
    expect(stylesXml()).toContain('<cellXfs count="2">');
  });
});
