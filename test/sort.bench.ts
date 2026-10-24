import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import { FIXTURES } from './fixtures';
import { shuffled } from './helpers';
import { createSizeComparator, sortBySize } from '../src/index';
import * as locales from '../src/locales';

// Real shop lists: most sorts in a shop are short lists like these, one product at a time.
const lists: string[][] = JSON.parse(readFileSync(new URL('corpus/lists.json', import.meta.url), 'utf8')).map(
  (list: { values: string[] }) => list.values
);
const allLocales = Object.values(locales);

const labels = FIXTURES.flatMap((fixture) => fixture.list).slice(0, 25);
const long = shuffled(Array.from({ length: 40 }, () => labels).flat(), 1);

test(`sorts ${lists.length} corpus lists`, async ({ bench }) => {
  // Parsed labels are cached per vocabulary, so repeated sorts mostly measure the sort itself.
  await bench('English only', () => {
    for (const list of lists) sortBySize(list);
  }).run();
  // A new (empty) locale object gets a new vocabulary, so every pass parses its labels from scratch.
  await bench('English only, nothing cached', () => {
    const locales = [{}];
    for (const list of lists) sortBySize(list, { locales });
  }).run();
  await bench('all locales', () => {
    for (const list of lists) sortBySize(list, { locales: allLocales });
  }).run();
});

test(`sorts one list of ${long.length} labels`, async ({ bench }) => {
  await bench('sortBySize', () => {
    sortBySize(long);
  }).run();
  await bench('createSizeComparator + Array.prototype.sort', () => {
    long.slice().sort(createSizeComparator(long));
  }).run();
});
