import type { Parser } from '../parse';

/** Matches a one-size word, alone or followed by more words (`One Size Fits All`). */
export const parseOneSize: Parser = (label, vocab) =>
  vocab.oneSize.some((word) => label.folded === word || label.folded.startsWith(`${word} `)) ?
    [{ system: 'oneSize', group: 'oneSize', key: [] }]
  : [];
