# @laioutr/size-sorter

Sorts product size labels the way a shopper expects: `XS S M L XL`, `36 36,5 37 1/3`, `39-42 43-46`, `W30 L32 W32 L32`.

- No dependencies, ESM only, runs in browsers, Node and SSR.
- The same input gives the same output on the server and in the browser.
- Unknown values never break the sort. They go last, alphabetically.

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

## Options

| Option       | Type                  | Description                                                                                 |
| ------------ | --------------------- | ------------------------------------------------------------------------------------------- |
| `by`         | `(item: T) => string` | Returns the size label of an item. Required when the items aren't strings.                  |
| `locales`    | `SizeLocale[]`        | Languages besides English, which is always active. Earlier locales win when words conflict. |
| `groupOrder` | `SizeGroup[]`         | Groups to put first, in this order. The other groups follow in the default order.           |
| `descending` | `boolean`             | Largest first. Unknown values stay last, in ascending alphabetical order.                   |

The default group order is numbers, then letters, then one size. Numbers come first because in mixed lists they are usually children's heights (`134 146 164 XL 2XL`).

## What it recognises

- **Letter sizes:** `XS` to `10XL`, `XXL` = `2XL`, combined sizes (`S|M`, `XS/S`, `L-XL`), plus sizes (`1X`, `2X`) and words (`Extra Small`, `X-Large`, `Klein`, `Groot`).
- **Numbers:** `42`, `36,5`, `46.5`, fractions (`37 1/3`, `42 2|3`, `42⅔`, `7 1/8`), ranges (`39-42`), pairs (`110/116`, `W32 L34`) and `000 < 00 < 0`.
- **Decimal separators** are read from the shape of the number, never from a locale: `1,5` and `1.5` are 1.5, `1.000` is 1000.
- **Lengths** in `mm`, `cm`, `m`, `in` and `"`, converted to cm.
- **Heights after a size code:** `YS 110-116`, `3XS 122-128`, `Größe S–M: 40–65 cm` sort by the height.
- **Prefixes** such as `Size`, `Gr.`, `Maat` and region codes (`EU 42`) are ignored.
- **One size:** `One Size`, `OSFA`, `O/S`, `ADJ`, `Einheitsgröße`, `één maat`.
- **Anything else starting with a number** sorts by that number: `30 Kapseln`, `700c`.

Locales: English is built in. `de` and `nl` are exported from `@laioutr/size-sorter/locales`. A locale you don't import adds nothing to your bundle.

## Licence

MIT
