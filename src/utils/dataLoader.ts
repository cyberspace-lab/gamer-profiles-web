import type { Locale } from '~/i18n';
import czBartleTypes from '~/assets/data/bartleTypes.json';

// Dynamically import English data when it exists
// For now, we'll fall back to Czech if English doesn't exist
export function getBartleTypes(locale: Locale) {
  if (locale === 'en') {
    try {
      // Try to import English version
      // @ts-ignore - English file may not exist yet
      return import('~/assets/data/bartleTypes.en.json').then(module => module.default);
    } catch (e) {
      console.warn('English bartleTypes not found, falling back to Czech');
      return czBartleTypes;
    }
  }
  return czBartleTypes;
}
