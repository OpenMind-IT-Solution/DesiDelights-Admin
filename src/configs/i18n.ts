export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'fr'], //, 'ar'
  // ar: 'rtl'
  langDirection: {
    en: 'ltr',
    fr: 'ltr'
  }
} as const

export type Locale = (typeof i18n)['locales'][number]
