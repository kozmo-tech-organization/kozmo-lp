import pt from './locales/pt.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

export type T = typeof pt;

const translations: Record<string, T> = { pt, en, es, fr };

export function getT(lang: string): T {
  return translations[lang] ?? translations['pt']!;
}

export const defaultLang = 'pt' as const;
export const supportedLangs = ['pt', 'en', 'es', 'fr'] as const;
export type Lang = (typeof supportedLangs)[number];
