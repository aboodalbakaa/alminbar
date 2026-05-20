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

// ─── Types ────────────────────────────────────────────────────────────────────

type KPIWithMilestones = Awaited<ReturnType<typeof getAllKpis>>[number] & {
  milestones?: Milestone[]
  officials?: { name_ar: string; name_en: string; slug: string } | null
}

type Milestone = {
  year: number
  target_en: string
  target_ar: string
  status: 'achieved' | 'in_progress' | 'promised' | 'failed' | 'stalled'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  achieved: '#10B981',
  in_progress: '#F59E0B',
  promised: '#94A3B8',
  failed: '#EF4444',
  stalled: '#F97316',
  abandoned: '#6B7280',
}

const STATUS_LABEL_AR: Record<string, string> = {
  achieved: 'أُنجز', in_progress: 'قيد التنفيذ', promised: 'وعد',
  failed: 'فشل', stalled: 'متوقف', abandoned: 'متروك',
}

const KPI_CAT_COLOR: Record<string, string> = {
  economy: '#C9A84C', infrastructure: '#3B82F6', security: '#EF4444',
  corruption: '#8B5CF6', healthcare: '#10B981', education: '#F97316',
  services: '#06B6D4', general: '#94A3B8',
}

function Avatar({ name, photo, size = 'md' }: { name: string; photo?: string | null; size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero' }) {
  const sizeMap = {
    sm: 'w-9 h-9', md: 'w-14 h-14', lg: 'w-20 h-20',
    xl: 'w-28 h-28', hero: 'w-40 h-40 md:w-52 md:h-52',
  }
  const cls = sizeMap[size]
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1B2A4A&color=C9A84C&size=300&bold=true&format=png`
  const src = photo || fallback
  return (
    <img src={src} alt={name}
      className={`${cls} rounded-full object-cover object-top flex-shrink-0`}
      style={{ boxShadow: '0 0 0 3px rgba(201,168,76,0.3)' }} />
  )
}

function formatValue(v: number | null, unit: string) {
  if (v === null) return '—'
  if (unit === 'USD') {
    if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`
    if (v >= 1e9)  return `$${(v / 1e9).toFixed(1)}B`
    return `$${v.toLocaleString()}`
  }
  if (unit === '%') return `${v.toFixed(1)}%`
  return `${v.toLocaleString()} ${unit}`.trim()
}

function daysInOffice(termStart: string | null): number {
  if (!termStart) return 0
  return Math.floor((Date.now() - new Date(termStart).getTime()) / 86400000)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function GovernmentPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const isAr = locale === 'ar'

  const [officials, kpis, news, metrics] = await Promise.all([
    getAllOfficials(),
    getAllKpis() as Promise<KPIWithMilestones[]>,
    getRecentNews(12),
    getCountryMetrics(),
  ])

  const stats    = calcKpiStats(kpis)
  const pm       = officials.find(o => o.role_type === 'prime_minister')
  const president = officials.find(o => o.slug === 'nizar-amidi')
  const speaker  = officials.find(o => o.role_type === 'speaker')
  const ministers = officials.filter(o => o.role_type === 'minister' || o.role_type === 'deputy_pm')
  const econMetrics = metrics.filter(m => m.category === 'economy').slice(0, 6)
  const days = daysInOffice(pm?.term_start ?? null)

  // Group KPIs with milestones by year
  const kpisWithMilestones = kpis.filter(k => k.milestones && Array.isArray(k.milestones) && k.milestones.length > 0)

  return (
    <div className="min-h-[100dvh]" style={{ backgroundColor: '#F9FAFB', fontFamily: 'var(--font-body)' }} dir={isAr ? 'rtl' : 'ltr'}>

      {/* ─── HERO — Split Screen ─────────────────────────────────────── */}
      <section className="bg-navy grid grid-cols-1 lg:grid-cols-5 min-h-[60dvh]">

        {/* Left: text column */}
        <div className={`lg:col-span-3 px-6 md:px-12 py-14 flex flex-col justify-center ${isAr ? 'items-end text-right' : ''}`}>

          <div className={`flex items-center gap-2 mb-5 ${isAr ? 'flex-row-reverse' : ''}`}>
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-gold text-[11px] uppercase tracking-[0.2em] font-semibold">
              {isAr ? 'رصد حي | مباشر' : 'Live Oversight · Real-time'}
            </span>
          </div>

          <h1 className={`font-bold leading-[1.05] mb-3 text-white
            ${isAr ? 'font-arabic text-4xl md:text-5xl' : 'text-4xl md:text-6xl tracking-tight'}`}>
            {isAr ? 'من يحكم العراق\nفعلاً؟' : 'Who really\nruns Iraq?'}
          </h1>

          <p className={`text-white/50 text-base md:text-lg max-w-md mb-10 leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
            {isAr
              ? `علي الزيدي رئيساً للوزراء — لكن هل القرارات قراراته أم قرارات من يديرونه؟ نتابع كل وعد وكل إخفاق.`
              : `Ali al-Zaidi is Prime Minister — but whose decisions are being made? We track every promise, every failure.`}
          </p>

          {/* Day counter + score strip */}
          <div className={`flex flex-wrap gap-px mb-10 rounded-xl overflow-hidden border border-white/10 ${isAr ? 'flex-row-reverse' : ''}`}>
            {[
              { v: days,           sub: isAr ? 'يوم في المنصب' : 'days in office',     mono: true },
              { v: stats.total,    sub: isAr ? 'وعود مُتابَعة' : 'promises tracked',   mono: false },
              { v: `${stats.rate}%`, sub: isAr ? 'معدل الإنجاز' : 'delivery rate',   mono: true },
              { v: stats.failed,   sub: isAr ? 'فشل / متروك'   : 'failed / dropped',   mono: false },
            ].map(s => (
              <div key={String(s.sub)} className="flex-1 bg-white/5 px-4 py-4 min-w-[80px]">
                <div className={`text-2xl md:text-3xl font-bold text-white ${s.mono ? 'font-mono' : ''}`}>{s.v}</div>
                <div className={`text-white/40 text-[10px] mt-1 uppercase tracking-wide ${isAr ? 'font-arabic text-xs normal-case tracking-normal' : ''}`}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Sub-nav */}
          <div className={`flex gap-5 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
            {[
              { href: `/${locale}/government/parliament`, label: isAr ? 'البرلمان والمقاعد' : 'Parliament & Seats' },
              { href: `/${locale}/government/corruption`, label: isAr ? 'قضايا الفساد' : 'Corruption Cases' },
              { href: `/${locale}/government/metrics`,   label: isAr ? 'التصنيفات الدولية' : 'Global Rankings' },
            ].map(l => (
              <Link key={l.href} href={l.href}
                className={`text-white/50 hover:text-gold border-b border-transparent hover:border-gold transition-all text-sm pb-0.5 ${isAr ? 'font-arabic' : ''}`}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: PM photo */}
        {pm && (
          <div className="lg:col-span-2 relative overflow-hidden min-h-[300px] lg:min-h-0">
            <img
              src={pm.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(isAr ? pm.name_ar : pm.name_en)}&background=2D3E5C&color=C9A84C&size=600&bold=true`}
              alt={isAr ? pm.name_ar : pm.name_en}
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            {/* Gradient blend */}
            <div className={`absolute inset-0 ${isAr ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-navy via-navy/30 to-transparent`} />
            {/* Name badge at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className={`text-[10px] uppercase tracking-[0.2em] text-gold mb-1 ${isAr ? 'text-right font-arabic' : ''}`}>
                {isAr ? 'رئيس مجلس الوزراء' : 'Prime Minister'}
              </div>
              <div className={`text-white font-bold text-xl ${isAr ? 'font-arabic text-right' : 'tracking-tight'}`}>
                {isAr ? pm.name_ar : pm.name_en}
              </div>
              {pm.party_en && (
                <div className={`text-white/40 text-xs mt-0.5 ${isAr ? 'font-arabic text-right' : ''}`}>
                  {isAr ? pm.party_ar : pm.party_en}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 space-y-16">

        {/* ─── PROMISE ROADMAP ──────────────────────────────────────────── */}
        {kpisWithMilestones.length > 0 && (
          <section>
            <div className={`flex items-end justify-between mb-8 gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div>
                <p className={`text-[10px] uppercase tracking-[0.2em] text-gold mb-2 ${isAr ? 'font-arabic text-xs normal-case tracking-normal text-right' : ''}`}>
                  {isAr ? 'أهداف ذكية' : 'Smart Goals · SMART Framework'}
                </p>
                <h2 className={`text-[#18181B] font-bold text-2xl md:text-3xl tracking-tight ${isAr ? 'font-arabic' : ''}`}>
                  {isAr ? 'خريطة الوعود — ماذا يجب أن يُنجز ومتى' : 'Promise Roadmap — what must be delivered and when'}
                </h2>
              </div>
            </div>

            <div className="space-y-8">
              {kpisWithMilestones.slice(0, 3).map(kpi => (
                <div key={kpi.id} className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: '0 4px 24px -8px rgba(0,0,0,0.08)', border: '1px solid rgba(226,232,240,0.6)' }}>
                  {/* KPI header */}
                  <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                    <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: KPI_CAT_COLOR[kpi.category] ?? '#94A3B8' }} />
                      <div>
                        <h3 className={`font-semibold text-[#18181B] text-base ${isAr ? 'font-arabic' : 'tracking-tight'}`}>
                          {isAr ? kpi.title_ar : kpi.title_en}
                        </h3>
                        {(isAr ? kpi.description_ar : kpi.description_en) && (
                          <p className={`text-[#71717A] text-sm mt-0.5 ${isAr ? 'font-arabic' : ''}`}>
                            {isAr ? kpi.description_ar : kpi.description_en}
                          </p>
                        )}
                      </div>
                      <span className="ms-auto text-xs px-3 py-1 rounded-full font-medium flex-shrink-0"
                        style={{ backgroundColor: (STATUS_COLOR[kpi.status] ?? '#94A3B8') + '20', color: STATUS_COLOR[kpi.status] ?? '#94A3B8' }}>
                        {isAr ? STATUS_LABEL_AR[kpi.status] : kpi.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Milestones timeline */}
                  <div className="px-6 py-5">
                    <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${isAr ? 'direction-rtl' : ''}`}>
                      {(kpi.milestones as Milestone[]).map((m, idx) => (
                        <div key={idx} className="relative rounded-xl p-4" style={{
                          backgroundColor: m.status === 'achieved' ? '#ECFDF5' : m.status === 'in_progress' ? '#FFFBEB' : m.status === 'stalled' ? '#FFF7ED' : '#F8FAFC',
                          borderLeft: isAr ? 'none' : `3px solid ${STATUS_COLOR[m.status] ?? '#94A3B8'}`,
                          borderRight: isAr ? `3px solid ${STATUS_COLOR[m.status] ?? '#94A3B8'}` : 'none',
                        }}>
                          <div className="text-[10px] font-mono font-bold mb-2" style={{ color: STATUS_COLOR[m.status] ?? '#94A3B8' }}>
                            {m.year}
                          </div>
                          <p className={`text-[#18181B] text-xs leading-relaxed ${isAr ? 'font-arabic text-right' : ''}`}>
                            {isAr ? m.target_ar : m.target_en}
                          </p>
                          <div className="mt-2 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLOR[m.status] ?? '#94A3B8' }} />
                            <span className="text-[10px]" style={{ color: STATUS_COLOR[m.status] ?? '#94A3B8' }}>
                              {isAr ? STATUS_LABEL_AR[m.status] : m.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── STATE LEADERSHIP BENTO ───────────────────────────────────── */}
        <section>
          <div className={`flex items-center justify-between mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
            <h2 className={`text-[#18181B] font-bold text-xl tracking-tight ${isAr ? 'font-arabic' : ''}`}>
              {isAr ? 'قيادة الدولة' : 'State Leadership'}
            </h2>
            <span className="text-[11px] text-[#71717A] uppercase tracking-widest">
              {isAr ? 'انقر للملف الكامل' : 'Click for full profile'}
            </span>
          </div>

          {/* Asymmetric grid: PM wide + sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* PM — 2/3 width, dark card */}
            {pm && (
              <Link href={`/${locale}/government/${pm.slug}`}
                className="lg:col-span-2 group rounded-2xl overflow-hidden relative"
                style={{ background: '#1B2A4A', minHeight: '280px', boxShadow: '0 20px 40px -15px rgba(27,42,74,0.35)' }}>
                {/* Background photo subtle */}
                {pm.photo_url && (
                  <div className="absolute inset-0 opacity-15">
                    <img src={pm.photo_url} alt="" className="w-full h-full object-cover object-top" />
                  </div>
                )}
                <div className={`relative z-10 p-8 flex gap-6 items-start h-full ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                  <Avatar name={isAr ? pm.name_ar : pm.name_en} photo={pm.photo_url} size="xl" />
                  <div className="flex-1 min-w-0">
                    <div className="text-gold text-[10px] uppercase tracking-[0.2em] mb-2">
                      {isAr ? 'رئيس مجلس الوزراء' : 'Prime Minister'}
                    </div>
                    <h3 className={`text-white font-bold text-2xl md:text-3xl leading-tight mb-2 tracking-tight group-hover:text-gold transition-colors ${isAr ? 'font-arabic' : ''}`}>
                      {isAr ? pm.name_ar : pm.name_en}
                    </h3>
                    <p className={`text-white/50 text-sm mb-4 ${isAr ? 'font-arabic' : ''}`}>
                      {isAr ? pm.party_ar : pm.party_en}
                    </p>
                    {(isAr ? pm.bio_ar : pm.bio_en) && (
                      <p className={`text-white/40 text-sm leading-relaxed line-clamp-2 ${isAr ? 'font-arabic' : ''}`}>
                        {isAr ? pm.bio_ar : pm.bio_en}
                      </p>
                    )}
                    <div className="mt-6 inline-flex items-center gap-2 text-gold text-xs font-semibold group-hover:gap-3 transition-all">
                      {isAr ? '← عرض الملف الكامل' : 'View full profile →'}
                    </div>
                  </div>
                </div>
                {pm.term_start && (
                  <div className={`relative z-10 px-8 py-3 border-t border-white/10 flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                    <span className="text-white/30 text-xs font-mono">{days} days · since {new Date(pm.term_start).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
                  </div>
                )}
              </Link>
            )}

            {/* President + Speaker stacked */}
            <div className="flex flex-col gap-4">
              {[president, speaker].filter(Boolean).map(o => o && (
                <Link key={o.id} href={`/${locale}/government/${o.slug}`}
                  className="group flex-1 rounded-2xl bg-white p-6 flex items-center gap-4 transition-all"
                  style={{ boxShadow: '0 4px 24px -8px rgba(0,0,0,0.06)', border: '1px solid rgba(226,232,240,0.6)' }}>
                  <Avatar name={isAr ? o.name_ar : o.name_en} photo={o.photo_url} size="md" />
                  <div className={`flex-1 min-w-0 ${isAr ? 'text-right' : ''}`}>
                    <div className="text-gold text-[10px] uppercase tracking-widest mb-1">
                      {isAr ? o.title_ar : o.title_en}
                    </div>
                    <div className={`font-semibold text-[#18181B] group-hover:text-navy transition-colors text-base tracking-tight ${isAr ? 'font-arabic' : ''}`}>
                      {isAr ? o.name_ar : o.name_en}
                    </div>
                    {(o.party_ar || o.party_en) && (
                      <div className={`text-[#71717A] text-xs mt-0.5 ${isAr ? 'font-arabic' : ''}`}>
                        {isAr ? o.party_ar : o.party_en}
                      </div>
                    )}
                  </div>
                  <span className="text-[#94A3B8] group-hover:text-gold transition-colors text-lg flex-shrink-0">
                    {isAr ? '←' : '→'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── ECONOMY STRIP ────────────────────────────────────────────── */}
        {econMetrics.length > 0 && (
          <section>
            <div className={`flex items-center justify-between mb-5 ${isAr ? 'flex-row-reverse' : ''}`}>
              <h2 className={`text-[#18181B] font-bold text-xl tracking-tight ${isAr ? 'font-arabic' : ''}`}>
                {isAr ? 'مؤشرات الاقتصاد' : 'Economic Indicators'}
              </h2>
              <Link href={`/${locale}/government/metrics`}
                className="text-gold text-sm hover:underline">
                {isAr ? 'كل المؤشرات ←' : 'All rankings →'}
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {econMetrics.map(m => (
                <div key={m.id} className="rounded-xl p-4 bg-white"
                  style={{ border: '1px solid rgba(226,232,240,0.6)', boxShadow: '0 2px 8px -4px rgba(0,0,0,0.04)' }}>
                  <div className={`text-[10px] text-[#94A3B8] mb-2 leading-tight ${isAr ? 'font-arabic text-xs text-right' : 'uppercase tracking-widest'}`}>
                    {isAr ? m.name_ar : m.name_en}
                  </div>
                  <div className="font-mono font-bold text-xl text-[#18181B]">
                    {formatValue(m.value, m.unit)}
                  </div>
                  {m.trend && (
                    <div className="text-xs mt-1 font-medium"
                      style={{ color: m.trend === 'up' ? '#10B981' : m.trend === 'down' ? '#EF4444' : '#94A3B8' }}>
                      {m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : '→'} {m.year}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── CABINET ──────────────────────────────────────────────────── */}
        {ministers.length > 0 && (
          <section>
            <div className={`flex items-center justify-between mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
              <h2 className={`text-[#18181B] font-bold text-xl tracking-tight ${isAr ? 'font-arabic' : ''}`}>
                {isAr ? 'مجلس الوزراء' : 'Cabinet'}
              </h2>
              <span className="font-mono text-sm text-[#71717A]">
                {ministers.length} <span className={isAr ? 'font-arabic' : ''}>
                  {isAr ? 'وزير' : 'ministers'}
                </span>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {ministers.map((o, idx) => (
                <Link key={o.id} href={`/${locale}/government/${o.slug}`}
                  className="group rounded-2xl bg-white p-5 flex flex-col items-center text-center transition-all duration-200"
                  style={{
                    border: '1px solid rgba(226,232,240,0.6)',
                    boxShadow: '0 4px 24px -8px rgba(0,0,0,0.06)',
                    animationDelay: `${idx * 60}ms`,
                  }}>
                  <Avatar name={isAr ? o.name_ar : o.name_en} photo={o.photo_url} size="lg" />
                  <div className={`mt-3 font-semibold text-[#18181B] text-sm leading-snug group-hover:text-navy transition-colors ${isAr ? 'font-arabic' : 'tracking-tight'}`}>
                    {isAr ? o.name_ar : o.name_en}
                  </div>
                  <div className={`text-[11px] text-[#94A3B8] mt-1 leading-tight ${isAr ? 'font-arabic' : ''}`}>
                    {isAr ? (o.ministry_ar ?? o.title_ar) : (o.ministry_en ?? o.title_en)}
                  </div>
                </Link>
              ))}

              {/* Vacant portfolios */}
              <div className="rounded-2xl p-5 flex flex-col items-center justify-center text-center"
                style={{ border: '2px dashed rgba(226,232,240,0.8)' }}>
                <div className="font-mono text-3xl font-bold text-[#CBD5E1] mb-1">9</div>
                <div className={`text-xs text-[#94A3B8] ${isAr ? 'font-arabic' : ''}`}>
                  {isAr ? 'حقيبة شاغرة' : 'vacant portfolios'}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─── NEWS ─────────────────────────────────────────────────────── */}
        {news.length > 0 && (
          <section>
            <h2 className={`text-[#18181B] font-bold text-xl tracking-tight mb-6 ${isAr ? 'font-arabic' : ''}`}>
              {isAr ? 'آخر الأخبار' : 'Latest Coverage'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {news.map(item => (
                <a key={item.id} href={item.source_url} target="_blank" rel="noopener noreferrer"
                  className="group rounded-xl bg-white p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-[1px]"
                  style={{ border: '1px solid rgba(226,232,240,0.6)', boxShadow: '0 2px 8px -4px rgba(0,0,0,0.04)' }}>
                  <div className={`flex items-center justify-between gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-gold">{item.source_name}</span>
                    {item.published_at && (
                      <span className="font-mono text-[10px] text-[#94A3B8]">
                        {new Date(item.published_at).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB')}
                      </span>
                    )}
                  </div>
                  <div className={`text-[#18181B] text-sm font-medium leading-snug group-hover:text-navy transition-colors line-clamp-2 ${isAr ? 'font-arabic' : ''}`}>
                    {isAr ? item.title_ar : (item.title_en ?? item.title_ar)}
                  </div>
                  {item.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {item.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-[#71717A]">{t}</span>
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
