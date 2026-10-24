import { test } from 'vitest';
import { FIXTURES } from './fixtures';
import { shuffled } from './helpers';
import { sortBySize } from '../src/index';

const labels = FIXTURES.flatMap((fixture) => fixture.list).slice(0, 25);
const list = shuffled(Array.from({ length: 40 }, () => labels).flat(), 1);

test(`sorts ${list.length} labels`, async ({ bench }) => {
  await bench('sortBySize', () => {
    sortBySize(list);
  }).run();
});
