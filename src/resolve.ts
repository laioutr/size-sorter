import type { Reading, SizeSystem } from './types';

/**
 * Picks one reading per label (spec 5). Each system is supported by every label that can be
 * read in it, and an ambiguous label takes the reading whose system has the most support.
 * On a tie the earlier reading wins.
 */
export function resolveReadings(readings: readonly (readonly Reading[])[]): (Reading | undefined)[] {
  const support = new Map<SizeSystem, number>();
  for (const options of readings) for (const { system } of options) support.set(system, (support.get(system) ?? 0) + 1);
  const count = (reading: Reading) => support.get(reading.system) ?? 0;
  return readings.map((options) =>
    options.reduce<Reading | undefined>((best, reading) => (best === undefined || count(reading) > count(best) ? reading : best), undefined)
  );
}
