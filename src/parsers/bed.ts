import type { Parser } from '../parse';
import type { Reading } from '../types';

/** The value of the longest word that is the whole label or its first word(s): `Twin XL` is not `Twin`. */
function longest<V>(words: ReadonlyMap<string, V>, folded: string): V | undefined {
  let found: V | undefined;
  let length = 0;
  for (const [word, value] of words) {
    if (word.length > length && folded.startsWith(word) && (folded.length === word.length || folded[word.length] === ' ')) {
      found = value;
      length = word.length;
    }
  }
  return found;
}

/** Bed and pillow names from the locales (spec 7.6). */
export const parseBed: Parser = ({ folded }, vocab) => {
  const readings: Reading[] = [];
  const bed = longest(vocab.beds, folded);
  if (bed) readings.push({ system: 'bed', group: 'bed', key: bed });
  const pillow = longest(vocab.pillows, folded);
  if (pillow !== undefined) readings.push({ system: 'pillow', group: 'bed', key: [pillow] });
  return readings;
};
