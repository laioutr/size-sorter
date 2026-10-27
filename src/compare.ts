import { DEFAULT_GROUP_ORDER, type Reading, type SizeGroup, type UnknownPlacement } from './types';

/** Fixed, so the server and the browser agree. */
export const collator: Intl.Collator = new Intl.Collator('und', { numeric: true });

/** Position of each group: the listed groups first, then the rest in default order. */
function buildRanks(groupOrder: readonly SizeGroup[]): ReadonlyMap<SizeGroup, number> {
  const ranks = new Map<SizeGroup, number>();
  for (const group of [...groupOrder, ...DEFAULT_GROUP_ORDER]) {
    if (DEFAULT_GROUP_ORDER.includes(group) && !ranks.has(group)) ranks.set(group, ranks.size);
  }
  return ranks;
}

const DEFAULT_RANKS = buildRanks([]);

export function groupRanks(groupOrder: readonly SizeGroup[] = []): ReadonlyMap<SizeGroup, number> {
  // Most sorts use the default order, so it is built once.
  return groupOrder.length > 0 ? buildRanks(groupOrder) : DEFAULT_RANKS;
}

/** Compares keys element by element. A missing element sorts first. */
export function compareKeys(a: readonly number[], b: readonly number[]): number {
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index++) {
    const x = a[index];
    const y = b[index];
    if (x === y) continue;
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    return x < y ? -1 : 1;
  }
  return 0;
}

function compareText(a: string | undefined, b: string | undefined): number {
  if (a === b) return 0;
  if (a === undefined) return -1;
  if (b === undefined) return 1;
  return collator.compare(a, b);
}

export interface Entry {
  readonly raw: string;
  readonly reading: Reading | undefined;
  /** Input position, which orders unknown values when they keep their input order. */
  readonly order: number;
}

export interface Placement {
  readonly descending: boolean;
  readonly unknownFirst: boolean;
  readonly keepOrder: boolean;
}

/** Any other `unknown` value, null included, behaves like the default `'alphabetical-last'`. */
export function placement(descending: boolean | null | undefined, unknown: UnknownPlacement | null | undefined): Placement {
  return {
    descending: descending === true,
    unknownFirst: unknown === 'alphabetical-first' || unknown === 'original-first',
    keepOrder: unknown === 'original-first' || unknown === 'original-last',
  };
}

/** Recognised values by group, key and text; unknown values first or last, in input or collator order. */
export function compareEntries(a: Entry, b: Entry, ranks: ReadonlyMap<SizeGroup, number>, place: Placement): number {
  if (!a.reading || !b.reading) {
    if (a.reading) return place.unknownFirst ? 1 : -1;
    if (b.reading) return place.unknownFirst ? -1 : 1;
    return (place.keepOrder && a.order - b.order) || collator.compare(a.raw, b.raw);
  }
  const result =
    (ranks.get(a.reading.group) ?? 0) - (ranks.get(b.reading.group) ?? 0) ||
    compareKeys(a.reading.key, b.reading.key) ||
    compareText(a.reading.text, b.reading.text);
  return place.descending ? 0 - result : result;
}
