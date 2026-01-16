import czTranslations from './locales/cz.json';
import enTranslations from './locales/en.json';

export const languages = {
  cz: 'Čeština',
  en: 'English',
};

export const defaultLang = 'cz';

export const ui = {
  cz: czTranslations,
  en: enTranslations,
} as const;

export type Locale = keyof typeof ui;

export function getLangFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as Locale;
  return defaultLang;
}

export function useTranslations(lang: Locale) {
  return function t(key: string): string {
    const keys = key.split('.');
    let value: any = ui[lang];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  }
}

export function getLocalizedPath(path: string, locale: Locale): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // If it's the default language, return path as-is
  if (locale === defaultLang) {
    return cleanPath;
  }

  // Check if path already has locale prefix
  for (const lang of Object.keys(ui)) {
    if (cleanPath.startsWith(`/${lang}/`) || cleanPath === `/${lang}`) {
      // Path already has a locale prefix, replace it
      return cleanPath.replace(`/${lang}`, `/${locale}`);
    }
  }

  // Add locale prefix
  return `/${locale}${cleanPath}`;
}

export function removeLocaleFromPath(path: string): string {
  for (const lang of Object.keys(ui)) {
    if (path.startsWith(`/${lang}/`)) {
      return path.replace(`/${lang}`, '');
    }
    if (path === `/${lang}`) {
      return '/';
    }
  }
  return path;
}
