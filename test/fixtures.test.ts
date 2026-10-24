import { expect, it } from 'vitest';
import { FIXTURES } from './fixtures';
import { expectSortsBack } from './helpers';
import { createSizeComparator } from '../src/index';

it.each(FIXTURES.map((fixture) => [fixture.name, fixture.list, fixture.locales] as const))('%s: %j', (_name, list, locales) =>
  expectSortsBack(list, { locales })
);

it('resolves a tie between number and volume to the number reading', () => {
  const compare = createSizeComparator(['1L', '2L']);
  // A volume reading would sort after every number.
  expect(compare('1L', '1.5')).toBeLessThan(0);
});
