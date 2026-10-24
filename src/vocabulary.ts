import { en } from './locales/en';
import { fold } from './normalize';
import type { LetterWord, OrderedWords, Reading, SizeLocale, Variant } from './types';

/** The active locales' words, folded into lookup tables. */
export interface Vocabulary {
  /** Folded word → letter. */
  readonly letterWords: ReadonlyMap<string, LetterWord>;
  /** Folded word → variant. */
  readonly variantWords: ReadonlyMap<string, Variant>;
  /** Folded, longest first. */
  readonly monthWords: readonly string[];
  /** Folded, longest first. */
  readonly yearWords: readonly string[];
  /** Folded word → age in months: the last word of a locale's list is 0, earlier ones −1, −2, … */
  readonly babyWords: ReadonlyMap<string, number>;
  /** Folded, longest first. */
  readonly oneSize: readonly string[];
  /** Folded, longest first, region codes included. */
  readonly prefixes: readonly string[];
  /** Folded bed word → [index of its locale among the active locales, English last; position in that locale's list]. */
  readonly beds: ReadonlyMap<string, readonly [number, number]>;
  /** Folded pillow word → position. */
  readonly pillows: ReadonlyMap<string, number>;
  /** Label → readings, filled by `parseLabel`. */
  readonly labels: Map<string, readonly Reading[]>;
}

export const REGION_CODES: readonly string[] = ['EU', 'UK', 'US', 'FR', 'IT', 'DE', 'AU', 'JP'];

interface CacheNode {
  vocabulary?: Vocabulary;
  readonly next: WeakMap<SizeLocale, CacheNode>;
}

const cache: CacheNode = { next: new WeakMap() };

const longestFirst = (words: Iterable<string>): string[] => [...words].sort((a, b) => b.length - a.length);

function build(locales: readonly SizeLocale[]): Vocabulary {
  const letterWords = new Map<string, LetterWord>();
  const variantWords = new Map<string, Variant>();
  const babyWords = new Map<string, number>();
  const beds = new Map<string, readonly [number, number]>();
  const pillows = new Map<string, number>();
  const words = { months: new Set<string>(), years: new Set<string>(), oneSize: new Set<string>(), prefixes: new Set(REGION_CODES) };
  // Earlier locales win, so a word that is already set stays. Empty words would match everything.
  const add = <V>(map: Map<string, V>, word: string, value: V) => {
    const folded = fold(word);
    if (folded && !map.has(folded)) map.set(folded, value);
  };
  const addAll = <V extends string>(map: Map<string, V>, lists: Readonly<Partial<Record<V, readonly string[]>>> | undefined) => {
    for (const [value, list] of Object.entries(lists ?? {}) as [V, readonly string[] | undefined][]) {
      for (const word of list ?? []) add(map, word, value);
    }
  };
  // Each word of an ordered list gets its position; synonyms share one.
  const addOrdered = <V>(map: Map<string, V>, list: OrderedWords | undefined, value: (position: number) => V) =>
    list?.forEach((entry, position) => {
      for (const word of [entry].flat()) add(map, word, value(position));
    });
  locales.forEach((locale, index) => {
    addAll(letterWords, locale.letters);
    addAll(variantWords, locale.variants);
    const baby = locale.babyWords ?? [];
    addOrdered(babyWords, baby, (position) => position - baby.length + 1);
    addOrdered(beds, locale.beds, (position) => [index, position] as const);
    addOrdered(pillows, locale.pillows, (position) => position);
    for (const key of ['months', 'years', 'oneSize', 'prefixes'] as const) {
      for (const word of locale[key] ?? []) if (fold(word)) words[key].add(fold(word));
    }
  });
  return {
    letterWords,
    variantWords,
    monthWords: longestFirst(words.months),
    yearWords: longestFirst(words.years),
    babyWords,
    beds,
    pillows,
    oneSize: longestFirst(words.oneSize),
    prefixes: longestFirst(words.prefixes),
    labels: new Map(),
  };
}

/**
 * Compiles the given locales plus English, which is checked last.
 * Cached per sequence of locale objects, so a new array with the same locales reuses the result.
 */
export function compileVocabulary(locales: readonly SizeLocale[]): Vocabulary {
  const active = locales.filter((locale) => typeof locale === 'object' && locale !== null);
  let node = cache;
  for (const locale of active) {
    let child = node.next.get(locale);
    if (!child) {
      child = { next: new WeakMap() };
      node.next.set(locale, child);
    }
    node = child;
  }
  return (node.vocabulary ??= build([...active, en]));
}
