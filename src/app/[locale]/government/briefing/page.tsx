import { notFound } from 'next/navigation'
import Link from 'next/link'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import {
  getAllKpis,
  getCountryMetrics,
  getFiscalNews,
  getLatestBriefing,
  getRecentNews,
} from '@/lib/supabase/government'
import { buildFiscalBriefing, type FiscalFlag } from '@/lib/scrapers/briefing'

export const dynamic = 'force-dynamic'

const SEVERITY_STYLE: Record<FiscalFlag['severity'], { bg: string; border: string; label_ar: string; label_en: string }> = {
  critical: { bg: '#FEF2F2', border: '#FECACA', label_ar: 'حرج', label_en: 'Critical' },
  warning: { bg: '#FFFBEB', border: '#FDE68A', label_ar: 'تحذير', label_en: 'Warning' },
  watch: { bg: '#F8FAFC', border: '#E2E8F0', label_ar: 'رصد', label_en: 'Watch' },
}

function formatUsd(v: number | null) {
  if (v === null) return '—'
  if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(1)}B`
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  return `$${v.toLocaleString()}`
}

export default async function FiscalBriefingPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const isAr = locale === 'ar'

  const [metrics, kpis, fiscalNews, recent, snapshot] = await Promise.all([
    getCountryMetrics(),
    getAllKpis(),
    getFiscalNews(24),
    getRecentNews(24),
    getLatestBriefing(),
  ])

  const newsPool = fiscalNews.length > 0 ? fiscalNews : recent
  const live = buildFiscalBriefing({ metrics, kpis, news: newsPool })
  const oil = metrics.find(m => m.slug === 'brent-wti-spot')
  const fx = metrics.find(m => m.slug === 'iqd-usd-market')

  const stats = [
    { label: isAr ? 'خام النفط' : 'Crude', value: oil?.value != null ? `$${Number(oil.value).toFixed(1)}` : '—', sub: isAr ? 'تعادل ٦٥$' : 'vs $65 break-even' },
    { label: isAr ? 'عجز ن١ ٢٠٢٦' : 'H1 2026 deficit', value: formatUsd(live.deficit_usd), sub: isAr ? 'بيانات المالية' : 'MoF figures' },
    { label: isAr ? 'الرواتب من الإنفاق' : 'Payroll share', value: live.salary_share != null ? `${live.salary_share.toFixed(0)}%` : '—', sub: isAr ? 'تشغيل لا استثمار' : 'operations, not capex' },
    { label: isAr ? 'حصة النفط' : 'Oil share of revenue', value: live.oil_revenue_share != null ? `${live.oil_revenue_share.toFixed(0)}%` : '—', sub: isAr ? 'الريع ما زال الدولة' : 'rent is still the state' },
  ]

  return (
    <div className="min-h-[100dvh]" style={{ backgroundColor: '#F9FAFB' }} dir={isAr ? 'rtl' : 'ltr'}>
      <section className="bg-navy text-white px-6 md:px-12 py-14">
        <div className="max-w-5xl mx-auto">
          <Link href={`/${locale}/government`} className="text-gold/80 text-sm hover:text-gold">
            {isAr ? '← رقابة الحكومة' : '← Government tracker'}
          </Link>
          <p className="text-gold text-[11px] uppercase tracking-[0.2em] mt-6 mb-3">
            {isAr ? 'موجز مالي يومي · آلي' : 'Daily fiscal brief · automated'}
          </p>
          <h1 className={`font-bold text-3xl md:text-5xl leading-tight ${isAr ? 'font-arabic' : 'tracking-tight'}`}>
            {isAr ? 'من يصرّف مال العراق — وبأي قانون؟' : 'Who is spending Iraq’s money — under which law?'}
          </h1>
          <p className={`mt-4 text-white/60 max-w-2xl leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? live.summary_ar : live.summary_en}
          </p>
          <p className="mt-4 text-white/30 text-xs font-mono">
            {isAr ? 'آخر توليد' : 'Generated'} {new Date(live.generated_at).toLocaleString(isAr ? 'ar-IQ' : 'en-GB')}
            {snapshot?.published_at ? ` · ${isAr ? 'لقطة محفوظة' : 'stored snapshot'} ${new Date(snapshot.published_at).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB')}` : ''}
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 space-y-12">
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map(s => (
            <div key={s.label} className="rounded-xl bg-white p-4" style={{ border: '1px solid rgba(226,232,240,0.8)' }}>
              <div className={`text-[10px] text-[#94A3B8] mb-2 ${isAr ? 'font-arabic text-xs' : 'uppercase tracking-widest'}`}>{s.label}</div>
              <div className="font-mono font-bold text-xl text-[#18181B]">{s.value}</div>
              <div className={`text-[11px] text-[#71717A] mt-1 ${isAr ? 'font-arabic' : ''}`}>{s.sub}</div>
            </div>
          ))}
        </section>

        {fx && (
          <p className={`text-sm text-[#71717A] ${isAr ? 'font-arabic' : ''}`}>
            {isAr
              ? `سعر السوق للدينار: ${Number(fx.value).toLocaleString()} مقابل الدولار — ليس نافذة البنك المركزي. الفجوة نفسها إشارة.`
              : `Market dinar print: ${Number(fx.value).toLocaleString()} per USD — not the CBI window. The gap itself is a signal.`}
          </p>
        )}

        <section>
          <h2 className={`text-[#18181B] font-bold text-xl mb-5 ${isAr ? 'font-arabic' : 'tracking-tight'}`}>
            {isAr ? 'الإنذارات' : 'Flags'}
          </h2>
          <div className="space-y-3">
            {live.flags.map(flag => {
              const style = SEVERITY_STYLE[flag.severity]
              return (
                <div key={flag.code} className="rounded-xl p-5" style={{ backgroundColor: style.bg, border: `1px solid ${style.border}` }}>
                  <div className={`flex items-center gap-2 mb-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-[#64748B]">{isAr ? style.label_ar : style.label_en}</span>
                    <span className={`font-semibold text-[#18181B] ${isAr ? 'font-arabic' : ''}`}>{isAr ? flag.title_ar : flag.title_en}</span>
                  </div>
                  <p className={`text-sm text-[#3F3F46] leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
                    {isAr ? flag.detail_ar : flag.detail_en}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        <section>
          <h2 className={`text-[#18181B] font-bold text-xl mb-5 ${isAr ? 'font-arabic' : 'tracking-tight'}`}>
            {isAr ? 'التغطية المالية' : 'Fiscal coverage'}
          </h2>
          {newsPool.filter(n => !(n.tags ?? []).includes('briefing')).length === 0 && (
            <p className={`text-[#71717A] text-sm ${isAr ? 'font-arabic' : ''}`}>
              {isAr
                ? 'لا أخبار مالية في القاعدة بعد. السكرابر اليومي يملأ هذا العمود من وكالات عراقية وتغذية الأعمال.'
                : 'No fiscal items in the database yet. The daily scraper fills this column from Iraqi wires and business feeds.'}
            </p>
          )}
          <div className="space-y-2">
            {newsPool.filter(n => !(n.tags ?? []).includes('briefing')).slice(0, 16).map(item => (
              <a key={item.id} href={item.source_url} target="_blank" rel="noopener noreferrer"
                className="block rounded-xl bg-white p-4 hover:border-gold transition-colors"
                style={{ border: '1px solid rgba(226,232,240,0.8)' }}>
                <div className={`flex items-center justify-between gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[10px] uppercase tracking-widest text-gold">{item.source_name}</span>
                  {item.published_at && (
                    <span className="font-mono text-[10px] text-[#94A3B8]">
                      {new Date(item.published_at).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB')}
                    </span>
                  )}
                </div>
                <div className={`mt-1 text-sm font-medium text-[#18181B] ${isAr ? 'font-arabic' : ''}`}>
                  {isAr ? (item.title_ar || item.title_en) : (item.title_en || item.title_ar)}
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-navy text-white p-8">
          <p className={`text-gold text-[11px] uppercase tracking-[0.2em] mb-3`}>{isAr ? 'المنهج' : 'Method'}</p>
          <p className={`text-white/70 leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
            {isAr
              ? 'هذا الموجز يُولَّد آلياً من مؤشرات البنك الدولي، أسعار السوق، أرقام وزارة المالية المنشورة، ووعود الوزراء المسجَّلة. ننقد البنية: دولة بلا موازنة ٢٠٢٦، ريع نفطي، وفاتورة رواتب تبتلع الاستثمار. لا نوزّع تهماً شخصية. التوثيق ليس إدانة.'
              : 'This brief is generated from World Bank indicators, market prints, published Finance Ministry figures, and recorded ministerial pledges. We criticise the structure: a state with no 2026 budget, oil rent, and a wage bill that crowds out investment. We do not distribute personal charges. Documentation is not conviction.'}
          </p>
        </section>
      </div>
    </div>
  )
}
