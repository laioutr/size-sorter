// Shopify's product taxonomy (MIT) lists its size values in a curated order (spec 10.5).
// The files are downloaded from a pinned commit into .cache/taxonomy/ and never committed;
// without a network connection the test is skipped.
// TAXONOMY_ACCEPT=1 rewrites taxonomy-known-differences.json. Never accept a difference that a
// normal run reported as new before fixing it or classifying it by hand.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { sortBySize } from '../src/index';
import * as locales from '../src/locales';
import { parseLabel } from '../src/parse';
import { compileVocabulary } from '../src/vocabulary';

const COMMIT = '87b84aaf79a78c117dc82c832c1ee47e46bbb930';
const cacheDir = new URL('../.cache/taxonomy/', import.meta.url);
const knownFile = new URL('taxonomy-known-differences.json', import.meta.url);

interface KnownDifference {
  values: string[];
  reason: 'shop-error' | 'out-of-scope' | 'milestone-3';
  note?: string;
}

async function load(name: string): Promise<string | undefined> {
  const file = new URL(`${name}.yml`, cacheDir);
  if (existsSync(file)) return readFileSync(file, 'utf8');
  try {
    const response = await fetch(`https://raw.githubusercontent.com/Shopify/product-taxonomy/${COMMIT}/data/${name}.yml`);
    if (!response.ok) return undefined;
    const text = await response.text();
    mkdirSync(cacheDir, { recursive: true });
    writeFileSync(file, text);
    return text;
  } catch {
    return undefined;
  }
}

/** The size attribute's values in Shopify's order, as display names. */
function sizeNames(attributes: string, values: string): string[] {
  const start = attributes.indexOf('\n  handle: size\n');
  const block = attributes.slice(start, attributes.indexOf('\n- id:', start));
  const ids = [...block.matchAll(/^ {2}- (size__\S+)$/gm)].map((match) => match[1] ?? '');
  const names = new Map(
    [...values.matchAll(/^- id: \d+\n {2}name: (.+)\n(?: {2}.+\n)*? {2}friendly_id: (\S+)\n {2}handle: \S+$/gm)].map((match) => [
      match[2] ?? '',
      (match[1] ?? '').replace(/^'(.*)'$/, (_, inner: string) => inner.replaceAll("''", "'")).replace(/^"(.*)"$/, '$1'),
    ])
  );
  return ids.map((id) => names.get(id) ?? id);
}

const [attributes, values] = await Promise.all([load('attributes'), load('values')]);

it.skipIf(attributes === undefined || values === undefined)('sorts every run of Shopify’s ordered size values back', () => {
  const names = sizeNames(attributes ?? '', values ?? '');
  expect(names).toHaveLength(974);
  expect(names.filter((name) => name.startsWith('size__'))).toEqual([]);

  // The first 590 values are in a reliable order. They mix families (letters, shoe ranges,
  // months, …), so each maximal run of values in one group is checked on its own.
  const allLocales = Object.values(locales);
  const vocab = compileVocabulary(allLocales);
  const runs: string[][] = [];
  let previous: string | undefined;
  for (const name of names.slice(0, 590)) {
    const group = parseLabel(name, vocab)[0]?.group;
    if (group === undefined) continue;
    if (group === previous) runs.at(-1)?.push(name);
    else runs.push([name]);
    previous = group;
  }

  const known: KnownDifference[] = existsSync(knownFile) ? JSON.parse(readFileSync(knownFile, 'utf8')) : [];
  const knownByKey = new Map(known.map((difference) => [JSON.stringify(difference.values), difference]));
  const results = runs
    .filter((run) => run.length >= 2)
    .map((run) => {
      const actual = sortBySize(run, { locales: allLocales });
      return { run, actual, key: JSON.stringify(run), matches: JSON.stringify(actual) === JSON.stringify(run) };
    });

  if (process.env.TAXONOMY_ACCEPT) {
    const next = results
      .filter((result) => !result.matches)
      .map(({ key, run }): KnownDifference => knownByKey.get(key) ?? { values: run, reason: 'milestone-3' });
    writeFileSync(knownFile, `[\n${next.map((difference) => JSON.stringify(difference)).join(',\n')}\n]\n`);
    // eslint-disable-next-line no-console -- the accept run reports progress
    console.info(`${results.length - next.length} / ${results.length} taxonomy runs match`);
    return;
  }

  const describe = ({ run, actual }: (typeof results)[number]) =>
    `  expected: ${JSON.stringify(run)}\n  actual:   ${JSON.stringify(actual)}`;
  expect
    .soft(
      results.filter((result) => !result.matches && !knownByKey.has(result.key)).map(describe),
      'runs that differ and are not in taxonomy-known-differences.json'
    )
    .toEqual([]);
  expect
    .soft(
      results.filter((result) => result.matches && knownByKey.has(result.key)).map(describe),
      'runs in taxonomy-known-differences.json that now match'
    )
    .toEqual([]);
});
