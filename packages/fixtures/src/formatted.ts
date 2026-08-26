import type { FormattedNumber } from "./model";

export function isFormattedNumber(value: unknown): value is FormattedNumber {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as FormattedNumber).kind === "formatted-number"
  );
}

const CLOCK_RE = /^(\d{1,3}):([0-5]\d)(?::([0-5]\d))?\s*(a\.?m\.?|p\.?m\.?)?$/i;

export function clock(text: string, formatCode = "hh:mm"): FormattedNumber {
  const parts = CLOCK_RE.exec(text.trim());
  if (!parts) {
    throw new Error(`clock needs h:mm[:ss][ am|pm], got "${text}"`);
  }
  let hours = Number(parts[1]);
  const minutes = Number(parts[2]);
  const seconds = parts[3] === undefined ? 0 : Number(parts[3]);
  const marker = parts[4]?.toLowerCase().replace(/\./g, "");
  if (marker) {
    if (hours < 1 || hours > 12) {
      throw new Error(
        `clock needs an hour of 1..12 beside ${marker}, got "${text}"`,
      );
    }
    if (marker === "am") {
      hours = hours === 12 ? 0 : hours;
    } else {
      hours = hours === 12 ? 12 : hours + 12;
    }
  }
  return {
    kind: "formatted-number",
    value: (hours * 3600 + minutes * 60 + seconds) / 86400,
    formatCode,
    text: text.trim(),
  };
}

export function padded(value: number, width: number): FormattedNumber {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`padded needs a non-negative integer, got ${value}`);
  }
  if (width < 1 || width > 30) {
    throw new Error(`padded needs a width of 1..30, got ${width}`);
  }
  const text = String(value).padStart(width, "0");
  if (text.length > width) {
    throw new Error(`padded: ${value} does not fit in ${width} digits`);
  }
  return {
    kind: "formatted-number",
    value,
    formatCode: "0".repeat(width),
    text,
  };
}
