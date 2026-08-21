import { describe, expect, it } from "vitest";
import { formatCell } from "../csv";
import { isFormattedNumber, padded } from "../formatted";

describe("padded", () => {
  it("stores the number and the text a spreadsheet would show", () => {
    expect(padded(417, 5)).toEqual({
      kind: "formatted-number",
      value: 417,
      formatCode: "00000",
      text: "00417",
    });
  });

  it("leaves a value that already fills the width alone", () => {
    expect(padded(12345, 5).text).toBe("12345");
  });

  it("rejects a value wider than the format", () => {
    expect(() => {
      return padded(123456, 5);
    }).toThrow();
  });

  it("rejects a fraction", () => {
    expect(() => {
      return padded(1.5, 5);
    }).toThrow();
  });

  it("recognises its own cells", () => {
    expect(isFormattedNumber(padded(1, 4))).toBe(true);
    expect(isFormattedNumber(417)).toBe(false);
    expect(isFormattedNumber(null)).toBe(false);
  });
});

describe("formatCell", () => {
  it("writes the displayed text into a CSV", () => {
    expect(formatCell(padded(417, 5))).toBe("00417");
  });
});
