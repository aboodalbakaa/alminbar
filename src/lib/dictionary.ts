import 'server-only'
import type { Locale } from '@/i18n.config'

const dictionaries = {
  ar: () =>
    import('../../public/locales/ar/common.json').then(m => m.default),
  en: () =>
    import('../../public/locales/en/common.json').then(m => m.default),
}

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)['ar']>>

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]()
}
