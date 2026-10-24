import { it } from 'vitest';
import { FIXTURES } from './fixtures';
import { expectSortsBack } from './helpers';

it.each(FIXTURES.map((fixture) => [fixture.name, fixture.list, fixture.locales] as const))('%s: %j', (_name, list, locales) =>
  expectSortsBack(list, { locales })
);
