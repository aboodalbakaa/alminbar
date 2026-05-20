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

const TREND_COLOR: Record<string, string> = {
  up: 'text-emerald-600', down: 'text-red-500', stable: 'text-navy/40',
}
const TREND_ARROW: Record<string, string> = {
  up: '↑', down: '↓', stable: '→',
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

function Avatar({ name, photo, size = 'md' }: { name: string; photo?: string | null; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClass = { sm: 'w-9 h-9 text-xs', md: 'w-12 h-12 text-sm', lg: 'w-20 h-20 text-xl', xl: 'w-28 h-28 text-2xl' }[size]
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('')
  if (photo) return (
    <img src={photo} alt={name}
      className={`${sizeClass} rounded-full object-cover ring-2 ring-gold/30 flex-shrink-0`} />
  )
  return (
    <div className={`${sizeClass} rounded-full bg-navy flex items-center justify-center flex-shrink-0 ring-2 ring-gold/20`}>
      <span className="font-bold text-gold">{initials}</span>
    </div>
  )
}

export default async function GovernmentPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const isAr = locale === 'ar'

  const [officials, kpis, news, metrics] = await Promise.all([
    getAllOfficials(),
    getAllKpis(),
    getRecentNews(10),
    getCountryMetrics(),
  ])

  const stats = calcKpiStats(kpis)
  const pm        = officials.find(o => o.role_type === 'prime_minister')
  const president = officials.find(o => o.slug === 'nizar-amidi')
  const speaker   = officials.find(o => o.role_type === 'speaker')
  const ministers = officials.filter(o => o.role_type === 'minister' || o.role_type === 'deputy_pm')
  const econMetrics = metrics.filter(m => m.category === 'economy').slice(0, 5)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF6' }} dir={isAr ? 'rtl' : 'ltr'}>

      {/* ── Hero header ─────────────────────────────────────────── */}
      <div className="bg-navy">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <p className="text-gold/70 text-xs uppercase tracking-[0.2em] mb-3">
            {isAr ? 'رقابة وتقييم' : 'Oversight & Accountability'}
          </p>
          <h1 className={`text-white font-bold leading-tight mb-2 ${isAr ? 'font-arabic text-4xl' : 'font-heading italic text-4xl md:text-5xl'}`}>
            {isAr ? 'الحكومة العراقية' : 'Iraqi Government'}
          </h1>
          <p className={`text-white/50 text-base max-w-xl mb-8 ${isAr ? 'font-arabic' : ''}`}>
            {isAr
              ? 'رصد دوري لأداء الحكومة والبرلمان — وعود ونتائج وأرقام دولية'
              : 'Live tracking of promises, performance, corruption cases, and international rankings'}
          </p>

          {/* KPI scoreboard */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-xl overflow-hidden`}>
            {[
              { label: isAr ? 'وعود مُتابَعة'  : 'Promises Tracked', value: stats.total,            sub: '' },
              { label: isAr ? 'أُنجز'            : 'Delivered',        value: stats.achieved,          sub: `${stats.rate}%` },
              { label: isAr ? 'قيد التنفيذ'      : 'In Progress',      value: stats.inProgress,        sub: '' },
              { label: isAr ? 'فشل / متروك'      : 'Failed / Dropped', value: stats.failed,            sub: '' },
            ].map(s => (
              <div key={s.label} className="bg-navy px-5 py-5">
                <div className={`text-3xl font-bold text-white ${isAr ? 'font-arabic' : 'font-heading'}`}>{s.value}</div>
                {s.sub && <div className="text-gold text-sm font-semibold">{s.sub}</div>}
                <div className={`text-white/40 text-xs mt-1 ${isAr ? 'font-arabic' : 'uppercase tracking-wide'}`}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Sub-nav */}
          <div className={`flex gap-6 mt-8 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
            {[
              { href: `/${locale}/government/parliament`,  label: isAr ? 'مجلس النواب' : 'Parliament' },
              { href: `/${locale}/government/corruption`,  label: isAr ? 'قضايا الفساد' : 'Corruption Cases' },
              { href: `/${locale}/government/metrics`,     label: isAr ? 'تصنيفات العراق' : 'Global Rankings' },
            ].map(l => (
              <Link key={l.href} href={l.href}
                className={`text-white/60 hover:text-gold transition-colors text-sm border-b border-transparent hover:border-gold pb-0.5 ${isAr ? 'font-arabic' : ''}`}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-14">

        {/* ── Economy strip ───────────────────────────────────────── */}
        {econMetrics.length > 0 && (
          <section>
            <div className={`flex items-center justify-between mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
              <h2 className={`text-navy font-bold text-lg ${isAr ? 'font-arabic' : 'font-heading italic'}`}>
                {isAr ? 'المؤشرات الاقتصادية' : 'Economic Indicators'}
              </h2>
              <Link href={`/${locale}/government/metrics`}
                className={`text-gold text-sm hover:underline ${isAr ? 'font-arabic' : ''}`}>
                {isAr ? 'كل المؤشرات ←' : 'All rankings →'}
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {econMetrics.map(m => (
                <div key={m.id}
                  className="rounded-xl p-4 border bg-white"
                  style={{ borderColor: '#E4DCC9' }}>
                  <div className={`text-[10px] uppercase tracking-widest text-navy/40 mb-2 leading-tight ${isAr ? 'font-arabic text-xs normal-case tracking-normal' : ''}`}>
                    {isAr ? m.name_ar : m.name_en}
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-navy">{formatValue(m.value, m.unit)}</span>
                    {m.trend && (
                      <span className={`text-sm font-semibold ${TREND_COLOR[m.trend]}`}>
                        {TREND_ARROW[m.trend]}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-navy/30 mt-1.5">{m.source_name} · {m.year}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Leadership bento ────────────────────────────────────── */}
        <section>
          <h2 className={`text-navy font-bold text-lg mb-6 ${isAr ? 'font-arabic' : 'font-heading italic'}`}>
            {isAr ? 'قيادة الدولة' : 'State Leadership'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* PM — large feature card */}
            {pm && (
              <Link href={`/${locale}/government/${pm.slug}`}
                className="md:col-span-2 group rounded-2xl bg-white border overflow-hidden hover:shadow-lg transition-all duration-300"
                style={{ borderColor: '#E4DCC9' }}>
                <div className="p-6 flex gap-5 items-start">
                  <Avatar name={isAr ? pm.name_ar : pm.name_en} photo={pm.photo_url} size="xl" />
                  <div className={`flex-1 min-w-0 ${isAr ? 'text-right' : ''}`}>
                    <div className="text-[10px] uppercase tracking-[0.15em] text-gold mb-1">
                      {isAr ? 'رئيس مجلس الوزراء' : 'Prime Minister'}
                    </div>
                    <h3 className={`text-navy font-bold text-2xl leading-tight mb-1 group-hover:text-gold transition-colors ${isAr ? 'font-arabic' : 'font-heading italic'}`}>
                      {isAr ? pm.name_ar : pm.name_en}
                    </h3>
                    <p className={`text-navy/50 text-sm mb-4 ${isAr ? 'font-arabic' : ''}`}>
                      {isAr ? pm.party_ar : pm.party_en}
                    </p>
                    {pm.bio_en && !isAr && (
                      <p className="text-navy/60 text-sm leading-relaxed line-clamp-2">{pm.bio_en}</p>
                    )}
                    {pm.bio_ar && isAr && (
                      <p className="text-navy/60 text-sm leading-relaxed line-clamp-2 font-arabic">{pm.bio_ar}</p>
                    )}
                    <div className="mt-4 flex items-center gap-1.5 text-gold text-xs font-medium">
                      {isAr ? 'عرض الملف الكامل' : 'View full profile'}
                      <span className={`group-hover:${isAr ? '-translate-x-1' : 'translate-x-1'} transition-transform`}>
                        {isAr ? '←' : '→'}
                      </span>
                    </div>
                  </div>
                </div>
                {pm.term_start && (
                  <div className="px-6 py-3 border-t text-xs text-navy/30 flex gap-4" style={{ borderColor: '#F0EAD8' }}>
                    <span>{isAr ? 'تاريخ التكليف' : 'In office since'}</span>
                    <span className="text-navy/60">
                      {new Date(pm.term_start).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </Link>
            )}

            {/* President + Speaker stacked */}
            <div className="flex flex-col gap-4">
              {[president, speaker].filter(Boolean).map(o => o && (
                <Link key={o.id} href={`/${locale}/government/${o.slug}`}
                  className="group flex-1 rounded-2xl bg-white border p-5 flex items-center gap-4 hover:shadow-md transition-all duration-300"
                  style={{ borderColor: '#E4DCC9' }}>
                  <Avatar name={isAr ? o.name_ar : o.name_en} photo={o.photo_url} size="md" />
                  <div className={`flex-1 min-w-0 ${isAr ? 'text-right' : ''}`}>
                    <div className="text-[10px] uppercase tracking-widest text-gold/80 mb-0.5">
                      {isAr ? o.title_ar : o.title_en}
                    </div>
                    <div className={`font-semibold text-navy group-hover:text-gold transition-colors leading-tight ${isAr ? 'font-arabic' : ''}`}>
                      {isAr ? o.name_ar : o.name_en}
                    </div>
                    {(o.party_ar || o.party_en) && (
                      <div className={`text-xs text-navy/40 mt-0.5 ${isAr ? 'font-arabic' : ''}`}>
                        {isAr ? o.party_ar : o.party_en}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Cabinet grid ────────────────────────────────────────── */}
        {ministers.length > 0 && (
          <section>
            <div className={`flex items-center justify-between mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
              <h2 className={`text-navy font-bold text-lg ${isAr ? 'font-arabic' : 'font-heading italic'}`}>
                {isAr ? 'مجلس الوزراء' : 'Cabinet'}
              </h2>
              <span className={`text-xs text-navy/40 px-2 py-1 bg-navy/5 rounded-full ${isAr ? 'font-arabic' : ''}`}>
                {ministers.length} {isAr ? 'وزير معيّن' : 'confirmed ministers'}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {ministers.map(o => (
                <Link key={o.id} href={`/${locale}/government/${o.slug}`}
                  className="group rounded-xl bg-white border p-4 flex flex-col items-center text-center hover:shadow-md hover:border-gold/40 transition-all duration-200"
                  style={{ borderColor: '#E4DCC9' }}>
                  <Avatar name={isAr ? o.name_ar : o.name_en} photo={o.photo_url} size="lg" />
                  <div className={`mt-3 font-semibold text-navy text-sm leading-snug group-hover:text-gold transition-colors ${isAr ? 'font-arabic' : ''}`}>
                    {isAr ? o.name_ar : o.name_en}
                  </div>
                  <div className={`text-[11px] text-navy/50 mt-1 leading-tight ${isAr ? 'font-arabic' : ''}`}>
                    {isAr ? (o.ministry_ar ?? o.title_ar) : (o.ministry_en ?? o.title_en)}
                  </div>
                </Link>
              ))}

              {/* Vacant portfolios notice */}
              <div className="rounded-xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center"
                style={{ borderColor: '#E4DCC9' }}>
                <div className="text-2xl font-bold text-navy/20">9</div>
                <div className={`text-xs text-navy/30 mt-1 ${isAr ? 'font-arabic' : ''}`}>
                  {isAr ? 'حقيبة وزارية شاغرة' : 'vacant portfolios'}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── News feed ───────────────────────────────────────────── */}
        {news.length > 0 && (
          <section>
            <h2 className={`text-navy font-bold text-lg mb-6 ${isAr ? 'font-arabic' : 'font-heading italic'}`}>
              {isAr ? 'آخر الأخبار' : 'Latest News'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {news.map(item => (
                <a key={item.id} href={item.source_url} target="_blank" rel="noopener noreferrer"
                  className="group rounded-xl bg-white border p-4 hover:shadow-md hover:border-gold/30 transition-all duration-200"
                  style={{ borderColor: '#E4DCC9' }}>
                  <div className={`flex items-center gap-2 mb-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] uppercase tracking-widest text-gold/80 font-medium">{item.source_name}</span>
                    {item.published_at && (
                      <span className="text-[10px] text-navy/30">
                        {new Date(item.published_at).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB')}
                      </span>
                    )}
                  </div>
                  <div className={`text-navy text-sm font-medium leading-snug group-hover:text-gold transition-colors line-clamp-2 ${isAr ? 'font-arabic' : ''}`}>
                    {isAr ? item.title_ar : (item.title_en ?? item.title_ar)}
                  </div>
                  {item.tags.length > 0 && (
                    <div className={`flex gap-1.5 mt-2 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
                      {item.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-[10px] px-2 py-0.5 bg-navy/5 rounded-full text-navy/50">{t}</span>
                      ))}
                    </div>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
