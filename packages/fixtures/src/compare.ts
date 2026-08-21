import type { FixtureFile } from "./define";

export type Difference = {
  path: string;
  reason: string;
};

export function compare(
  expected: FixtureFile[],
  actual: Map<string, Uint8Array>,
): Difference[] {
  const differences: Difference[] = [];
  const seen = new Set<string>();

  for (const file of expected) {
    seen.add(file.path);
    const found = actual.get(file.path);
    if (!found) {
      differences.push({ path: file.path, reason: "missing on disk" });
      continue;
    }
    if (found.byteLength !== file.bytes.byteLength) {
      differences.push({
        path: file.path,
        reason: `${file.bytes.byteLength} bytes expected, ${found.byteLength} on disk`,
      });
      continue;
    }
    for (let index = 0; index < found.byteLength; index++) {
      if (found[index] !== file.bytes[index]) {
        differences.push({
          path: file.path,
          reason: `differs at byte ${index}`,
        });
        break;
      }
    }
  }

  for (const path of actual.keys()) {
    if (!seen.has(path)) {
      differences.push({ path, reason: "no longer generated" });
    }
  }

  return differences;
}
