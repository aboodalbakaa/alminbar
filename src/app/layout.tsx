import type { Metadata } from 'next'
import { Noto_Naskh_Arabic, Amiri, Cormorant_Garamond, Outfit, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
})

const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-ar-display',
  display: 'swap',
})

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['italic', 'normal'],
  variable: '--font-heading',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-body',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'المنبر | Al-Minbar',
    template: '%s | المنبر',
  },
  description:
    'منبر للتحليل السياسي العراقي — تحليل رصين ونقد بنّاء للحوكمة والسياسة الاقتصادية في العراق',
  openGraph: {
    siteName: 'المنبر | Al-Minbar',
    locale: 'ar_IQ',
    alternateLocale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${notoNaskhArabic.variable} ${amiri.variable} ${cormorantGaramond.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-clay text-ink min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  )
}
