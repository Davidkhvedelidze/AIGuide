import type { Locale } from '@/data/types';

const ROMAN: [number, string][] = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];

function roman(n: number): string {
  let out = '';
  for (const [value, symbol] of ROMAN) {
    while (n >= value) {
      out += symbol;
      n -= value;
    }
  }
  return out;
}

/**
 * `Place.period` is stored in English ("4th century", "1995–2004"). Georgian writes
 * centuries with Roman numerals, so the common shapes are converted for display and
 * anything else is shown unchanged.
 */
export function localizePeriod(period: string, locale: Locale): string {
  if (locale !== 'ka') return period;
  return period
    .replace(/(\d{1,2})(?:st|nd|rd|th)[\s-]century legend/gi, (_, n: string) => `${roman(Number(n))} საუკუნის ლეგენდა`)
    .replace(/(\d{1,2})(?:st|nd|rd|th)[\s-]century/gi, (_, n: string) => `${roman(Number(n))} საუკუნე`);
}
