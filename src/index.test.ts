import { expect, it } from 'vitest';
import { de } from './locales';
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
