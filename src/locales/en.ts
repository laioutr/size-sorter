import type { SizeLocale } from '../types';

/** English. Built into the core and always active. */
export const en: SizeLocale = {
  letters: { small: 'S', sm: 'S', medium: 'M', med: 'M', md: 'M', large: 'L', lg: 'L', extra: 'X', x: 'X', xtra: 'X' },
  variants: {
    short: 'short',
    petite: 'short',
    narrow: 'short',
    regular: 'regular',
    reg: 'regular',
    long: 'long',
    tall: 'long',
    big: 'long',
    wide: 'long',
    plus: 'long',
  },
  months: ['mo', 'mos', 'mth', 'month', 'months'],
  years: ['yr', 'yrs', 'year', 'years'],
  babyWords: ['micro preemie', 'preemie', ['newborn', 'nb']],
  oneSize: ['one size', 'onesize', 'os', 'o/s', 'osfa', 'osfm', 'free size', 'adj', 'adjustable'],
  prefixes: ['size', 'sz', "men's", "women's"],
};
