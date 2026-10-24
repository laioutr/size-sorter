# @laioutr/size-sorter

Sorts product size labels the way a shopper expects: `XS S M L XL`, `36 36,5 37 1/3`, `0-3M 3-6M 2T`, `250 ml 1 l`, `Twin Full Queen King`.

- No dependencies, ESM only, runs in browsers, Node and SSR.
- The same input gives the same output on the server and in the browser.
- Unknown values never break the sort. They go last, alphabetically.
- About 4.9 kB min+gzip with English; each extra language adds about 0.2 kB.

## Install

```sh
pnpm add @laioutr/size-sorter
```

## Usage

```ts
import { createSizeComparator, sortBySize } from '@laioutr/size-sorter';
import { de, nl } from '@laioutr/size-sorter/locales';

sortBySize(['XL', 'S', 'One Size']); // ['S', 'XL', 'One Size']
sortBySize(variants, { by: (v) => v.size, locales: [de, nl] }); // sorts objects, returns a new array
sortBySize(items, { by, groupOrder: ['age', 'numeric'] }); // listed groups first, the rest in default order
sortBySize(perfumes, { by, descending: true }); // largest first, unknown values still last

const compare = createSizeComparator(values, { locales: [de] }); // (a: string, b: string) => number
values.slice().sort(compare);
```

`sortBySize` never changes its input and never throws. Equal sizes such as `XXL` and `2XL` keep their input order.

`createSizeComparator(values)` reads ambiguous labels the way `values` suggests (see below). A string that isn't in `values` gets its default reading.

## Options

| Option       | Type                  | Description                                                                                 |
| ------------ | --------------------- | ------------------------------------------------------------------------------------------- |
| `by`         | `(item: T) => string` | Returns the size label of an item. Required when the items aren't strings.                  |
| `locales`    | `SizeLocale[]`        | Languages besides English, which is always active. Earlier locales win when words conflict. |
| `groupOrder` | `SizeGroup[]`         | Groups to put first, in this order. The other groups follow in the default order.           |
| `descending` | `boolean`             | Largest first. Unknown values stay last, in ascending alphabetical order.                   |

## What it recognises

Every recognised label belongs to a group. Groups sort in this order by default, and unknown values come after all of them:

| Group        | Examples                                                                                       | Sorted by                           |
| ------------ | ---------------------------------------------------------------------------------------------- | ----------------------------------- |
| `age`        | `Preemie`, `Newborn`, `0-3M`, `12 months`, `2T`, `4Y`, `2-3 Jahre`, `6 mois`, `3A`             | months                              |
| `numeric`    | `42`, `36,5`, `37 1/3`, `39-42`, `110/116`, `W32 L34`, `42L`, `70B`, `13.5C`, `300 cm`, `700c` | number, then fit, cup or width      |
| `letter`     | `XS`…`10XL`, `S\|M`, `X-Large`, `1X`, `XLT`, `Regular`                                         | size, then fit                      |
| `sequence`   | ring sizes `H … Z`, `H ½`; cup-only lists `AA A B C D DD …`                                    | position in one merged sequence     |
| `bed`        | `Twin < Twin XL < Full < Queen < King < Cal King`, pillows `Standard < Queen < King`           | the language's list                 |
| `dimensions` | `40x38x19 cm`, `90 × 200`                                                                      | each side in the given order, in cm |
| `volume`     | `450 ml`, `1,5 l`, `33 cl`, `12 fl oz`, `3 x 100 ml`                                           | ml                                  |
| `weight`     | `500 g`, `2,5 kg`, `5 lb`, `10 oz`, `2 x 12 kg`                                                | g                                   |
| `oneSize`    | `One Size`, `OSFA`, `O/S`, `ADJ`, `TU`, `Einheitsgröße`                                        |                                     |

Numbers come before letters because, in lists that mix them, the numbers are usually children's heights (`134 146 164 XL 2XL`).

### Numbers

- **Decimal separators** are read from the shape of the number, never from a locale: `1,5` and `1.5` are 1.5, `0,375` is 0.375, `1.234,5` is 1234.5, and `1.000` is 1000.
- **Fractions** need a space before them: `37 1/3`, `42 2|3`, `42⅔`, hat sizes `7 1/8`.
- **Ranges and pairs** sort by their low end, then their high end: `39-42`, `110/116`, `W32 L34`.
- **Zeros:** `000 < 00 < 0`.
- **Lengths** in `mm`, `cm`, `m` (lower case), `in` and `"` are converted to cm.
- **Heights after a size code** sort by the height: `YS 110-116`, `2JS 98-104`, `Größe S–M: 40–65 cm`. A leading measurement wins too: `55cm (S)`.
- **Fit, length and width** come after the number: `12P < 12 < 12R < 12L`, `10 < 10 2E < 10 4E`, `32 Short < 32 < 32 Long`.
- **Bra sizes** are a band (28–48 or 60–130) and a cup: `70A < 70B < 75A`.
- **Kids' shoes:** `10C < 13.5C < 1Y < 2Y`, and `13K < 1`.
- **Anything else starting with a number** sorts by that number, then by the rest: `30 Kapseln`, `700c`, `20 Zoll`.

### Letters

- `M` is 0, `S` −1, `XS` −2, `L` 1, `XL` 2, and so on up to `10XS` and `10XL`. `XXL` and `2XL` are equal.
- **Plus sizes** sort just after their letter size: `XL < 1X < XXL < 2X`.
- **Combined sizes** sort between their halves: `S|M`, `XS/S`, `L-XL`, `Small/Medium`. This works for beds too: `Full/Queen`.
- **Words** are read in every active language: `Extra Small`, `X-Large`, `2X-Large`, `XSmall`, `Sm`, `Lg`, `extra groß`, `très grand`.
- **Fit after a letter size:** `S < ST`, `MS < M < MT`, `XLT`, `2XB`, `L Tall`.
- **Length words** alone (`Short`, `Regular`, `Standard`, `Long`, `S`, `R`, `L`, `T`, `P`) sort short, regular, long.

### Labels with more than one size

A label with two sizes sorts by the first one: `US6/UK8`, `56/XXL`, `XS (6-8)`, `Small - 42cm - (Riders 5'6" - 5'10")`, `M - Size 8`. Prefixes such as `Size`, `Gr.`, `Größe`, `Maat`, `Taille`, `Men's` and region codes (`EU 42`, `UK 8`) are ignored.

## How ambiguous lists are resolved

Some labels can be read in more than one way. `L` is large, long or a ring size; `2T` is a toddler age or a kids' shoe; `10 oz` is a weight or a volume. The sorter collects every possible reading of every label in the list, then counts how many labels each reading system covers. An ambiguous label takes the reading whose system covers the most labels. On a tie, the default reading wins.

| List                                 | Counts                          | Result                       |
| ------------------------------------ | ------------------------------- | ---------------------------- |
| `J K L M N` (UK rings)               | ring sequence 5, letter sizes 2 | rings, in alphabetical order |
| `R L`                                | length words 2, ring sequence 2 | tie, so length words: R < L  |
| `11T 12T 13T 1Y 2Y 3Y` (kids' shoes) | kids' shoes 6, ages 3           | kids' shoes: 11T < … < 3Y    |

Because the whole list votes, one odd value can't flip the reading of the others, and the result doesn't depend on the order of the input.

## Known limitations

1. **Close counts can pick the wrong system** in lists with very few values.
2. **`2.375 l` is read as 2,375 l.** Exactly three digits after a single separator means thousands, because `1.000 ml` is far more common than a decimal with three places.
3. **`createSizeComparator` uses default readings** for strings that weren't in `values`.
4. **Equal sizes don't merge.** `XXL` and `2XL`, or `1Y` and `1`, keep their input order.
5. **Bed names from two languages in one list** sort by language first.
6. **US shoe widths `A`, `B` and `D`** aren't interpreted, because they mean different things for women and men. They sort as unknown suffixes, after the known widths.
7. **German body-shape sizes** (`24 25 26`, `98 102 106`) sort by number.
8. **Not supported**, so these sort as unknown or by their leading number: Japanese `LL 3L` (clashes with litres), Portuguese and Spanish `PP P M G GG`, hat codes such as `714`, shade codes, mattress firmness `H2`, bundles, and converting between size systems.

## Locales

English is built in and always active. German, Dutch, French, Italian and Polish are separate exports, so a language you don't import adds nothing to your bundle:

```ts
import { de, fr, it, nl, pl } from '@laioutr/size-sorter/locales';

sortBySize(values, { locales: [de, nl] });
```

A locale is plain data, so you can write your own. Every field is optional, and words are written in their natural spelling:

```ts
import type { SizeLocale } from '@laioutr/size-sorter';

const es: SizeLocale = {
  letters: { S: ['pequeño'], M: ['mediano'], L: ['grande'], X: ['extra'] }, // X lists the "extra" words
  variants: { short: ['corto'], regular: ['normal'], long: ['largo'] },
  months: ['mes', 'meses'],
  years: ['año', 'años'],
  babyWords: ['prematuro', 'recién nacido'], // smallest first, ending with "newborn"
  oneSize: ['talla única'],
  prefixes: ['talla'],
  beds: ['individual', 'matrimonio'], // smallest first; an inner array lists synonyms
  pillows: [],
};
```

## Performance

Parsed labels are cached per combination of locales, because a shop sorts the same labels for every product. Sorting the variant sizes of 1,307 real products takes about 1.5 ms once the labels are cached, and about 5 ms when every label is new.

## Licence

MIT
