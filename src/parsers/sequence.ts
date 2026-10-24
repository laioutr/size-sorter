import type { Parser } from '../parse';
import { SEQUENCE } from '../types';

/** Ring sizes and cup-only labels: one entry of the merged sequence, optionally plus ` 1/2` (spec 7.3). */
export const parseSequence: Parser = ({ folded }) => {
  const [, letters = '', half] = /^([A-Z]{1,3})( 1\/2)?$/.exec(folded) ?? [];
  const position = SEQUENCE.indexOf(letters);
  return position < 0 ? [] : [{ system: 'sequence', group: 'sequence', key: [half ? position + 0.5 : position] }];
};
