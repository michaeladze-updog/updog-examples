import { strToU8, zipSync } from "fflate";

const FIXED_MTIME = Date.UTC(2020, 0, 1);

export function zip(files: Record<string, string | Uint8Array>): Uint8Array {
  const entries: Record<string, [Uint8Array, { mtime: number }]> = {};
  for (const [path, content] of Object.entries(files)) {
    const bytes = typeof content === "string" ? strToU8(content) : content;
    entries[path] = [bytes, { mtime: FIXED_MTIME }];
  }
  return zipSync(entries, { level: 6 });
}
