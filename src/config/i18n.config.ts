import { createI18n } from 'vue-i18n'
import it from '@/locales/it.json'
import en from '@/locales/en.json'

/**
 * Internationalization configuration
 */
export const i18n = createI18n({
  legacy: false,
  locale: 'it',
  fallbackLocale: 'en',
  globalInjection: true,
  messages: { it, en },
})

export type I18nInstance = typeof i18n
