import koCommon from '../../../../packages/locales/ko/common.json'
import enCommon from '../../../../packages/locales/en/common.json'
import thCommon from '../../../../packages/locales/th/common.json'

type Locale = 'ko' | 'en' | 'th'

const translations: Record<Locale, Record<string, string>> = {
  ko: koCommon,
  en: enCommon,
  th: thCommon,
}

let currentLocale: Locale = 'ko'

export function setLocale(locale: Locale) {
  currentLocale = locale
}

export function getLocale(): Locale {
  return currentLocale
}

export function t(key: string, locale?: Locale): string {
  const lang = locale || currentLocale
  return translations[lang]?.[key] || translations.ko[key] || key
}

export function useTranslation(locale?: Locale) {
  return {
    t: (key: string) => t(key, locale),
    locale: locale || currentLocale,
  }
}
