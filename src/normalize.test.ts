import { describe, expect, it } from 'vitest';
import { fold, normalizeLabel, parseNumber } from './normalize';

describe('fold', () => {
  it.each([
    ['Größe', 'GROESSE'],
    ['Grösse', 'GROESSE'],
    ['GROESSE', 'GROESSE'],
    ['één maat', 'EEN MAAT'],
    ['mały', 'MALY'],
    ['très', 'TRES'],
  ])('folds %s to %s', (input, expected) => expect(fold(input)).toBe(expected));
});

describe('normalizeLabel', () => {
  it.each([
    ['  xl ', 'xl', 'XL'],
    ['S  M', 'S M', 'S M'],
    ['42½', '42 1/2', '42 1/2'],
    ['42⅔', '42 2/3', '42 2/3'],
    ['37\u00A01/3', '37 1/3', '37 1/3'],
    ['XL\u200B', 'XL', 'XL'],
  ])('normalises %j', (raw, text, folded) => expect(normalizeLabel(raw)).toEqual({ raw, text, folded }));

  it('coerces non-strings', () => {
    expect(normalizeLabel(42).text).toBe('42');
    expect(normalizeLabel(undefined).text).toBe('');
  });
});

describe('parseNumber', () => {
  it.each([
    ['42', 42],
    ['42,5', 42.5],
    ['37.5', 37.5],
    ['0,375', 0.375],
    ['.67', 0.67],
    ['0.330', 0.33],
    ['1.234,5', 1234.5],
    ['1,234.5', 1234.5],
    ['1.000.000', 1_000_000],
    ['1.000', 1000],
    ['1,500', 1500],
  ])('reads %s as %d', (token, value) => expect(parseNumber(token)).toBe(value));

  it.each(['', '12a', 'abc'])('rejects %j', (token) => expect(parseNumber(token)).toBeUndefined());
});
