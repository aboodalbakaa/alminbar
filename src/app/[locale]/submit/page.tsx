import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { getDictionary } from '@/lib/dictionary'

export async function generateMetadata({
  params,
}: {
  params: { locale: string }
}): Promise<Metadata> {
  if (!isValidLocale(params.locale)) return {}
  const dict = await getDictionary(params.locale as Locale)
  return { title: dict.nav.submit }
}

export default async function SubmitPage({
  params,
}: {
  params: { locale: string }
}) {
  if (!isValidLocale(params.locale)) notFound()

  const locale = params.locale as Locale
  const dict = await getDictionary(locale)
  const isAr = locale === 'ar'

  return (
    <div className="py-14 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12 pb-8 border-b border-gold/20">
          <h1
            className={`text-navy mb-2 ${isAr ? 'font-arabic text-4xl' : 'font-heading text-3xl'}`}
          >
            {dict.submit.title}
          </h1>
          <p
            className={`text-gold ${isAr ? 'font-arabic' : 'font-heading italic'}`}
          >
            {dict.submit.subtitle}
          </p>
        </div>

        <p
          className={`text-navy/70 leading-relaxed mb-10 ${isAr ? 'font-arabic text-lg' : 'text-base'}`}
        >
          {dict.submit.body}
        </p>

        <div className="mb-10">
          <h2
            className={`text-gold text-xs uppercase tracking-widest mb-5 ${isAr ? 'font-arabic' : ''}`}
          >
            {dict.submit.guidelines_title}
          </h2>
          <ul className="space-y-3">
            {dict.submit.guidelines.map((guideline, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-gold mt-1 flex-shrink-0">◆</span>
                <span
                  className={`text-navy/70 leading-relaxed ${isAr ? 'font-arabic' : 'text-sm'}`}
                >
                  {guideline}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-navy p-8">
          <p className="text-gold/80 text-xs uppercase tracking-widest mb-3">
            {dict.submit.contact_label}
          </p>
          <a
            href="mailto:editor@alminbar.com"
            className="text-white hover:text-gold text-lg transition-colors duration-200"
          >
            editor@alminbar.com
          </a>
        </div>
      </div>
    </div>
  )
}
