// Real size lists from Shopify stores, each in the shop's own order (spec 10.4).
// CORPUS_ACCEPT=1 rewrites known-differences.json. Never accept a difference that a normal run
// reported as new before fixing it or classifying it by hand.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { sortBySize } from '../src/index';
import * as locales from '../src/locales';

interface CorpusList {
  industries: string[];
  markets: string[];
  values: string[];
  descending?: true;
}

type Reason = 'shop-error' | 'out-of-scope' | 'milestone-2' | 'milestone-3';

interface KnownDifference {
  values: string[];
  reason: Reason;
  note?: string;
}

const listsFile = new URL('corpus/lists.json', import.meta.url);
const knownFile = new URL('corpus/known-differences.json', import.meta.url);

const lists: CorpusList[] = JSON.parse(readFileSync(listsFile, 'utf8'));
const known: KnownDifference[] = existsSync(knownFile) ? JSON.parse(readFileSync(knownFile, 'utf8')) : [];
const knownByKey = new Map(known.map((difference) => [JSON.stringify(difference.values), difference]));

const results = lists.map((list) => {
  const actual = sortBySize(list.values, { locales: Object.values(locales), descending: list.descending === true });
  const key = JSON.stringify(list.values);
  return { key, list, actual, matches: JSON.stringify(actual) === key };
});

const describe = ({ list, actual }: (typeof results)[number]) =>
  `${list.industries.join(',')} ${list.markets.join(',')}${list.descending ? ' (descending)' : ''}\n` +
  `  expected: ${JSON.stringify(list.values)}\n  actual:   ${JSON.stringify(actual)}`;

if (process.env.CORPUS_ACCEPT) {
  it('rewrites the known differences', () => {
    const next = results
      .filter((result) => !result.matches)
      .map(({ key, list }): KnownDifference => knownByKey.get(key) ?? { values: list.values, reason: 'milestone-2' });
    writeFileSync(knownFile, `[\n${next.map((difference) => JSON.stringify(difference)).join(',\n')}\n]\n`);
    // eslint-disable-next-line no-console -- the accept run reports progress
    console.info(`${results.length - next.length} / ${results.length} corpus lists match`);
  });
} else {
  it('sorts every corpus list in the shop’s order', () => {
    const differingNotKnown = results.filter((result) => !result.matches && !knownByKey.has(result.key));
    const knownButMatching = results.filter((result) => result.matches && knownByKey.has(result.key));
    expect.soft(differingNotKnown.map(describe), 'lists that differ and are not in known-differences.json').toEqual([]);
    expect.soft(knownButMatching.map(describe), 'lists in known-differences.json that now match').toEqual([]);
  });
}
