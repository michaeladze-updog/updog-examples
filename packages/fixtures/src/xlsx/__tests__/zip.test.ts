import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { zip } from "../zip";

const files = {
  "hello.txt": "hello",
  "nested/data.bin": new Uint8Array([1, 2, 3]),
};

describe("zip", () => {
  it("round-trips its entries", () => {
    const unpacked = unzipSync(zip(files));
    expect(strFromU8(unpacked["hello.txt"] as Uint8Array)).toBe("hello");
    expect([...(unpacked["nested/data.bin"] as Uint8Array)]).toEqual([1, 2, 3]);
  });

  it("produces identical bytes on repeated runs", () => {
    expect([...zip(files)]).toEqual([...zip(files)]);
  });

  it("encodes strings as UTF-8", () => {
    const unpacked = unzipSync(zip({ "u.txt": "grüße ✓" }));
    expect(strFromU8(unpacked["u.txt"] as Uint8Array)).toBe("grüße ✓");
  });
});
