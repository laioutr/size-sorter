# Contributing

## Setup

```sh
pnpm install
pnpm check   # lint, formatting, types, tests, build, package checks and size budgets
```

## Tests

| Command                                         | What it does                                                                |
| ----------------------------------------------- | --------------------------------------------------------------------------- |
| `pnpm test`                                     | every test, including the corpus and Shopify taxonomy checks                |
| `pnpm test:watch`                               | the same, in watch mode                                                     |
| `pnpm test:taxonomy`                            | only the Shopify taxonomy check (downloads about 32 MB once into `.cache/`) |
| `pnpm bench`                                    | benchmarks; they report numbers and never fail                              |
| `CORPUS_ACCEPT=1 pnpm test test/corpus.test.ts` | rewrites `test/corpus/known-differences.json`                               |
| `TAXONOMY_ACCEPT=1 pnpm test:taxonomy`          | rewrites `test/taxonomy-known-differences.json`                             |

**The corpus test** sorts 1,307 real size lists from Shopify stores and compares each with the shop's own order. Lists that may differ are listed in `test/corpus/known-differences.json`, each with a reason:

- `shop-error`: the shop's order contradicts a format this library defines, such as `S M L XL XS`
- `out-of-scope`: no format covers the labels, such as product names or hat codes

Lists from shops that sort largest first carry `"descending": true` in `test/corpus/lists.json`.

**Never run an accept command to silence a difference you haven't looked at.** When a normal run reports a list that newly differs, either fix the parser or classify the list by hand first. The accept run then only drops lists that now match. The taxonomy check works the same way.

## Adding a locale

1. Copy `src/locales/de.ts` to a new file named after the language code, such as `src/locales/es.ts`.
2. Fill in the fields of `SizeLocale` (all optional, natural spelling; words are folded when compiled):
   - `letters`: words for S, M, L and "extra" (`X`)
   - `variants`: short, regular and long words
   - `months` and `years`: words after a number, such as `6 meses`
   - `babyWords`: smallest first, ending with "newborn"
   - `oneSize` and `prefixes`
   - `beds` and `pillows`: smallest first; an inner array lists synonyms
3. Don't use the single letters `m`, `y` or `t` as words: `nM`, `nY` and `nT` are built-in rules.
4. Export it from `src/locales/index.ts`.
5. Add an entry to `.size-limit.json`, with a limit of the measured size plus about 10%.
6. Add unit rows to `src/locales/locales.test.ts` and fixtures to `test/fixtures.ts`.
7. Run `pnpm check`. If the corpus test reports new differences, look at each one.

## Commits and releases

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org). release-please reads them, keeps a release PR with the next version and `CHANGELOG.md`, and publishes when that PR is merged.

**The sort order is the contract.** After 1.0:

- Recognising a new format only moves values that used to sort as unknown, so it is a `feat` (minor).
- Changing the order of values that were already recognised is a breaking change: use `feat!:` or a `BREAKING CHANGE:` footer.
