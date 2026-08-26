export type Encoding = "utf-8" | "windows-1252" | "windows-1251";

export const UTF8_BOM = Uint8Array.of(0xef, 0xbb, 0xbf);

const HIGH_START = 0x80;
const HIGH_COUNT = 128;
const SUBSTITUTE = 0x3f;

const tables = new Map<Encoding, Map<string, number>>();

function tableFor(encoding: Encoding): Map<string, number> {
  const cached = tables.get(encoding);
  if (cached) {
    return cached;
  }
  const high = new Uint8Array(HIGH_COUNT);
  for (let index = 0; index < HIGH_COUNT; index += 1) {
    high[index] = HIGH_START + index;
  }
  const decoded = new TextDecoder(encoding).decode(high);
  const table = new Map<string, number>();
  for (let index = 0; index < decoded.length; index += 1) {
    const character = decoded[index];
    if (!table.has(character)) {
      table.set(character, HIGH_START + index);
    }
  }
  tables.set(encoding, table);
  return table;
}

export function encodeText(text: string, encoding: Encoding): Uint8Array {
  if (encoding === "utf-8") {
    return new TextEncoder().encode(text);
  }
  const table = tableFor(encoding);
  const bytes: number[] = [];
  for (const character of text) {
    const code = character.codePointAt(0) as number;
    bytes.push(code < HIGH_START ? code : (table.get(character) ?? SUBSTITUTE));
  }
  return Uint8Array.from(bytes);
}

export function concatBytes(parts: Uint8Array[]): Uint8Array {
  let length = 0;
  for (const part of parts) {
    length += part.length;
  }
  const out = new Uint8Array(length);
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}
