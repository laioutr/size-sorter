// The test cases of the size sorter this library replaces. Its keep-order-on-unknown case is rewritten: unknown values go last.
import { describe, expect, it } from 'vitest';
import { sortBySize } from '../src/index';

const sorted = (values: string[]) => sortBySize(values, { by: (value) => value });

describe('sortBySize (cases from the replaced sorter)', () => {
  it('orders letter sizes from small to large', () => {
    expect(sorted(['3XL', '2XL', 'XL', 'S', 'M', 'L', 'XS'])).toEqual(['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']);
  });

  it('ranks the X-spelling and the digit-spelling of a size alike', () => {
    expect(sorted(['XXXL', '2XS', 'XXL', '4XL', 'XXS', '3XS'])).toEqual(['3XS', '2XS', 'XXS', 'XXL', 'XXXL', '4XL']);
  });

  it('keeps the original order of two spellings of one size', () => {
    expect(sorted(['XXL', '2XL'])).toEqual(['XXL', '2XL']);
    expect(sorted(['2XL', 'XXL'])).toEqual(['2XL', 'XXL']);
  });

  it('places a combined size between its two halves', () => {
    expect(sorted(['L|XL', 'S|M', 'M', 'L', 'S', 'XS/S'])).toEqual(['XS/S', 'S', 'S|M', 'M', 'L', 'L|XL']);
  });

  it('orders shoe sizes with decimal commas, points and thirds', () => {
    expect(sorted(['46.5', '42 2|3', '36,5', '37 1/3', '36', '42'])).toEqual(['36', '36,5', '37 1/3', '42', '42 2|3', '46.5']);
  });

  it('orders the shoe sizes of a real product', () => {
    expect(sorted(['35', '34,5', '31,5', '33', '33,5', '28,5', '32,5', '30', '27'])).toEqual([
      '27',
      '28,5',
      '30',
      '31,5',
      '32,5',
      '33',
      '33,5',
      '34,5',
      '35',
    ]);
  });

  it('orders ranges by their lower end, then their upper end', () => {
    expect(sorted(['43-46', '35-38', '39-42', '39-41'])).toEqual(['35-38', '39-41', '39-42', '43-46']);
  });

  it('reads a value with a unit by its number', () => {
    expect(sorted(['300 cm', '260 cm', '280 cm'])).toEqual(['260 cm', '280 cm', '300 cm']);
    expect(sorted(['12 oz', '10oz'])).toEqual(['10oz', '12 oz']);
  });

  it('puts children’s heights before adult letter sizes', () => {
    expect(sorted(['XL', '164', '134', '2XL', '146'])).toEqual(['134', '146', '164', 'XL', '2XL']);
  });

  it('orders youth codes by the height they carry', () => {
    expect(sorted(['2XS 134-140', 'XS 146-152', 'S', 'M', 'L', 'XL', '2XL', '3XL', '3XS 122-128', 'YS 110-116', '2JS 98-104'])).toEqual([
      '2JS 98-104',
      'YS 110-116',
      '3XS 122-128',
      '2XS 134-140',
      'XS 146-152',
      'S',
      'M',
      'L',
      'XL',
      '2XL',
      '3XL',
    ]);
  });

  it('reads a leading height before a trailing letter size', () => {
    expect(sorted(['152 XS|S', '128 YS|3XS', '140 2XS|XS'])).toEqual(['128 YS|3XS', '140 2XS|XS', '152 XS|S']);
  });

  it('ignores case and surrounding whitespace', () => {
    expect(sorted([' xl', 's ', 'M'])).toEqual(['s ', 'M', ' xl']);
  });

  it('puts unknown values last, alphabetically', () => {
    expect(sorted(['Volwassenen', 'Kinderen'])).toEqual(['Kinderen', 'Volwassenen']);
    expect(sorted(['M', 'One Size', 'S'])).toEqual(['S', 'M', 'One Size']);
    expect(sorted(['W32 L34', 'W30 L34'])).toEqual(['W30 L34', 'W32 L34']);
  });

  it('returns a new array and leaves the input as it was', () => {
    const input = ['L', 'S'];
    const output = sorted(input);
    expect(output).toEqual(['S', 'L']);
    expect(input).toEqual(['L', 'S']);
    expect(output).not.toBe(input);
  });

  it('sorts items by the size the accessor reads', () => {
    const items = [
      { id: 'a', size: 'L' },
      { id: 'b', size: 'XS' },
    ];
    expect(sortBySize(items, { by: (item) => item.size }).map((item) => item.id)).toEqual(['b', 'a']);
  });
});
