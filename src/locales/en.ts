import type { SizeLocale } from '../types';

/** English. Built into the core and always active. */
export const en: SizeLocale = {
  letters: { S: ['small', 'sm'], M: ['medium', 'med', 'md'], L: ['large', 'lg'], X: ['extra', 'x', 'xtra'] },
  variants: {
    short: ['short', 'petite', 'narrow'],
    regular: ['regular', 'reg', 'standard'],
    long: ['long', 'tall', 'big', 'wide', 'plus'],
  },
  months: ['mo', 'mos', 'mth', 'month', 'months'],
  years: ['yr', 'yrs', 'year', 'years'],
  babyWords: ['micro preemie', 'preemie', ['newborn', 'nb']],
  oneSize: ['one size', 'onesize', 'os', 'o/s', 'osfa', 'osfm', 'free size', 'adj', 'adjustable'],
  prefixes: ['size', 'sz', "men's", "women's"],
  beds: [
    'small single',
    'single',
    'twin',
    'twin xl',
    'small double',
    'double',
    'full',
    'queen',
    'king',
    'super king',
    ['cal king', 'california king'],
    'split king',
    ['split cal king', 'split california king'],
    'emperor',
  ],
  pillows: ['standard', 'queen', 'king'],
};
