import { expect, it } from 'vitest';
import { resolveReadings } from './resolve';
import type { Reading, SizeSystem } from './types';

const r = (system: SizeSystem): Reading => ({ system, group: 'letter', key: [0] });
const systems = (chosen: (Reading | undefined)[]) => chosen.map((reading) => reading?.system);

const list = [[r('letter')], [r('letter'), r('sequence')], [r('sequence')], [r('sequence')]];

it('picks the system most labels can be read in', () => expect(resolveReadings(list)[1]?.system).toBe('sequence'));

it('lets the earlier reading win a tie', () =>
  expect(resolveReadings([[r('letter'), r('sequence')], [r('letter')], [r('sequence')]])[0]?.system).toBe('letter'));

it('gives undefined for a label without readings', () => expect(resolveReadings([[]])).toEqual([undefined]));

it('does not depend on input order', () =>
  expect(systems(resolveReadings([...list].reverse()))).toEqual(systems(resolveReadings(list)).reverse()));
