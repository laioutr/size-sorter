import { en } from './locales/en';
import { fold } from './normalize';
import type { LetterWord, SizeLocale } from './types';

/** The active locales' words, folded into lookup tables. */
export interface Vocabulary {
  /** Folded word → letter. */
  readonly letterWords: ReadonlyMap<string, LetterWord>;
  /** Folded, longest first. */
  readonly oneSize: readonly string[];
  /** Folded, longest first, region codes included. */
  readonly prefixes: readonly string[];
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
  const oneSize = new Set<string>();
  const prefixes = new Set<string>(REGION_CODES);
  for (const locale of locales) {
    for (const [word, letter] of Object.entries(locale.letters ?? {})) {
      const folded = fold(word);
      if (!letterWords.has(folded)) letterWords.set(folded, letter);
    }
    for (const word of locale.oneSize ?? []) oneSize.add(fold(word));
    for (const word of locale.prefixes ?? []) prefixes.add(fold(word));
  }
  return { letterWords, oneSize: longestFirst(oneSize), prefixes: longestFirst(prefixes) };
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
