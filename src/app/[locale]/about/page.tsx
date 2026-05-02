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
  return { title: dict.nav.about }
}

export default async function AboutPage({
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
      <div className="max-w-3xl mx-auto">
        <div className="mb-12 pb-8 border-b border-gold/20">
          <h1
            className={`text-navy mb-2 ${isAr ? 'font-arabic text-4xl' : 'font-heading text-3xl'}`}
          >
            {dict.about.platform_title}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-14">
          <div className="md:col-span-2">
            <h2
              className={`text-gold text-xs uppercase tracking-widest mb-4 ${isAr ? 'font-arabic' : ''}`}
            >
              {dict.about.mission_title}
            </h2>
            <p
              className={`text-navy/75 leading-relaxed mb-6 ${isAr ? 'font-arabic text-lg' : 'text-base'}`}
            >
              {dict.about.platform_body}
            </p>
            <p
              className={`text-navy/65 leading-relaxed ${isAr ? 'font-arabic' : ''}`}
            >
              {dict.about.mission_body}
            </p>
          </div>

          <div className="border-s border-gold/20 ps-8">
            <h2 className="text-gold text-xs uppercase tracking-widest mb-4">
              {dict.about.editor_title}
            </h2>
            <div className="w-20 h-20 rounded-full bg-navy/10 mb-4 flex items-center justify-center">
              <span className="text-navy/30 text-2xl font-arabic">ط</span>
            </div>
            <p
              className={`text-navy font-semibold mb-2 ${isAr ? 'font-arabic' : 'font-heading'}`}
            >
              {isAr ? 'طارق الراشد' : 'Tariq Al-Rashid'}
            </p>
            <p
              className={`text-navy/60 text-sm leading-relaxed ${isAr ? 'font-arabic' : ''}`}
            >
              {dict.about.tariq_bio}
            </p>
          </div>
        </div>

        <div className="bg-navy/5 border border-navy/10 p-8">
          <p
            className={`text-navy/70 text-lg leading-relaxed italic ${isAr ? 'font-arabic' : 'font-heading'}`}
          >
            {isAr
              ? '"نقد البنية لا يعني مهاجمة أصحابها. العراق يحتاج إلى من يرى المشكلة بوضوح قبل أن يدّعي معرفة الحل."'
              : '"Critiquing the structure does not mean attacking those within it. Iraq needs people who see the problem clearly before claiming to know the solution."'}
          </p>
          <p className="text-gold text-sm mt-4">
            — {isAr ? 'طارق الراشد' : 'Tariq Al-Rashid'}
          </p>
        </div>
      </div>
    </div>
  )
}
