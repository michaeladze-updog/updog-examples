import { describe, expect, it } from "vitest";
import { UTF8_BOM, concatBytes, encodeText } from "../encode";

describe("encodeText", () => {
  it("writes ASCII as one byte per character in every encoding", () => {
    expect(Array.from(encodeText("id,name", "windows-1252"))).toEqual(
      Array.from(new TextEncoder().encode("id,name")),
    );
  });

  it("writes the Latin-1 range as single bytes for windows-1252", () => {
    expect(Array.from(encodeText("Böll", "windows-1252"))).toEqual([
      0x42, 0xf6, 0x6c, 0x6c,
    ]);
  });

  it("writes the C1 range windows-1252 owns", () => {
    expect(Array.from(encodeText("’“”€–—", "windows-1252"))).toEqual([
      0x92, 0x93, 0x94, 0x80, 0x96, 0x97,
    ]);
  });

  it("writes Cyrillic as single bytes for windows-1251", () => {
    expect(Array.from(encodeText("Иван", "windows-1251"))).toEqual([
      0xc8, 0xe2, 0xe0, 0xed,
    ]);
  });

  it("substitutes a question mark for a character the table cannot hold", () => {
    expect(Array.from(encodeText("Ōe", "windows-1252"))).toEqual([0x3f, 0x65]);
    expect(Array.from(encodeText("Čapek", "windows-1252"))[0]).toBe(0x3f);
  });

  it("round-trips through TextDecoder", () => {
    const text = "Hašek, Jaroslav — €26.40";
    const bytes = encodeText(text, "windows-1252");
    expect(new TextDecoder("windows-1252").decode(bytes)).toBe(text);
  });

  it("writes utf-8 as multibyte sequences", () => {
    expect(Array.from(encodeText("é", "utf-8"))).toEqual([0xc3, 0xa9]);
    expect(Array.from(encodeText("é", "windows-1252"))).toEqual([0xe9]);
  });

  it("keeps a combining mark in utf-8 and drops it in a single-byte table", () => {
    const nfd = "e\u0301";
    expect(Array.from(encodeText(nfd, "utf-8"))).toEqual([0x65, 0xcc, 0x81]);
    expect(Array.from(encodeText(nfd, "windows-1252"))).toEqual([0x65, 0x3f]);
  });
});

describe("concatBytes", () => {
  it("joins parts in order", () => {
    const joined = concatBytes([UTF8_BOM, encodeText("id", "utf-8")]);
    expect(Array.from(joined)).toEqual([0xef, 0xbb, 0xbf, 0x69, 0x64]);
  });

  it("returns an empty array for no parts", () => {
    expect(concatBytes([]).length).toBe(0);
  });
});
