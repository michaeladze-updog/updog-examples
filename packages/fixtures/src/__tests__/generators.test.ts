import { describe, expect, it } from "vitest";
import { createRng } from "../random";
import {
  blank,
  constant,
  custom,
  date,
  email,
  number,
  pick,
  seq,
  text,
} from "../generators";

const rng = () => {
  return createRng(1);
};

describe("seq", () => {
  it("numbers from one and pads to the requested width", () => {
    const generator = seq("HL-{n:06}");
    expect(generator(rng(), 0, {})).toBe("HL-000001");
    expect(generator(rng(), 12, {})).toBe("HL-000013");
  });

  it("leaves an unpadded token unpadded", () => {
    expect(seq("row {n}")(rng(), 41, {})).toBe("row 42");
  });
});

describe("constant", () => {
  it("returns the same value for every row", () => {
    const generator = constant("Harbour Lane");
    expect(generator(rng(), 0, {})).toBe("Harbour Lane");
    expect(generator(rng(), 99, {})).toBe("Harbour Lane");
  });
});

describe("number", () => {
  it("rounds to the requested decimals and stays in range", () => {
    const generator = number(0.4, 380, { decimals: 2 });
    const stream = createRng(5);
    for (let index = 0; index < 200; index++) {
      const value = generator(stream, index, {}) as number;
      expect(value).toBeGreaterThanOrEqual(0.4);
      expect(value).toBeLessThanOrEqual(380);
      expect(String(value).split(".")[1]?.length ?? 0).toBeLessThanOrEqual(2);
    }
  });

  it("produces integers with no decimals option", () => {
    const value = number(1, 10)(rng(), 0, {}) as number;
    expect(Number.isInteger(value)).toBe(true);
  });
});

describe("date", () => {
  it("returns a Date inside the range", () => {
    const generator = date("2026-01-01", "2026-06-30");
    const stream = createRng(6);
    for (let index = 0; index < 200; index++) {
      const value = generator(stream, index, {}) as Date;
      expect(value.getTime()).toBeGreaterThanOrEqual(
        Date.parse("2026-01-01T00:00:00Z"),
      );
      expect(value.getTime()).toBeLessThanOrEqual(
        Date.parse("2026-06-30T00:00:00Z"),
      );
    }
  });

  it("formats to a string when asked", () => {
    const value = date("2026-03-04", "2026-03-04", { as: "DD/MM/YYYY" })(
      rng(),
      0,
      {},
    );
    expect(value).toBe("04/03/2026");
  });
});

describe("email", () => {
  it("builds an address from earlier columns in the row", () => {
    const generator = email({ from: ["First Name", "Last Name"] });
    const row = { "First Name": "Ana Maria", "Last Name": "O'Neill" };
    expect(generator(rng(), 0, row)).toBe("anamaria.oneill@example.com");
  });
});

describe("blank", () => {
  it("returns null at the requested rate", () => {
    const generator = blank(constant("x"), 1);
    expect(generator(rng(), 0, {})).toBeNull();
    expect(blank(constant("x"), 0)(rng(), 0, {})).toBe("x");
  });
});

describe("pick", () => {
  it("returns one of the given values", () => {
    const generator = pick(["DHL", "UPS", "FedEx"]);
    const stream = createRng(8);
    for (let index = 0; index < 100; index++) {
      expect(["DHL", "UPS", "FedEx"]).toContain(generator(stream, index, {}));
    }
  });
});

describe("text", () => {
  it("returns the requested number of words", () => {
    const value = text(3)(rng(), 0, {}) as string;
    expect(value.split(" ")).toHaveLength(3);
  });
});

describe("custom", () => {
  it("passes the row through", () => {
    const generator = custom((_rng, rowIndex, row) => {
      return `${row.Carrier}-${rowIndex}`;
    });
    expect(generator(rng(), 4, { Carrier: "DHL" })).toBe("DHL-4");
  });
});
