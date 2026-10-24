import * as fc from 'fast-check';
import { expect, it } from 'vitest';
import { FIXTURES } from './fixtures';
import { createSizeComparator, sortBySize } from '../src/index';
import { parseLabel } from '../src/parse';
import { compileVocabulary } from '../src/vocabulary';

const known = fc.constantFrom(...new Set(FIXTURES.flatMap((fixture) => fixture.list)));
const mutated = known.chain((label) => fc.constantFrom(label.toLowerCase(), ` ${label} `, `Size ${label}`, label.replace(' 1/2', '½')));
const label = fc.oneof(known, mutated, fc.string(), fc.string({ unit: 'grapheme', maxLength: 30 }));
const list = fc.array(label, { maxLength: 40 });
const runs = { numRuns: 500 };

const vocab = compileVocabulary([]);
const recognised = (value: string) => parseLabel(value, vocab).length > 0;

it('is antisymmetric', () =>
  fc.assert(
    fc.property(list, (values) => {
      const compare = createSizeComparator(values);
      return values.every((a) => values.every((b) => Math.sign(compare(a, b)) + Math.sign(compare(b, a)) === 0));
    }),
    runs
  ));

it('is transitive', () =>
  fc.assert(
    fc.property(fc.array(label, { maxLength: 12 }), (values) => {
      const compare = createSizeComparator(values);
      return values.every((a) =>
        values.every((b) => values.every((c) => !(compare(a, b) <= 0 && compare(b, c) <= 0) || compare(a, c) <= 0))
      );
    }),
    runs
  ));

it('does not depend on input order', () =>
  fc.assert(
    fc.property(
      list.chain((values) =>
        fc.tuple(fc.constant(values), fc.shuffledSubarray(values, { minLength: values.length, maxLength: values.length }))
      ),
      ([a, b]) => {
        const compare = createSizeComparator(a);
        const sortedA = sortBySize(a);
        const sortedB = sortBySize(b);
        return sortedA.every((value, index) => compare(value, sortedB[index] ?? '') === 0);
      }
    ),
    runs
  ));

it('is idempotent', () =>
  fc.assert(
    fc.property(list, (values) => {
      expect(sortBySize(sortBySize(values))).toEqual(sortBySize(values));
    }),
    runs
  ));

it('returns a permutation of its input', () => {
  fc.assert(
    fc.property(list, (values) => {
      expect([...sortBySize(values)].sort()).toEqual([...values].sort());
    }),
    runs
  );
  expect(() => sortBySize(['X'.repeat(10_000), '👍🏽', '', 'M'])).not.toThrow();
  expect(() => createSizeComparator(['X'.repeat(10_000), '👍🏽', '', 'M'])('👍🏽', 'X'.repeat(10_000))).not.toThrow();
});

it('reverses recognised values and keeps unknown values last when descending', () =>
  fc.assert(
    fc.property(list, (values) => {
      const compare = createSizeComparator(values);
      const ascending = sortBySize(values);
      const descending = sortBySize(values, { descending: true });
      const reversed = ascending.filter(recognised).reverse();
      const known = descending.filter(recognised);
      expect(known).toHaveLength(reversed.length);
      expect(known.every((value, index) => compare(value, reversed[index] ?? '') === 0)).toBe(true);
      expect(descending.filter((value) => !recognised(value))).toEqual(ascending.filter((value) => !recognised(value)));
      expect(descending.slice(0, known.length)).toEqual(known);
    }),
    runs
  ));
