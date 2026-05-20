import { notFound } from 'next/navigation'
import Link from 'next/link'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { getCountryMetrics } from '@/lib/supabase/government'
import { STATIC_RANKINGS } from '@/lib/scrapers/sources'

export const dynamic = 'force-dynamic'

const TREND_ICON: Record<string, string> = { up: '↑', down: '↓', stable: '→' }
const TREND_COLOR: Record<string, string> = {
  up: 'text-green-600', down: 'text-red-500', stable: 'text-gray-500',
}

const CATEGORY_LABEL_AR: Record<string, string> = {
  economy: 'الاقتصاد', governance: 'الحوكمة والشفافية',
  social: 'التنمية الاجتماعية', security: 'السلام والأمن',
  infrastructure: 'البنية التحتية',
}
const CATEGORY_LABEL_EN: Record<string, string> = {
  economy: 'Economy', governance: 'Governance & Transparency',
  social: 'Social Development', security: 'Peace & Security',
  infrastructure: 'Infrastructure',
}

function formatValue(value: number | null, unit: string): string {
  if (value === null) return '—'
  if (unit === 'USD') {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9)  return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6)  return `$${(value / 1e6).toFixed(1)}M`
    return `$${value.toLocaleString()}`
  }
  if (unit === '%') return `${value.toFixed(1)}%`
  if (unit === 'yrs') return `${value.toFixed(1)} yrs`
  if (value > 1e6) return value.toLocaleString()
  return `${value.toFixed(2)} ${unit}`.trim()
}

function rankBadgeColor(rank: number, total: number): string {
  const pct = rank / total
  if (pct <= 0.25) return 'bg-red-100 text-red-700 border-red-300'
  if (pct <= 0.5)  return 'bg-orange-100 text-orange-700 border-orange-300'
  if (pct <= 0.75) return 'bg-yellow-100 text-yellow-700 border-yellow-300'
  return 'bg-green-100 text-green-700 border-green-300'
}

export default async function MetricsPage({
  params,
}: {
  params: { locale: string }
}) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const isAr = locale === 'ar'

  const metrics = await getCountryMetrics()
  const categories = ['economy', 'governance', 'social', 'security', 'infrastructure']

  // Group live metrics by category
  const byCategory = categories.reduce<Record<string, typeof metrics>>((acc, cat) => {
    acc[cat] = metrics.filter(m => m.category === cat)
    return acc
  }, {})

  // Static rankings not yet in DB — show as placeholders with links
  const staticNotInDb = STATIC_RANKINGS.filter(
    sr => !metrics.find(m => m.slug === sr.slug)
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-10" dir={isAr ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="border-b pb-6 mb-10" style={{ borderColor: '#E4DCC9' }}>
        <Link href={`/${locale}/government`} className="text-sm text-gold hover:underline block mb-4">
          {isAr ? '← الحكومة' : '← Government'}
        </Link>
        <p className="eyebrow mb-2">{isAr ? 'ترتيب العراق دولياً' : 'Iraq Global Rankings'}</p>
        <h1 className={`text-navy font-bold ${isAr ? 'font-arabic text-3xl' : 'font-heading text-2xl italic'}`}>
          {isAr ? 'مؤشرات العراق — الاقتصاد والحوكمة والمجتمع' : 'Iraq — Economy, Governance & Society'}
        </h1>
        <p className={`mt-2 text-navy/60 text-sm ${isAr ? 'font-arabic' : ''}`}>
          {isAr
            ? 'مؤشرات دولية مُحدَّثة تلقائياً — البنك الدولي، صندوق النقد، منظمة الشفافية الدولية، برنامج الأمم المتحدة الإنمائي وغيرها'
            : 'Auto-updated international indicators — World Bank, IMF, Transparency International, UNDP and others'}
        </p>
      </div>

      {/* Iraq scorecard at a glance */}
      {metrics.length > 0 && (
        <section className="mb-12 p-6 rounded border" style={{ background: '#1B2A4A', borderColor: '#1B2A4A' }}>
          <h2 className={`text-white font-bold mb-6 ${isAr ? 'font-arabic text-xl' : 'font-heading text-lg italic'}`}>
            {isAr ? 'العراق دفعة واحدة' : 'Iraq at a Glance'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics
              .filter(m => ['ny-gdp-mktp-cd', 'ny-gdp-pcap-cd', 'fp-cpi-totl-zg', 'sl-uem-totl-zs'].includes(m.slug))
              .map(m => (
                <div key={m.id}>
                  <div className="text-white/50 text-xs mb-1 uppercase tracking-wide">
                    {isAr ? m.name_ar : m.name_en}
                  </div>
                  <div className="text-white text-xl font-bold">
                    {formatValue(m.value, m.unit)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {m.trend && (
                      <span className={`text-sm font-bold ${TREND_COLOR[m.trend]}`}>
                        {TREND_ICON[m.trend]}
                      </span>
                    )}
                    <span className="text-white/40 text-xs">{m.year}</span>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Per-category sections */}
      {categories.map(cat => {
        const catMetrics = byCategory[cat]
        const catStatic = staticNotInDb.filter(s => s.category === cat)
        if (catMetrics.length === 0 && catStatic.length === 0) return null

        return (
          <section key={cat} className="mb-12">
            <h2 className={`section-heading mb-6 ${isAr ? 'font-arabic' : ''}`}>
              {isAr ? CATEGORY_LABEL_AR[cat] : CATEGORY_LABEL_EN[cat]}
            </h2>

            {catMetrics.length > 0 && (
              <div className="divide-y mb-4" style={{ borderColor: '#E4DCC9' }}>
                {catMetrics.map(m => (
                  <div key={m.id}
                    className={`flex items-center justify-between py-4 gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-navy ${isAr ? 'font-arabic' : ''}`}>
                        {isAr ? m.name_ar : m.name_en}
                      </div>
                      {(isAr ? m.description_ar : m.description_en) && (
                        <div className={`text-xs text-navy/50 mt-0.5 ${isAr ? 'font-arabic' : ''}`}>
                          {isAr ? m.description_ar : m.description_en}
                        </div>
                      )}
                      <div className="text-xs text-navy/40 mt-1">
                        {m.source_name} · {m.year}
                        {' · '}
                        <a href={m.source_url} target="_blank" rel="noopener noreferrer"
                          className="text-gold hover:underline">
                          {isAr ? 'المصدر' : 'source'}
                        </a>
                      </div>
                    </div>

                    <div className={`flex items-center gap-3 flex-shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
                      {/* Value */}
                      <div className="text-right">
                        <div className="font-bold text-navy">{formatValue(m.value, m.unit)}</div>
                        {m.previous_value !== null && (
                          <div className="text-xs text-navy/40">
                            {isAr ? 'السابق:' : 'prev.'} {formatValue(m.previous_value, m.unit)}
                          </div>
                        )}
                      </div>

                      {/* Trend */}
                      {m.trend && (
                        <span className={`text-lg font-bold ${TREND_COLOR[m.trend]}`}>
                          {TREND_ICON[m.trend]}
                        </span>
                      )}

                      {/* Rank badge */}
                      {m.global_rank && m.total_countries && (
                        <div className={`border rounded px-2 py-1 text-center text-xs font-bold min-w-[60px] ${rankBadgeColor(m.global_rank, m.total_countries)}`}>
                          <div>#{m.global_rank}</div>
                          <div className="font-normal opacity-70">/{m.total_countries}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Static rankings not yet populated */}
            {catStatic.length > 0 && (
              <div className="space-y-2">
                {catStatic.map(sr => (
                  <div key={sr.slug}
                    className={`flex items-center justify-between py-3 px-4 rounded border border-dashed gap-4 ${isAr ? 'flex-row-reverse' : ''}`}
                    style={{ borderColor: '#C9A84C', background: '#FAFAF0' }}>
                    <div>
                      <div className={`font-medium text-navy/70 ${isAr ? 'font-arabic' : ''}`}>
                        {isAr ? sr.name_ar : sr.name_en}
                      </div>
                      <div className={`text-xs text-navy/40 mt-0.5 ${isAr ? 'font-arabic' : ''}`}>
                        {isAr ? sr.description_ar : sr.description_en}
                      </div>
                      <div className="text-xs text-navy/40 mt-1">
                        {sr.source_name} ·{' '}
                        <a href={sr.source_url} target="_blank" rel="noopener noreferrer"
                          className="text-gold hover:underline">
                          {isAr ? 'المصدر' : 'source'}
                        </a>
                      </div>
                    </div>
                    <div className={`text-xs text-navy/40 flex-shrink-0 ${isAr ? 'font-arabic' : ''}`}>
                      {isAr ? 'جارٍ جمع البيانات…' : 'Awaiting data…'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )
      })}

      {/* Context note */}
      <div className={`border-t pt-6 text-xs text-navy/40 ${isAr ? 'font-arabic text-right' : ''}`}
        style={{ borderColor: '#E4DCC9' }}>
        {isAr
          ? 'يُحدَّث تلقائياً يومياً. مصادر البيانات: البنك الدولي، صندوق النقد الدولي، منظمة الشفافية الدولية، برنامج الأمم المتحدة الإنمائي، مراسلون بلا حدود، معهد الاقتصاد والسلام.'
          : 'Updated automatically daily. Data sources: World Bank, IMF, Transparency International, UNDP, Reporters Without Borders, Institute for Economics & Peace.'}
      </div>
    </div>
  )
}
