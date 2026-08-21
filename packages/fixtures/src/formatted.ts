import type { FormattedNumber } from "./model";

export function isFormattedNumber(value: unknown): value is FormattedNumber {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as FormattedNumber).kind === "formatted-number"
  );
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
