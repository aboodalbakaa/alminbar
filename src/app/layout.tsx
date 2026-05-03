import type { Metadata } from 'next'
import { Noto_Naskh_Arabic, Playfair_Display, Inter } from 'next/font/google'
import './globals.css'

const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
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
      className={`${notoNaskhArabic.variable} ${playfairDisplay.variable} ${inter.variable}`}
    >
      <body className="bg-cream text-navy min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  )
}
