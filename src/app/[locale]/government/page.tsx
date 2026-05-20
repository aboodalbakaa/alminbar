import { notFound } from 'next/navigation'
import Link from 'next/link'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import {
  getAllOfficials,
  getAllKpis,
  getRecentNews,
  getCountryMetrics,
  calcKpiStats,
} from '@/lib/supabase/government'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  promised:    'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  achieved:    'bg-green-100 text-green-800',
  failed:      'bg-red-100 text-red-800',
  abandoned:   'bg-red-100 text-red-800',
  stalled:     'bg-gray-100 text-gray-600',
}

const STATUS_AR: Record<string, string> = {
  promised:    'وعد',
  in_progress: 'قيد التنفيذ',
  achieved:    'أُنجز',
  failed:      'فشل',
  abandoned:   'متروك',
  stalled:     'متعثر',
}

const TREND_ICON: Record<string, string> = {
  up: '↑', down: '↓', stable: '→',
}

const TREND_COLOR: Record<string, string> = {
  up: 'text-green-600', down: 'text-red-600', stable: 'text-gray-500',
}

function formatValue(value: number | null, unit: string): string {
  if (value === null) return '—'
  if (unit === 'USD') {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
    if (value >= 1e9)  return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6)  return `$${(value / 1e6).toFixed(1)}M`
    return `$${value.toLocaleString()}`
  }
  if (unit === '%') return `${value.toFixed(1)}%`
  return `${value.toLocaleString()} ${unit}`.trim()
}

export default async function GovernmentPage({
  params,
}: {
  params: { locale: string }
}) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const isAr = locale === 'ar'

  const [officials, kpis, news, metrics] = await Promise.all([
    getAllOfficials(),
    getAllKpis(),
    getRecentNews(12),
    getCountryMetrics(),
  ])

  const stats = calcKpiStats(kpis)
  const economyMetrics = metrics.filter(m => m.category === 'economy').slice(0, 6)
  const governanceMetrics = metrics.filter(m => m.category === 'governance')
  const socialMetrics = metrics.filter(m => m.category === 'social').slice(0, 4)
  const pm = officials.find(o => o.role_type === 'prime_minister')
  const ministers = officials.filter(o => o.role_type === 'minister' || o.role_type === 'deputy_pm')

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-14" dir={isAr ? 'rtl' : 'ltr'}>

      {/* Page header */}
      <div className="border-b pb-6" style={{ borderColor: '#E4DCC9' }}>
        <p className="eyebrow mb-2">{isAr ? 'رقابة وتقييم' : 'Oversight & Accountability'}</p>
        <h1 className={`text-navy font-bold ${isAr ? 'font-arabic text-3xl' : 'font-heading text-2xl italic'}`}>
          {isAr ? 'الحكومة العراقية — متابعة الأداء' : 'Iraqi Government — Performance Tracker'}
        </h1>
        <p className={`mt-2 text-navy/60 ${isAr ? 'font-arabic' : ''}`}>
          {isAr
            ? 'رصد دوري لأداء الحكومة والبرلمان — وعود ونتائج وأرقام دولية'
            : 'Periodic tracking of government and parliament performance — promises, outcomes, and international rankings'}
        </p>
        <div className={`flex gap-4 mt-4 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
          <Link href={`/${locale}/government/parliament`} className="text-sm text-gold hover:underline">
            {isAr ? 'مجلس النواب ←' : 'Parliament →'}
          </Link>
          <Link href={`/${locale}/government/corruption`} className="text-sm text-gold hover:underline">
            {isAr ? 'قضايا الفساد ←' : 'Corruption Cases →'}
          </Link>
          <Link href={`/${locale}/government/metrics`} className="text-sm text-gold hover:underline">
            {isAr ? 'مؤشرات العراق الدولية ←' : 'Iraq Global Rankings →'}
          </Link>
        </div>
      </div>

      {/* KPI summary bar */}
      <section>
        <h2 className={`section-heading mb-6 ${isAr ? 'font-arabic' : ''}`}>
          {isAr ? 'إجمالي الوعود والوقائع' : 'Promises vs. Reality'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: isAr ? 'إجمالي الوعود' : 'Total Promises', value: stats.total,      color: 'border-navy/20'   },
            { label: isAr ? 'أُنجز'          : 'Achieved',       value: stats.achieved,   color: 'border-green-400' },
            { label: isAr ? 'قيد التنفيذ'    : 'In Progress',    value: stats.inProgress, color: 'border-yellow-400'},
            { label: isAr ? 'فشل / متروك'   : 'Failed/Dropped', value: stats.failed,     color: 'border-red-400'   },
            { label: isAr ? 'معدل الإنجاز'   : 'Delivery Rate',  value: `${stats.rate}%`, color: 'border-gold'      },
          ].map(s => (
            <div key={s.label} className={`border-t-4 pt-4 ${s.color}`}>
              <div className={`text-2xl font-bold text-navy ${isAr ? 'font-arabic' : 'font-heading'}`}>
                {s.value}
              </div>
              <div className={`text-xs text-navy/60 mt-1 ${isAr ? 'font-arabic' : ''}`}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Economy metrics strip */}
      {economyMetrics.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`section-heading ${isAr ? 'font-arabic' : ''}`}>
              {isAr ? 'المؤشرات الاقتصادية' : 'Economic Indicators'}
            </h2>
            <Link href={`/${locale}/government/metrics`} className="text-sm text-gold hover:underline">
              {isAr ? 'كل المؤشرات ←' : 'All rankings →'}
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {economyMetrics.map(m => (
              <div key={m.id} className="border p-4 rounded" style={{ borderColor: '#E4DCC9' }}>
                <div className={`text-xs text-navy/50 mb-1 ${isAr ? 'font-arabic' : 'uppercase tracking-wide'}`}>
                  {isAr ? m.name_ar : m.name_en}
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-bold text-navy">
                    {formatValue(m.value, m.unit)}
                  </span>
                  {m.trend && (
                    <span className={`text-sm font-bold mb-0.5 ${TREND_COLOR[m.trend]}`}>
                      {TREND_ICON[m.trend]}
                    </span>
                  )}
                </div>
                <div className="text-xs text-navy/40 mt-1">
                  {m.year} · {m.source_name}
                  {m.global_rank && (
                    <span className="ml-2 text-navy/60">
                      #{m.global_rank}/{m.total_countries}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Governance rankings strip */}
      {governanceMetrics.length > 0 && (
        <section>
          <h2 className={`section-heading mb-4 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'ترتيب العراق دولياً — الحوكمة' : 'Iraq Global Rankings — Governance'}
          </h2>
          <div className="divide-y" style={{ borderColor: '#E4DCC9' }}>
            {governanceMetrics.map(m => (
              <div key={m.id} className={`flex items-center justify-between py-3 gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div>
                  <span className={`font-medium text-navy ${isAr ? 'font-arabic' : ''}`}>
                    {isAr ? m.name_ar : m.name_en}
                  </span>
                  <span className="text-xs text-navy/40 ml-2">{m.source_name}</span>
                </div>
                <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                  {m.global_rank && (
                    <span className="text-red-600 font-bold text-sm">
                      #{m.global_rank}
                      {m.total_countries ? `/${m.total_countries}` : ''}
                    </span>
                  )}
                  {m.value !== null && (
                    <span className="text-navy/60 text-sm">{formatValue(m.value, m.unit)}</span>
                  )}
                  {m.trend && (
                    <span className={`font-bold ${TREND_COLOR[m.trend]}`}>{TREND_ICON[m.trend]}</span>
                  )}
                  <a href={m.source_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-gold hover:underline">
                    {isAr ? 'المصدر' : 'source'}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Prime Minister + cabinet */}
      <section>
        <h2 className={`section-heading mb-6 ${isAr ? 'font-arabic' : ''}`}>
          {isAr ? 'الحكومة الحالية' : 'Current Government'}
        </h2>

        {pm && (
          <Link href={`/${locale}/government/${pm.slug}`}
            className="flex items-center gap-4 p-5 border rounded mb-6 hover:bg-[#F1ECDF] transition-colors"
            style={{ borderColor: '#C9A84C' }}>
            {pm.photo_url && (
              <img src={pm.photo_url} alt={pm.name_ar}
                className="w-16 h-16 rounded-full object-cover border-2 border-gold" />
            )}
            <div className={isAr ? 'text-right' : ''}>
              <div className="eyebrow">{isAr ? 'رئيس الوزراء' : 'Prime Minister'}</div>
              <div className={`text-navy font-bold text-lg ${isAr ? 'font-arabic' : 'font-heading italic'}`}>
                {isAr ? pm.name_ar : pm.name_en}
              </div>
              {pm.party_ar && (
                <div className={`text-sm text-navy/60 ${isAr ? 'font-arabic' : ''}`}>
                  {isAr ? pm.party_ar : pm.party_en}
                </div>
              )}
            </div>
          </Link>
        )}

        {ministers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ministers.map(o => (
              <Link key={o.id} href={`/${locale}/government/${o.slug}`}
                className="flex items-center gap-3 p-4 border rounded hover:bg-[#F1ECDF] transition-colors"
                style={{ borderColor: '#E4DCC9' }}>
                {o.photo_url && (
                  <img src={o.photo_url} alt={o.name_ar}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                )}
                <div className={`min-w-0 ${isAr ? 'text-right' : ''}`}>
                  <div className={`font-medium text-navy truncate ${isAr ? 'font-arabic' : ''}`}>
                    {isAr ? o.name_ar : o.name_en}
                  </div>
                  <div className={`text-xs text-navy/60 truncate ${isAr ? 'font-arabic' : ''}`}>
                    {isAr ? (o.ministry_ar ?? o.title_ar) : (o.ministry_en ?? o.title_en)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {officials.length === 0 && (
          <p className={`text-navy/40 text-center py-8 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'جارٍ إضافة بيانات المسؤولين…' : 'Official data being added…'}
          </p>
        )}
      </section>

      {/* Latest scraped news */}
      {news.length > 0 && (
        <section>
          <h2 className={`section-heading mb-6 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'آخر الأخبار الحكومية' : 'Latest Government News'}
          </h2>
          <div className="divide-y" style={{ borderColor: '#E4DCC9' }}>
            {news.map(item => (
              <a key={item.id} href={item.source_url} target="_blank" rel="noopener noreferrer"
                className="block py-3 hover:text-gold transition-colors group">
                <div className={`font-medium text-navy group-hover:text-gold transition-colors ${isAr ? 'font-arabic' : ''}`}>
                  {isAr ? item.title_ar : (item.title_en ?? item.title_ar)}
                </div>
                <div className={`flex items-center gap-3 mt-1 text-xs text-navy/50 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span>{item.source_name}</span>
                  {item.published_at && (
                    <time>{new Date(item.published_at).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB')}</time>
                  )}
                  {item.tags.slice(0, 2).map(t => (
                    <span key={t} className="px-1.5 py-0.5 bg-navy/5 rounded text-navy/60">{t}</span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
