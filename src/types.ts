export type SizeGroup = 'age' | 'numeric' | 'letter' | 'sequence' | 'bed' | 'dimensions' | 'volume' | 'weight' | 'oneSize';

export type SizeSystem =
  | 'number'
  | 'kidsShoe'
  | 'bra'
  | 'letter'
  | 'lengthWord'
  | 'sequence'
  | 'age'
  | 'bed'
  | 'pillow'
  | 'dimensions'
  | 'volume'
  | 'weight'
  | 'oneSize';

/** One way to read a label. Keys are compared element by element within a group. */
export interface Reading {
  readonly system: SizeSystem;
  readonly group: SizeGroup;
  readonly key: readonly number[];
  readonly text?: string;
}

export type LetterWord = 'S' | 'M' | 'L' | 'X';

export type Variant = 'short' | 'regular' | 'long';

/** Words in order. An inner array lists synonyms. */
export type OrderedWords = readonly (string | readonly string[])[];

/** Words for one language. Words are written in their natural spelling and folded when compiled. */
export interface SizeLocale {
  /** Letter words, e.g. `klein: 'S'`, `extra: 'X'`. */
  readonly letters?: Readonly<Record<string, LetterWord>>;
  /** Fit and length words, e.g. `kurz: 'short'`, `lang: 'long'`. */
  readonly variants?: Readonly<Record<string, Variant>>;
  /** Words for months after a number, e.g. `monate`. */
  readonly months?: readonly string[];
  /** Words for years after a number, e.g. `jahre`. */
  readonly years?: readonly string[];
  /** Words for babies younger than 0 months, smallest first, ending with "newborn". */
  readonly babyWords?: OrderedWords;
  /** Words that mean "one size". */
  readonly oneSize?: readonly string[];
  /** Words removed from the start of a label, e.g. `größe`. */
  readonly prefixes?: readonly string[];
}

export interface SortOptions<T> {
  /** Returns the size label of an item. Required when the items are not strings. */
  by?: (item: T) => string;
  /** Languages besides English, which is always active. Earlier locales win on conflicts. */
  locales?: readonly SizeLocale[];
  /** Groups to put first, in this order. The other groups follow in the default order. */
  groupOrder?: readonly SizeGroup[];
  /** Largest first. Unknown values stay last. */
  descending?: boolean;
}

export const DEFAULT_GROUP_ORDER: readonly SizeGroup[] = [
  'age',
  'numeric',
  'letter',
  'sequence',
  'bed',
  'dimensions',
  'volume',
  'weight',
  'oneSize',
];

/** Variant ranks, the last key element of numeric and letter readings (spec 6.2). */
export const VARIANT: {
  readonly short: 1;
  readonly none: 2;
  readonly regular: 3;
  readonly long: 4;
  readonly extraWide: 5;
  readonly extraExtraWide: 6;
  readonly cup: 10;
  readonly unknown: 1000;
} = { short: 1, none: 2, regular: 3, long: 4, extraWide: 5, extraExtraWide: 6, cup: 10, unknown: 1000 };

/** The merged ring and cup sequence (spec 7.3). */
export const SEQUENCE: readonly string[] = [
  'AA',
  'A',
  'B',
  'C',
  'D',
  'DD',
  'DDD',
  'E',
  'F',
  'FF',
  'G',
  'GG',
  'H',
  'HH',
  'I',
  'J',
  'JJ',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];
