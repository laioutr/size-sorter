import { expect, expectTypeOf, it } from 'vitest';
import { de } from './locales';
import type { SortOptions, UnknownPlacement } from './index';
import { createSizeComparator, sortBySize } from './index';

it('sorts the spec example', () => expect(sortBySize(['XL', 'S', 'One Size'])).toEqual(['S', 'XL', 'One Size']));

it('sorts objects with by and does not mutate', () => {
  const items = [
    { id: 'a', size: 'L' },
    { id: 'b', size: 'XS' },
  ];
  const copy = items.map((item) => ({ ...item }));
  const output = sortBySize(items, { by: (item) => item.size });
  expect(output.map((item) => item.id)).toEqual(['b', 'a']);
  expect(items).toEqual(copy);
  expect(output).not.toBe(items);
});

it('applies groupOrder', () => {
  expect(sortBySize(['XL', '42', 'One Size'], { groupOrder: ['letter'] })).toEqual(['XL', '42', 'One Size']);
  expect(sortBySize(['XL', '42', 'One Size'], { groupOrder: ['oneSize', 'letter'] })).toEqual(['One Size', 'XL', '42']);
});

it('sorts descending with unknown values last', () => {
  expect(sortBySize(['S', 'XL', 'M', 'Kids', 'Adults'], { descending: true })).toEqual(['XL', 'M', 'S', 'Adults', 'Kids']);
  expect(sortBySize(['42', 'S', 'One Size'], { descending: true })).toEqual(['One Size', 'S', '42']);
});

it('uses locales', () => {
  expect(sortBySize(['Groß', 'Klein', 'Mittel'], { locales: [de] })).toEqual(['Klein', 'Mittel', 'Groß']);
  expect(sortBySize(['Mittel', 'Klein', 'Groß'])).toEqual(['Groß', 'Klein', 'Mittel']);
});

it('sorts unknown values with the und collator', () => {
  expect(sortBySize(['Zebra', 'Äpfel', 'Apfel'])).toEqual(['Apfel', 'Äpfel', 'Zebra']);
  expect(sortBySize(['Pack 10', 'Pack 9'])).toEqual(['Pack 9', 'Pack 10']);
});

it('builds a comparator from the list', () => {
  const compare = createSizeComparator(['S', 'M', 'L']);
  expect(['L', 'S', 'M'].sort(compare)).toEqual(['S', 'M', 'L']);
  expect(compare('XL', 'S')).toBeGreaterThan(0);
  expect(compare('Kids', 'S')).toBeGreaterThan(0);
  expect(compare('XXL', '2XL')).toBe(0);
});

it('keeps duplicates', () => expect(sortBySize(['M', 'S', 'M'])).toEqual(['S', 'M', 'M']));

it('coerces non-string sizes', () => {
  expect(sortBySize([{ s: 42 }, { s: 38 }], { by: (item) => item.s as unknown as string }).map((item) => item.s)).toEqual([38, 42]);
  expect(() => sortBySize([undefined, 'M'] as unknown as string[])).not.toThrow();
});

it('puts empty labels with the unknown values', () => {
  const output = sortBySize(['', 'M', '   ']);
  expect(output[0]).toBe('M');
  expect(output).toHaveLength(3);
});

it('keeps literal label types', () => {
  type Size = 'S' | 'M' | 'L';
  const sizes: Size[] = ['L', 'S'];
  const sorted: Size[] = sortBySize(sizes);
  expectTypeOf(sortBySize(sizes)).toEqualTypeOf<Size[]>();
  expect(sorted).toEqual(['S', 'L']);
});

it('ignores empty locale words instead of hanging', () => {
  const locales = [{ prefixes: ['', '́'], oneSize: [''], letters: { S: [''] } }];
  expect(sortBySize(['42', '40', 'M', 'S'], { locales })).toEqual(['40', '42', 'S', 'M']);
});

it('never throws on null options or sparse arrays from JavaScript callers', () => {
  expect(sortBySize(['L', 'S'], { locales: null, groupOrder: null } as never)).toEqual(['S', 'L']);
  expect(sortBySize(['L', 'S'], null as never)).toEqual(['S', 'L']);
  expect(createSizeComparator(['L', 'S'], { locales: null, groupOrder: null } as never)('L', 'S')).toBeGreaterThan(0);
  // eslint-disable-next-line no-sparse-arrays -- a hole is what a JavaScript caller can pass
  expect(() => sortBySize(['M', , 'S'] as string[])).not.toThrow();
});

it.each([
  ['alphabetical-last', ['S', 'M', 'L', 'Maxi', 'Midi', 'Mini']],
  ['alphabetical-first', ['Maxi', 'Midi', 'Mini', 'S', 'M', 'L']],
  ['original-last', ['S', 'M', 'L', 'Mini', 'Midi', 'Maxi']],
  ['original-first', ['Mini', 'Midi', 'Maxi', 'S', 'M', 'L']],
] as const)('places unknown values with %s', (unknown, expected) =>
  expect(sortBySize(['Mini', 'L', 'Midi', 'S', 'Maxi', 'M'], { unknown })).toEqual(expected)
);

it('does not reverse unknown values when descending', () => {
  const values = ['Mini', 'S', 'Midi', 'XL', 'Maxi'];
  expect(sortBySize(values, { unknown: 'original-first', descending: true })).toEqual(['Mini', 'Midi', 'Maxi', 'XL', 'S']);
  expect(sortBySize(values, { unknown: 'alphabetical-first', descending: true })).toEqual(['Maxi', 'Midi', 'Mini', 'XL', 'S']);
});

it('orders unknown values by their first place in the comparator values, then other strings alphabetically', () => {
  const compare = createSizeComparator(['Mini', 'L', 'Midi', 'Mini', 'S'], { unknown: 'original-last' });
  expect(['Kids', 'Midi', 'S', 'Adults', 'Mini', 'L'].sort(compare)).toEqual(['S', 'L', 'Mini', 'Midi', 'Adults', 'Kids']);
});

it('treats a missing or unrecognised unknown option as the default', () => {
  expect(sortBySize(['Mini', 'S', 'Midi'], { unknown: null as never })).toEqual(['S', 'Midi', 'Mini']);
  expect(sortBySize(['Mini', 'S', 'Midi'], { unknown: 'nope' as never })).toEqual(['S', 'Midi', 'Mini']);
});

it('exports the unknown placement type', () =>
  expectTypeOf<SortOptions<string>['unknown']>().toEqualTypeOf<UnknownPlacement | undefined>());
