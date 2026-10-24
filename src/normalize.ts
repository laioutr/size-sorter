export interface Label {
  readonly raw: string;
  readonly text: string;
  readonly folded: string;
}

/** Regex source of one number token: `42`, `36,5`, `1.000`, `.67`. */
export const NUMBER_SOURCE: string = String.raw`(?:\d+(?:[.,]\d+)*|[.,]\d+)`;

const NUMBER = new RegExp(`^${NUMBER_SOURCE}$`);

const LETTERS: Readonly<Record<string, string>> = { ä: 'ae', Ä: 'AE', ö: 'oe', Ö: 'OE', ü: 'ue', Ü: 'UE', ß: 'ss', ł: 'l', Ł: 'L' };

const FRACTIONS: Readonly<Record<string, string>> = { '½': ' 1/2', '⅓': ' 1/3', '⅔': ' 2/3', '¼': ' 1/4', '¾': ' 3/4' };

/** Folds a word for matching: umlauts to `ae oe ue`, `ß` to `ss`, accents removed, upper-case. */
export function fold(value: string): string {
  return value
    .replace(/[äÄöÖüÜßłŁ]/g, (char) => LETTERS[char] ?? char)
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase();
}

/** Coerces any value to a string without throwing. */
export function toText(raw: unknown): string {
  if (typeof raw === 'string') return raw;
  try {
    return String(raw ?? '');
  } catch {
    return '';
  }
}

export function normalizeLabel(raw: unknown): Label {
  const source = toText(raw);
  const text = source
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[½⅓⅔¼¾]/g, (char) => FRACTIONS[char] ?? char)
    .replace(/\s+/g, ' ')
    .trim();
  return { raw: source, text, folded: fold(text) };
}

/**
 * Reads one number token. Whether `.` or `,` is the decimal separator depends on
 * the shape of the token, never on a locale (spec 7.1).
 */
export function parseNumber(token: string): number | undefined {
  if (!NUMBER.test(token)) return undefined;
  const separators = token.replace(/\d/g, '');
  const last = separators.at(-1);
  if (last === undefined) return Number(token);

  let decimal: boolean;
  if (/^[.,]/.test(token) || (separators.includes('.') && separators.includes(','))) {
    decimal = true;
  } else if (separators.length > 1) {
    decimal = false;
  } else {
    const [integer = '', fraction = ''] = token.split(last);
    decimal = /^0+$/.test(integer) || fraction.length !== 3;
  }

  const index = token.lastIndexOf(last);
  const digits = token.slice(0, index).replace(/[.,]/g, '') + (decimal ? '.' : '') + token.slice(index + 1);
  return Number(digits);
}
