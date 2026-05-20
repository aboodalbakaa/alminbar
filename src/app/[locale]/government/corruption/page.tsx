import { notFound } from 'next/navigation'
import Link from 'next/link'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { getPublishedCorruptionCases } from '@/lib/supabase/government'

export const dynamic = 'force-dynamic'

const STATUS_AR: Record<string, string> = {
  alleged:             'مزعوم',
  under_investigation: 'قيد التحقيق',
  confirmed:           'مؤكد',
  acquitted:           'بُرِّئ',
  convicted:           'مُدان',
  dismissed:           'أُسقطت القضية',
}
const STATUS_COLOR: Record<string, string> = {
  alleged:             'bg-yellow-50 text-yellow-700 border-yellow-200',
  under_investigation: 'bg-orange-50 text-orange-700 border-orange-200',
  confirmed:           'bg-red-100 text-red-700 border-red-300',
  acquitted:           'bg-green-50 text-green-700 border-green-200',
  convicted:           'bg-red-200 text-red-800 border-red-400',
  dismissed:           'bg-gray-50 text-gray-600 border-gray-200',
}
const EVIDENCE_AR: Record<string, string> = {
  low: 'أدلة محدودة', medium: 'أدلة متوسطة',
  high: 'أدلة قوية', documented: 'موثقة',
}
const EVIDENCE_COLOR: Record<string, string> = {
  low: 'text-gray-500', medium: 'text-yellow-600',
  high: 'text-orange-600', documented: 'text-red-700',
}
const TYPE_AR: Record<string, string> = {
  financial:       'مالية',
  bribery:         'رشوة',
  embezzlement:    'اختلاس',
  nepotism:        'محسوبية',
  abuse_of_power:  'إساءة استخدام السلطة',
  other:           'أخرى',
}

export default async function CorruptionPage({
  params,
}: {
  params: { locale: string }
}) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const isAr = locale === 'ar'

  const cases = await getPublishedCorruptionCases()

  const confirmedTotal = cases
    .filter(c => c.amount_usd && ['confirmed', 'convicted'].includes(c.status))
    .reduce((sum, c) => sum + (c.amount_usd ?? 0), 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10" dir={isAr ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="border-b pb-6 mb-10" style={{ borderColor: '#E4DCC9' }}>
        <Link href={`/${locale}/government`} className="text-sm text-gold hover:underline block mb-4">
          {isAr ? '← الحكومة' : '← Government'}
        </Link>
        <p className="eyebrow mb-2">{isAr ? 'قضايا موثقة' : 'Documented Cases'}</p>
        <h1 className={`text-navy font-bold ${isAr ? 'font-arabic text-3xl' : 'font-heading text-2xl italic'}`}>
          {isAr ? 'قضايا الفساد' : 'Corruption Cases'}
        </h1>
        <p className={`mt-2 text-navy/60 text-sm ${isAr ? 'font-arabic' : ''}`}>
          {isAr
            ? 'قضايا مدعومة بمصادر. لا ندّعي الإدانة — نوثّق ما أفادت به تقارير موثوقة.'
            : 'All cases are source-backed. We do not assert guilt — we document what credible reports have established.'}
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="border-t-4 border-red-400 pt-4">
          <div className="text-2xl font-bold text-navy">{cases.length}</div>
          <div className={`text-xs text-navy/60 mt-1 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'إجمالي القضايا' : 'Total Cases'}
          </div>
        </div>
        <div className="border-t-4 border-orange-400 pt-4">
          <div className="text-2xl font-bold text-navy">
            {cases.filter(c => ['confirmed', 'convicted', 'under_investigation'].includes(c.status)).length}
          </div>
          <div className={`text-xs text-navy/60 mt-1 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'مُحققة أو مؤكدة' : 'Investigated / Confirmed'}
          </div>
        </div>
        <div className="border-t-4 border-gold pt-4">
          <div className="text-2xl font-bold text-navy">
            {confirmedTotal >= 1e9
              ? `$${(confirmedTotal / 1e9).toFixed(1)}B`
              : confirmedTotal >= 1e6
              ? `$${(confirmedTotal / 1e6).toFixed(0)}M`
              : confirmedTotal > 0
              ? `$${confirmedTotal.toLocaleString()}`
              : '—'}
          </div>
          <div className={`text-xs text-navy/60 mt-1 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'مبالغ مؤكدة (USD)' : 'Confirmed Amounts (USD)'}
          </div>
        </div>
      </div>

      {/* Cases list */}
      {cases.length === 0 ? (
        <div className={`text-center py-20 text-navy/40 ${isAr ? 'font-arabic' : ''}`}>
          {isAr ? 'جارٍ توثيق القضايا…' : 'Cases being documented…'}
        </div>
      ) : (
        <div className="space-y-6">
          {cases.map(c => {
            const off = (c as any).officials
            return (
              <article key={c.id} className="border rounded overflow-hidden" style={{ borderColor: '#E4DCC9' }}>
                <div className="p-5">
                  <div className={`flex items-start justify-between gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-1">
                      {/* Official link */}
                      {off && (
                        <Link href={`/${locale}/government/${off.slug}`}
                          className={`text-xs text-gold hover:underline block mb-1 ${isAr ? 'font-arabic' : ''}`}>
                          {isAr ? off.name_ar : off.name_en}
                        </Link>
                      )}
                      <h2 className={`font-bold text-navy text-base ${isAr ? 'font-arabic' : 'font-heading'}`}>
                        {isAr ? c.title_ar : c.title_en}
                      </h2>
                    </div>
                    {/* Status badge */}
                    <span className={`text-xs font-bold px-2 py-1 border rounded flex-shrink-0 ${STATUS_COLOR[c.status]}`}>
                      {isAr ? STATUS_AR[c.status] : c.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className={`mt-3 text-navy/70 text-sm leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
                    {isAr ? c.description_ar : c.description_en}
                  </p>

                  {/* Meta row */}
                  <div className={`flex gap-4 mt-3 text-xs text-navy/50 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
                    <span>{isAr ? TYPE_AR[c.case_type] : c.case_type.replace(/_/g, ' ')}</span>

                    {c.amount_usd && (
                      <span className="font-medium text-navy/70">
                        ${c.amount_usd.toLocaleString()}
                      </span>
                    )}

                    <span className={`font-medium ${EVIDENCE_COLOR[c.evidence_level]}`}>
                      {isAr ? EVIDENCE_AR[c.evidence_level] : `evidence: ${c.evidence_level}`}
                    </span>

                    {c.date_reported && (
                      <time>
                        {new Date(c.date_reported).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', {
                          year: 'numeric', month: 'long',
                        })}
                      </time>
                    )}
                  </div>

                  {/* Sources */}
                  {c.source_urls.length > 0 && (
                    <div className={`flex gap-2 mt-3 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-xs text-navy/40 ${isAr ? 'font-arabic' : ''}`}>
                        {isAr ? 'المصادر:' : 'Sources:'}
                      </span>
                      {c.source_urls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-gold hover:underline">
                          [{i + 1}]
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Disclaimer */}
      <div className={`mt-10 border-t pt-6 text-xs text-navy/40 ${isAr ? 'font-arabic text-right' : ''}`}
        style={{ borderColor: '#E4DCC9' }}>
        {isAr
          ? 'التوثيق لا يعني الإدانة. جميع المعلومات مستقاة من مصادر إعلامية وقانونية موثوقة. إذا كانت لديك معلومات إضافية أو تصحيح، راسلنا.'
          : 'Documentation does not equal conviction. All information is sourced from credible media and legal reports. Contact us with corrections or additional sourced evidence.'}
      </div>
    </div>
  )
}
