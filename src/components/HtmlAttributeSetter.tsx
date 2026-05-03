'use client'
import { useEffect } from 'react'

export default function HtmlAttributeSetter({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.setAttribute('lang', locale)
    document.documentElement.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr')
  }, [locale])
  return null
}
