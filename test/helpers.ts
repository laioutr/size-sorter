import { expect } from 'vitest';
import { sortBySize, type SortOptions } from '../src/index';

/* eslint-disable no-bitwise -- mulberry32 is defined in terms of 32-bit integer operations */
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/* eslint-enable no-bitwise */

/** A seeded Fisher–Yates shuffle. */
export function shuffled<T>(items: readonly T[], seed: number): T[] {
  const random = mulberry32(seed);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}

/** Shuffles a correctly ordered list with five seeds and checks that each shuffle sorts back. */
export function expectSortsBack(list: readonly string[], options?: SortOptions<string>): void {
  for (let seed = 1; seed <= 5; seed++) {
    expect(sortBySize(shuffled(list, seed), options), `seed ${seed}`).toEqual(list);
  }
}
