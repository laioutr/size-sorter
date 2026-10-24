import { LENGTH_UNITS } from './numeric';
import type { Parser } from '../parse';
import type { Reading } from '../types';
import { NUMBER_SOURCE, parseNumber } from '../normalize';

const OUNCE = 28.3495;
const FLUID_OUNCE = 29.5735;

/** Unit → factor to ml (volumes) or g (weights). */
const VOLUMES: Readonly<Record<string, number>> = { ml: 1, cl: 10, dl: 100, l: 1000 };
const WEIGHTS: Readonly<Record<string, number>> = { mg: 0.001, g: 1, kg: 1000, lb: 453.592, lbs: 453.592 };

/** The first quantity with a unit anywhere in the label, optionally a multipack: `250g Dose`, `2 x 12 kg`. */
const QUANTITY = new RegExp(
  String.raw`(?<![\d.,/])(?:(\d+)\s*[x×]\s*)?(${NUMBER_SOURCE})\s*(fl\.?\s*oz|mg|kg|g|lbs|lb|oz|ml|cl|dl|l)(?![\p{L}\d])`,
  'iu'
);
/** Two or three sides with an optional length unit: `40x38x19 cm`, `90 × 200`. */
const DIMENSIONS = new RegExp(
  String.raw`^(${NUMBER_SOURCE})\s*[x×]\s*(${NUMBER_SOURCE})(?:\s*[x×]\s*(${NUMBER_SOURCE}))?\s*(mm|cm|m|in|")?$`,
  'i'
);

const reading = (system: 'volume' | 'weight', value: number): Reading => ({ system, group: system, key: [value] });

/** Volumes, weights, multipacks and dimensions (spec 7.5). */
export const parseQuantity: Parser = ({ text }) => {
  const quantity = QUANTITY.exec(text);
  if (quantity) {
    const [, count = '1', value = '', unit = ''] = quantity;
    const total = Number(count) * (parseNumber(value) ?? 0);
    const name = unit.toLowerCase();
    if (name.startsWith('fl')) return [reading('volume', total * FLUID_OUNCE)];
    // A bare `oz` is a weight or, for liquids, a volume.
    if (name === 'oz') return [reading('weight', total * OUNCE), reading('volume', total * FLUID_OUNCE)];
    return [
      Object.hasOwn(VOLUMES, name) ? reading('volume', total * (VOLUMES[name] ?? 0)) : reading('weight', total * (WEIGHTS[name] ?? 0)),
    ];
  }
  const sides = DIMENSIONS.exec(text);
  if (!sides) return [];
  const factor = LENGTH_UNITS[sides[4]?.toLowerCase() ?? 'cm'] ?? 1;
  const key = sides
    .slice(1, 4)
    .filter((side) => side !== undefined)
    .map((side) => (parseNumber(side) ?? 0) * factor);
  return [{ system: 'dimensions', group: 'dimensions', key }];
};
