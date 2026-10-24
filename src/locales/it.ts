import type { SizeLocale } from '../types';

/** Italian. */
export const it: SizeLocale = {
  letters: { S: ['piccolo'], M: ['medio'], L: ['grande'], X: ['extra'] },
  variants: { short: ['corto'], regular: ['regolare'], long: ['lungo'] },
  months: ['mese', 'mesi'],
  years: ['anno', 'anni'],
  babyWords: ['prematuro', 'neonato'],
  oneSize: ['taglia unica', 'tu'],
  prefixes: ['taglia', 'tg'],
  beds: [
    ['singolo', 'una piazza'],
    ['piazza e mezza', 'francese'],
    ['matrimoniale', 'due piazze'],
  ],
};
