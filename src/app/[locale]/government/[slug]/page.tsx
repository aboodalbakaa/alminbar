import { notFound } from 'next/navigation'
import Link from 'next/link'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import {
  getAllOfficials,
  getOfficialBySlug,
  getKpisByOfficial,
  getNewsByOfficial,
  getCorruptionByOfficial,
  calcKpiStats,
} from '@/lib/supabase/government'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const officials = await getAllOfficials()
  return officials.map(o => ({ slug: o.slug }))
}

const STATUS_LABEL_AR: Record<string, string> = {
  promised:    'وعد',
  in_progress: 'قيد التنفيذ',
  achieved:    'أُنجز ✓',
  failed:      'فشل ✗',
  abandoned:   'متروك',
  stalled:     'متعثر',
}

const STATUS_COLOR: Record<string, string> = {
  promised:    'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  achieved:    'bg-green-50 text-green-700 border-green-200',
  failed:      'bg-red-50 text-red-700 border-red-200',
  abandoned:   'bg-red-50 text-red-700 border-red-200',
  stalled:     'bg-gray-50 text-gray-600 border-gray-200',
}

const CATEGORY_AR: Record<string, string> = {
  economy: 'الاقتصاد', infrastructure: 'البنية التحتية', security: 'الأمن',
  corruption: 'الفساد', healthcare: 'الصحة', education: 'التعليم',
  services: 'الخدمات', general: 'عام',
}

const EVIDENCE_AR: Record<string, string> = {
  low: 'أدلة محدودة', medium: 'أدلة متوسطة', high: 'أدلة قوية', documented: 'موثق',
}

const EVIDENCE_COLOR: Record<string, string> = {
  low: 'text-gray-500', medium: 'text-yellow-600', high: 'text-orange-600', documented: 'text-red-600',
}

export default async function OfficialPage({
  params,
}: {
  params: { locale: string; slug: string }
}) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const isAr = locale === 'ar'

  const [official, kpis, news, corruption] = await Promise.all([
    getOfficialBySlug(params.slug),
    (async () => {
      const o = await getOfficialBySlug(params.slug)
      return o ? getKpisByOfficial(o.id) : []
    })(),
    (async () => {
      const o = await getOfficialBySlug(params.slug)
      return o ? getNewsByOfficial(o.id) : []
    })(),
    (async () => {
      const o = await getOfficialBySlug(params.slug)
      return o ? getCorruptionByOfficial(o.id) : []
    })(),
  ])

  if (!official) notFound()

  // Re-fetch to avoid the awkward double-call above — they're cached
  const allKpis = await getKpisByOfficial(official.id)
  const allNews = await getNewsByOfficial(official.id)
  const allCorruption = await getCorruptionByOfficial(official.id)
  const stats = calcKpiStats(allKpis)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10" dir={isAr ? 'rtl' : 'ltr'}>

      {/* Back */}
      <Link href={`/${locale}/government`} className="text-sm text-gold hover:underline block mb-6">
        {isAr ? '← الحكومة' : '← Government'}
      </Link>

      {/* Profile header */}
      <div className="flex items-start gap-6 mb-10 p-6 border rounded" style={{ borderColor: '#E4DCC9', background: '#FAFAF6' }}>
        {official.photo_url && (
          <img src={official.photo_url} alt={official.name_ar}
            className="w-24 h-24 rounded-full object-cover border-2 border-gold flex-shrink-0" />
        )}
        <div className={`flex-1 ${isAr ? 'text-right' : ''}`}>
          <div className="eyebrow mb-1">{isAr ? official.title_ar : official.title_en}</div>
          <h1 className={`text-navy font-bold text-2xl ${isAr ? 'font-arabic' : 'font-heading italic'}`}>
            {isAr ? official.name_ar : official.name_en}
          </h1>
          {official.ministry_ar && (
            <div className={`text-navy/60 mt-1 ${isAr ? 'font-arabic' : ''}`}>
              {isAr ? official.ministry_ar : official.ministry_en}
            </div>
          )}
          {official.party_ar && (
            <div className={`text-sm text-navy/50 mt-1 ${isAr ? 'font-arabic' : ''}`}>
              {isAr ? official.party_ar : official.party_en}
            </div>
          )}
          {/* Social links */}
          <div className={`flex gap-3 mt-3 ${isAr ? 'flex-row-reverse' : ''}`}>
            {official.twitter_handle && (
              <a href={`https://twitter.com/${official.twitter_handle}`} target="_blank" rel="noopener noreferrer"
                className="text-xs text-gold hover:underline">Twitter/X</a>
            )}
            {official.facebook_url && (
              <a href={official.facebook_url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-gold hover:underline">Facebook</a>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {(isAr ? official.bio_ar : official.bio_en) && (
        <section className="mb-10">
          <h2 className={`section-heading mb-3 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'السيرة' : 'Biography'}
          </h2>
          <p className={`text-navy/70 leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? official.bio_ar : official.bio_en}
          </p>
        </section>
      )}

      {/* KPI summary */}
      <section className="mb-10">
        <h2 className={`section-heading mb-4 ${isAr ? 'font-arabic' : ''}`}>
          {isAr ? 'الوعود والالتزامات' : 'Promises & Commitments'}
        </h2>

        {allKpis.length === 0 ? (
          <p className={`text-navy/40 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'لا توجد بيانات بعد.' : 'No data recorded yet.'}
          </p>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { v: stats.achieved,   l: isAr ? 'أُنجز'        : 'Achieved',  c: 'text-green-600' },
                { v: stats.inProgress, l: isAr ? 'قيد التنفيذ'  : 'In Progress',c: 'text-yellow-600'},
                { v: stats.failed,     l: isAr ? 'فشل/متروك'    : 'Failed',    c: 'text-red-600'   },
                { v: `${stats.rate}%`, l: isAr ? 'معدل الإنجاز' : 'Rate',      c: 'text-navy'      },
              ].map(s => (
                <div key={s.l} className="text-center border-b-2 pb-2" style={{ borderColor: '#E4DCC9' }}>
                  <div className={`text-xl font-bold ${s.c}`}>{s.v}</div>
                  <div className={`text-xs text-navy/50 ${isAr ? 'font-arabic' : ''}`}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-navy/10 mb-6 overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${stats.rate}%` }} />
            </div>

            {/* KPI list */}
            <div className="space-y-3">
              {allKpis.map(kpi => (
                <div key={kpi.id}
                  className={`border rounded p-4 ${STATUS_COLOR[kpi.status]}`}>
                  <div className={`flex items-start justify-between gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-1">
                      <div className={`font-medium ${isAr ? 'font-arabic' : ''}`}>
                        {isAr ? kpi.title_ar : kpi.title_en}
                      </div>
                      {(isAr ? kpi.description_ar : kpi.description_en) && (
                        <div className={`text-sm mt-1 opacity-80 ${isAr ? 'font-arabic' : ''}`}>
                          {isAr ? kpi.description_ar : kpi.description_en}
                        </div>
                      )}
                      <div className={`flex gap-3 mt-2 text-xs opacity-70 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
                        <span>{isAr ? CATEGORY_AR[kpi.category] : kpi.category}</span>
                        {kpi.date_promised && (
                          <span>{isAr ? 'وُعد:' : 'Promised:'} {new Date(kpi.date_promised).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', { year: 'numeric', month: 'short' })}</span>
                        )}
                        {kpi.deadline && (
                          <span>{isAr ? 'الموعد:' : 'Deadline:'} {new Date(kpi.deadline).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', { year: 'numeric', month: 'short' })}</span>
                        )}
                        {kpi.source_url && (
                          <a href={kpi.source_url} target="_blank" rel="noopener noreferrer"
                            className="underline">{isAr ? 'المصدر' : 'source'}</a>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded border flex-shrink-0 ${STATUS_COLOR[kpi.status]}`}>
                      {isAr ? STATUS_LABEL_AR[kpi.status] : kpi.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Corruption cases */}
      {allCorruption.length > 0 && (
        <section className="mb-10">
          <h2 className={`section-heading mb-4 text-red-700 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'قضايا الفساد المرتبطة' : 'Associated Corruption Cases'}
          </h2>
          <div className="space-y-3">
            {allCorruption.map(c => (
              <div key={c.id} className="border border-red-200 rounded p-4 bg-red-50">
                <div className={`font-medium text-red-800 ${isAr ? 'font-arabic' : ''}`}>
                  {isAr ? c.title_ar : c.title_en}
                </div>
                <div className={`text-sm text-red-700/80 mt-1 ${isAr ? 'font-arabic' : ''}`}>
                  {isAr ? c.description_ar : c.description_en}
                </div>
                <div className={`flex gap-3 mt-2 text-xs text-red-600/70 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
                  {c.amount_usd && (
                    <span>${c.amount_usd.toLocaleString()}</span>
                  )}
                  <span className={EVIDENCE_COLOR[c.evidence_level]}>
                    {isAr ? EVIDENCE_AR[c.evidence_level] : c.evidence_level}
                  </span>
                  <span>{isAr ? 'الحالة:' : 'Status:'} {c.status}</span>
                  {c.source_urls.slice(0, 2).map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="underline">
                      {isAr ? `مصدر ${i + 1}` : `source ${i + 1}`}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Latest news about this official */}
      {allNews.length > 0 && (
        <section>
          <h2 className={`section-heading mb-4 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'آخر الأخبار' : 'Latest News'}
          </h2>
          <div className="divide-y" style={{ borderColor: '#E4DCC9' }}>
            {allNews.map(item => (
              <a key={item.id} href={item.source_url} target="_blank" rel="noopener noreferrer"
                className="block py-3 hover:text-gold transition-colors group">
                <div className={`font-medium text-navy group-hover:text-gold ${isAr ? 'font-arabic' : ''}`}>
                  {isAr ? item.title_ar : (item.title_en ?? item.title_ar)}
                </div>
                <div className={`text-xs text-navy/50 mt-1 flex gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span>{item.source_name}</span>
                  {item.published_at && (
                    <time>{new Date(item.published_at).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB')}</time>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
