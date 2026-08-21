import { describe, expect, it } from "vitest";
import { escapeAttr, escapeText } from "../xml";

describe("escapeText", () => {
  it("escapes the three text-critical characters", () => {
    expect(escapeText("a & b < c > d")).toBe("a &amp; b &lt; c &gt; d");
  });

  it("leaves a quote alone", () => {
    expect(escapeText('say "hi"')).toBe('say "hi"');
  });

  it("drops characters XML cannot carry", () => {
    expect(escapeText("a\u0000b\u001Fc")).toBe("abc");
  });

  it("keeps tab, newline and carriage return", () => {
    expect(escapeText("a\tb\nc\rd")).toBe("a\tb\nc\rd");
  });
});

describe("escapeAttr", () => {
  it("also escapes the quote", () => {
    expect(escapeAttr('a "b" & c')).toBe("a &quot;b&quot; &amp; c");
  });
});
