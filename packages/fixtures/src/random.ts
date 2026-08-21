export type Rng = {
  next: () => number;
  int: (min: number, max: number) => number;
  float: (min: number, max: number) => number;
  pick: <T>(values: T[], weights?: number[]) => T;
  bool: (probability?: number) => boolean;
};

export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const float = (min: number, max: number): number => {
    return min + next() * (max - min);
  };

  const int = (min: number, max: number): number => {
    return min + Math.floor(next() * (max - min + 1));
  };

  const pick = <T>(values: T[], weights?: number[]): T => {
    if (values.length === 0) {
      throw new Error("pick needs at least one value");
    }
    if (!weights) {
      return values[int(0, values.length - 1)] as T;
    }
    if (weights.length !== values.length) {
      throw new Error(
        `pick got ${values.length} values and ${weights.length} weights`,
      );
    }
    const total = weights.reduce((sum, weight) => {
      return sum + weight;
    }, 0);
    let target = next() * total;
    for (let index = 0; index < values.length; index++) {
      target -= weights[index] as number;
      if (target <= 0) {
        return values[index] as T;
      }
    }
    return values[values.length - 1] as T;
  };

  const bool = (probability = 0.5): boolean => {
    return next() < probability;
  };

  return { next, int, float, pick, bool };
}
