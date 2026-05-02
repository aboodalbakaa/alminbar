'use client'

import { usePathname, useRouter } from 'next/navigation'
import type { Locale } from '@/i18n.config'

interface Props {
  currentLocale: Locale
  label: string
}

export default function LanguageSwitcher({ currentLocale, label }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSwitch = () => {
    const targetLocale: Locale = currentLocale === 'ar' ? 'en' : 'ar'
    const newPath = pathname.replace(`/${currentLocale}`, `/${targetLocale}`)
    document.cookie = `NEXT_LOCALE=${targetLocale}; path=/; max-age=31536000; SameSite=Lax`
    router.push(newPath)
  }

  return (
    <button
      onClick={handleSwitch}
      className="border border-gold/50 text-gold hover:border-gold hover:text-gold-light px-3 py-1 text-sm tracking-wide transition-colors duration-200"
      aria-label={`Switch to ${label}`}
    >
      {label}
    </button>
  )
}
