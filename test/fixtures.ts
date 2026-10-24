import type { SizeLocale } from '../src/types';
import { de, nl } from '../src/locales';

export interface Fixture {
  readonly name: string;
  /** Correctly ordered, with no two labels of equal size. */
  readonly list: readonly string[];
  readonly locales?: readonly SizeLocale[];
}

export const FIXTURES: readonly Fixture[] = [
  { name: 'letters', list: ['4XS', '3XS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', '10XL'] },
  { name: 'combined', list: ['XS', 'XS/S', 'S', 'S|M', 'M', 'M-L', 'L', 'L–XL', 'XL'] },
  { name: 'words', list: ['Extra Small', 'Small', 'Medium', 'Large', 'X-Large', '2X-Large', 'Extra Extra Extra Large'] },
  { name: 'de words', list: ['Klein', 'Mittel', 'Groß', 'Extra Groß'], locales: [de] },
  { name: 'nl words', list: ['Klein', 'Middel', 'Groot'], locales: [nl] },
  { name: 'plus', list: ['L', 'XL', '1X', 'XXL', '2X', '3XL', '3X'] },
  { name: 'shoes', list: ['35', '35,5', '36', '36 2/3', '37 1/3', '38', '38½', '39⅓', '40'] },
  { name: 'hats', list: ['6 7/8', '7', '7 1/8', '7 1/4', '7 3/8', '7 1/2', '7 5/8', '7 3/4', '7 7/8'] },
  { name: 'ranges', list: ['35-38', '39-41', '39-42', '43-46', '47-49'] },
  { name: 'pairs', list: ['92/98', '104/110', '110/116', '122/128'] },
  { name: 'jeans', list: ['W28 L32', 'W30 L30', 'W30 L32', 'W32 L32', 'W32 L34'] },
  { name: 'zeros', list: ['000', '00', '0', '2', '4'] },
  { name: 'heights before letters', list: ['98', '104', '116', '128', '140', '152', '164', '176', 'XS', 'S'] },
  { name: 'size + measurement', list: ['Größe XS: 30-40 cm', 'Größe S–M: 40–65 cm', 'Größe L: 65-80 cm'], locales: [de] },
  { name: 'measurement + size', list: ['45cm (XS)', '55cm (S)', '65cm (M)'] },
  { name: 'lengths', list: ['50 mm', '8 cm', '1 m', '150 cm', '2 m'] },
  { name: 'inches', list: ['24"', '26"', '27.5"', '29"'] },
  { name: 'separators', list: ['0,5', '1,5', '2,25', '1.000', '1.234,5'] },
  { name: 'fallback', list: ['10 Kapseln', '30 Kapseln', '60 Kapseln', '120 Kapseln'] },
  { name: 'fallback', list: ['20 Zoll', '24 Zoll', '26 Zoll', '28 Zoll'] },
  { name: 'fallback', list: ['650b', '700c'] },
  { name: 'prefixes', list: ['Size S', 'Size M', 'Size L'] },
  { name: 'prefixes', list: ['Gr. 38', 'Gr. 40', 'Gr. 42'], locales: [de] },
  { name: 'prefixes', list: ['EU 40', 'EU 41', 'EU 42'] },
  { name: 'prefixes', list: ['Maat 140', 'Maat 152'], locales: [nl] },
  { name: 'groups', list: ['134', '146', 'XS', 'S', 'One Size', 'Adults'] },
  { name: 'unknown last', list: ['S', 'M', 'Adults', 'Kids'] },
  // Worked examples from spec section 5.
  { name: 'UK rings', list: ['J', 'K', 'L', 'M', 'N'] },
  { name: 'letters', list: ['S', 'M', 'L', 'XL'] },
  { name: 'regular and long', list: ['R', 'L'] },
  { name: 'length words', list: ['S', 'R', 'L'] },
  { name: 'kids’ shoes from T to Y', list: ['11T', '12T', '13T', '1Y', '2Y', '3Y'] },
  {
    name: 'baby months to kids’ numbers',
    list: ['0-3 months', '3-6 months', '6-12 months', '12-18 months', '18-24 months', '2T', '3T', '4T', '5T', '6T', '7', '8', '10'],
  },
  { name: 'lengths', list: ['36', '36L', '38', '38L', '40'] },
  { name: 'volumes', list: ['500 ml', '1L', '1,5L'] },
  { name: 'girls', list: ['4', '5', '6', '6X', '7'] },
  { name: 'plus', list: ['1X', '2X', '3X', '6X'] },
  { name: 'suits', list: ['42S', '42R', '42L'] },
  { name: 'wetsuits', list: ['S', 'ST', 'MS', 'M', 'MT'] },
  { name: 'snowboards', list: ['157MW', '158', '158W'] },
  { name: 'bras', list: ['70A', '70B', '75A', '75B', '75C'] },
  { name: 'cups', list: ['A', 'B', 'C', 'D', 'DD', 'E', 'F'] },
  { name: 'kids’ shoes', list: ['10C', '11C', '12C', '13C', '13.5C', '1Y', '2Y'] },
  { name: 'kids’ shoes', list: ['13K', '1', '1.5', '2'] },
  { name: 'baby', list: ['Micro Preemie', 'Preemie', 'Newborn', '0-3M', '3-6M'] },
  { name: 'multipacks', list: ['1 x 12 kg', '2 x 12 kg'] },
  { name: 'dimensions', list: ['40x30 cm', '60x40 cm', '90x200 cm'] },
  { name: 'weights', list: ['250 g', '500 g', '1 kg', '2,5 kg'] },
  { name: 'two-system', list: ['US6/UK8', 'US7/UK9', 'US8/UK10'] },
  { name: 'review focus 5', list: ['1L', '2L'] },
];
