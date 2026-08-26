import { describe, expect, it } from "vitest";
import { formatCell } from "../csv";
import { clock, isFormattedNumber, padded } from "../formatted";

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

describe("clock", () => {
  it("stores the fraction of a day and the text a spreadsheet would show", () => {
    expect(clock("9:00 AM", "h:mm AM/PM")).toEqual({
      kind: "formatted-number",
      value: 0.375,
      formatCode: "h:mm AM/PM",
      text: "9:00 AM",
    });
  });

  it("reads the afternoon off the marker", () => {
    expect(clock("1:30 PM").value).toBeCloseTo(0.5625, 10);
    expect(clock("13:30").value).toBeCloseTo(0.5625, 10);
  });

  it("puts noon and midnight where the convention puts them", () => {
    expect(clock("12:00 AM").value).toBe(0);
    expect(clock("12:00 PM").value).toBe(0.5);
  });

  it("takes seconds and a dotted marker", () => {
    expect(clock("9:00:30 a.m.").value).toBeCloseTo(0.37534722222, 9);
  });

  it("takes an elapsed value past a full day", () => {
    expect(clock("32:30", "[h]:mm").value).toBeCloseTo(1.354166666, 8);
  });

  it("defaults to a twenty-four hour format code", () => {
    expect(clock("14:30").formatCode).toBe("hh:mm");
  });

  it("rejects an hour no twelve-hour clock has", () => {
    expect(() => {
      return clock("13:30 PM");
    }).toThrow();
  });

  it("rejects text that is not a time", () => {
    expect(() => {
      return clock("half past nine");
    }).toThrow();
  });
});

describe("formatCell", () => {
  it("writes the displayed text into a CSV", () => {
    expect(formatCell(padded(417, 5))).toBe("00417");
  });

  it("writes a clock cell as the text the sheet shows", () => {
    expect(formatCell(clock("9:00 AM", "h:mm AM/PM"))).toBe("9:00 AM");
  });
});
