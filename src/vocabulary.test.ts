import { expect, it } from 'vitest';
import { de, nl } from './locales';
import { compileVocabulary } from './vocabulary';
import type { SizeLocale } from './types';

it('always includes English', () => {
  const v = compileVocabulary([]);
  expect(v.letterWords.get('SMALL')).toBe('S');
  expect(v.letterWords.get('EXTRA')).toBe('X');
  expect(v.oneSize).toContain('ONE SIZE');
  expect(v.prefixes).toEqual(expect.arrayContaining(['SIZE', 'SZ', 'EU', 'UK', 'US']));
});

it('folds locale words', () => expect(compileVocabulary([de]).letterWords.get('GROSS')).toBe('L'));

it('sorts one-size words and prefixes longest first', () => {
  const { prefixes, oneSize } = compileVocabulary([de, nl]);
  expect(prefixes[0]).toBe('GROESSE');
  expect(oneSize[0]).toBe('EINHEITSGROESSE');
});

it('lets earlier locales win and checks English last', () => {
  const a: SizeLocale = { letters: { grand: 'L', large: 'S' } };
  const b: SizeLocale = { letters: { grand: 'S' } };
  expect(compileVocabulary([a, b]).letterWords.get('GRAND')).toBe('L');
  expect(compileVocabulary([b, a]).letterWords.get('GRAND')).toBe('S');
  expect(compileVocabulary([a]).letterWords.get('LARGE')).toBe('S');
});

it('caches by locale identity, not by array', () => {
  expect(compileVocabulary([de, nl])).toBe(compileVocabulary([de, nl]));
  expect(compileVocabulary([de, nl])).not.toBe(compileVocabulary([nl, de]));
});

it('numbers baby words up to newborn', () => {
  const { babyWords } = compileVocabulary([]);
  expect(babyWords.get('MICRO PREEMIE')).toBe(-2);
  expect(babyWords.get('PREEMIE')).toBe(-1);
  expect(babyWords.get('NEWBORN')).toBe(0);
  expect(babyWords.get('NB')).toBe(0);
});

it('compiles variant, month and year words', () => {
  expect(compileVocabulary([de]).variantWords.get('LANG')).toBe('long');
  expect(compileVocabulary([de]).yearWords).toEqual(expect.arrayContaining(['J', 'JAHRE']));
  expect(compileVocabulary([]).monthWords).toContain('MONTHS');
  expect(compileVocabulary([]).monthWords).not.toContain('M');
});
