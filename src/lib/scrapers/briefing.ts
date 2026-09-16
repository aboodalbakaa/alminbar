import type { KPI, CountryMetric, ScrapedItem } from '@/lib/supabase/government'

export type FiscalFlag = {
  severity: 'critical' | 'warning' | 'watch'
  code: string
  title_ar: string
  title_en: string
  detail_ar: string
  detail_en: string
}

export type FiscalBriefing = {
  generated_at: string
  date_key: string
  title_ar: string
  title_en: string
  summary_ar: string
  summary_en: string
  body_ar: string
  body_en: string
  flags: FiscalFlag[]
  oil_price: number | null
  oil_vs_breakeven: number | null
  deficit_usd: number | null
  salary_share: number | null
  oil_revenue_share: number | null
  failed_fiscal_kpis: number
  stalled_fiscal_kpis: number
  fiscal_news_count: number
}

const BREAKEVEN = 65
const FISCAL_TAGS = new Set(['budget', 'oil', 'finance', 'economy', 'fiscal', 'briefing'])

export function isFiscalItem(item: Pick<ScrapedItem, 'tags' | 'title_ar' | 'title_en' | 'summary_ar' | 'summary_en'>): boolean {
  if ((item.tags ?? []).some(t => FISCAL_TAGS.has(t))) return true
  const blob = `${item.title_ar ?? ''} ${item.title_en ?? ''} ${item.summary_ar ?? ''} ${item.summary_en ?? ''}`
  return /موازن|ميزاني|عجز|روات|نفط|مال|دينار|اقتراض|إيراد|ضريب|budget|deficit|salary|oil|dinar|fiscal|tax|debt/i.test(blob)
}

function num(metrics: CountryMetric[], slug: string): number | null {
  const m = metrics.find(x => x.slug === slug)
  return typeof m?.value === 'number' ? Number(m.value) : null
}

export function buildFiscalFlags(input: {
  oilPrice: number | null
  salaryShare: number | null
  deficitUsd: number | null
  oilRevenueShare: number | null
  investmentShare: number | null
  failedKpis: number
  stalledKpis: number
  fiscalNews: number
}): FiscalFlag[] {
  const flags: FiscalFlag[] = []

  if (input.oilPrice !== null && input.oilPrice < BREAKEVEN) {
    flags.push({
      severity: 'critical',
      code: 'oil-below-breakeven',
      title_ar: 'النفط تحت سعر تعادل الموازنة',
      title_en: 'Oil below budget break-even',
      detail_ar: `السعر ${input.oilPrice.toFixed(1)} دولار مقابل تعادل تشغيلي حول ${BREAKEVEN} دولاراً. كل دولار تحت الخط يوسّع العجز لا الخطاب.`,
      detail_en: `Print ${input.oilPrice.toFixed(1)} vs a working break-even near $${BREAKEVEN}. Every dollar under the line widens the deficit, not the speech.`,
    })
  } else if (input.oilPrice !== null && input.oilPrice < BREAKEVEN + 10) {
    flags.push({
      severity: 'warning',
      code: 'oil-near-breakeven',
      title_ar: 'النفط قرب خط العجز',
      title_en: 'Oil near the deficit line',
      detail_ar: `السعر ${input.oilPrice.toFixed(1)} دولار — هامش أمان ضيق لدولة ريعها نفط.`,
      detail_en: `Print ${input.oilPrice.toFixed(1)} — a thin safety margin for an oil-rent state.`,
    })
  }

  if (input.deficitUsd !== null && input.deficitUsd >= 10e9) {
    flags.push({
      severity: 'critical',
      code: 'h1-deficit',
      title_ar: 'عجز النصف الأول أكبر من عشرة مليارات دولار',
      title_en: 'H1 deficit above $10 billion',
      detail_ar: `العجز الموثَّق نحو ${(input.deficitUsd / 1e9).toFixed(1)} مليار دولار في ستة أشهر. هذا ليس موسمياً — هذا هيكل.`,
      detail_en: `Documented gap near $${(input.deficitUsd / 1e9).toFixed(1)}bn in six months. That is not seasonal. It is structure.`,
    })
  }

  if (input.salaryShare !== null && input.salaryShare >= 70) {
    flags.push({
      severity: 'critical',
      code: 'salary-capture',
      title_ar: 'الرواتب تبتلع الموازنة',
      title_en: 'Payroll captures the budget',
      detail_ar: `${input.salaryShare.toFixed(0)}٪ من الإنفاق رواتب واستحقاقات. الاستثمار يتبقى فتاتاً.`,
      detail_en: `${input.salaryShare.toFixed(0)}% of spending is salaries and entitlements. Investment is the remainder.`,
    })
  }

  if (input.oilRevenueShare !== null && input.oilRevenueShare >= 75) {
    flags.push({
      severity: 'warning',
      code: 'oil-rent',
      title_ar: 'الإيراد ما زال نفطاً',
      title_en: 'Revenue is still oil',
      detail_ar: `${input.oilRevenueShare.toFixed(0)}٪ من الإيرادات نفطية. التنويع خطاب ما لم تظهر ضريبة.`,
      detail_en: `${input.oilRevenueShare.toFixed(0)}% of revenue is oil. Diversification is speech until a tax shows up.`,
    })
  }

  if (input.investmentShare !== null && input.investmentShare < 10) {
    flags.push({
      severity: 'warning',
      code: 'investment-starved',
      title_ar: 'الاستثمار دون ١٠٪ من الإنفاق',
      title_en: 'Investment under 10% of spending',
      detail_ar: `حصة الاستثمار ${input.investmentShare.toFixed(1)}٪. دولة توزّع ريعاً لا تبني طاقة إنتاج.`,
      detail_en: `Investment share ${input.investmentShare.toFixed(1)}%. A state distributing rent, not building capacity.`,
    })
  }

  if (input.failedKpis + input.stalledKpis >= 3) {
    flags.push({
      severity: 'critical',
      code: 'broken-pledges',
      title_ar: 'وعود مالية متعثرة أو فاشلة',
      title_en: 'Fiscal pledges stalled or failed',
      detail_ar: `${input.failedKpis} فشل و${input.stalledKpis} تعثّر في ملف الاقتصاد وحده.`,
      detail_en: `${input.failedKpis} failed and ${input.stalledKpis} stalled on the economy file alone.`,
    })
  }

  flags.push({
    severity: 'watch',
    code: 'no-2026-budget',
    title_ar: 'لا موازنة اتحادية لعام ٢٠٢٦',
    title_en: 'No 2026 federal budget',
    detail_ar: 'الإنفاق بقاعدة الجزء من اثني عشر. البرلمان قفز إلى ٢٠٢٧. الرقابة تجري على شيكات موقّعة.',
    detail_en: 'Spending under the one-twelfth rule. Parliament jumped to 2027. Oversight is chasing signed cheques.',
  })

  return flags
}

export function buildFiscalBriefing(input: {
  metrics: CountryMetric[]
  kpis: KPI[]
  news: ScrapedItem[]
}): FiscalBriefing {
  const oilPrice = num(input.metrics, 'brent-wti-spot')
  const deficitUsd = num(input.metrics, 'h1-2026-fiscal-deficit')
  const salaryShare = num(input.metrics, 'h1-2026-salary-share')
  const oilRevenueShare = num(input.metrics, 'h1-2026-oil-revenue-share')
  const investmentShare = num(input.metrics, 'h1-2026-investment-share')

  const fiscalKpis = input.kpis.filter(k => k.category === 'economy' || k.category === 'corruption')
  const failed = fiscalKpis.filter(k => k.status === 'failed' || k.status === 'abandoned').length
  const stalled = fiscalKpis.filter(k => k.status === 'stalled').length
  const fiscalNews = input.news.filter(isFiscalItem)

  const flags = buildFiscalFlags({
    oilPrice,
    salaryShare,
    deficitUsd,
    oilRevenueShare,
    investmentShare,
    failedKpis: failed,
    stalledKpis: stalled,
    fiscalNews: fiscalNews.length,
  })

  const critical = flags.filter(f => f.severity === 'critical').length
  const generated_at = new Date().toISOString()
  const date_key = generated_at.slice(0, 10)

  const oilLineAr = oilPrice === null
    ? 'سعر النفط غير متاح في هذه الجولة.'
    : `سعر الخام ${oilPrice.toFixed(1)} دولاراً — ${oilPrice < BREAKEVEN ? 'تحت' : 'فوق'} خط التعادل (${BREAKEVEN}).`
  const oilLineEn = oilPrice === null
    ? 'Oil print unavailable this run.'
    : `Crude at $${oilPrice.toFixed(1)} — ${oilPrice < BREAKEVEN ? 'below' : 'above'} break-even ($${BREAKEVEN}).`

  const newsAr = fiscalNews.slice(0, 6).map(n => `• ${n.title_ar || n.title_en || n.source_name}`).join('\n')
  const newsEn = fiscalNews.slice(0, 6).map(n => `• ${n.title_en || n.title_ar || n.source_name}`).join('\n')

  const flagAr = flags.map(f => `[${f.severity}] ${f.title_ar}: ${f.detail_ar}`).join('\n')
  const flagEn = flags.map(f => `[${f.severity}] ${f.title_en}: ${f.detail_en}`).join('\n')

  const summary_ar = `${critical} إنذارات حرجة. ${oilLineAr} لا موازنة ٢٠٢٦. عجز النصف الأول موثَّق عند نحو ١٦ مليار دولار إن بقيت الأرقام الحكومية على حالها. المنبر لا يوزّع غضباً — يوزّع أرقاماً.`
  const summary_en = `${critical} critical flags. ${oilLineEn} No 2026 budget. H1 deficit sits near $16bn if ministry figures still hold. Al-Minbar does not distribute anger. It distributes numbers.`

  const body_ar = [
    'موجز مالي يومي — رقابة لا تعليق.',
    '',
    oilLineAr,
    deficitUsd !== null ? `عجز النصف الأول: ${(deficitUsd / 1e9).toFixed(1)} مليار دولار.` : '',
    salaryShare !== null ? `حصة الرواتب من الإنفاق: ${salaryShare.toFixed(0)}٪.` : '',
    oilRevenueShare !== null ? `حصة النفط من الإيراد: ${oilRevenueShare.toFixed(0)}٪.` : '',
    '',
    'الإنذارات:',
    flagAr,
    '',
    fiscalNews.length ? `تغطية مالية (${fiscalNews.length}):\n${newsAr}` : 'لا تغطية مالية جديدة في النافذة الحالية.',
    '',
    'المنهج: نحاسب البنية — الريع، قاعدة الجزء من اثني عشر، فاتورة الرواتب، ووعود التنويع — لا الأشخاص. المصادر علنية. التوثيق ليس إدانة.',
  ].filter(Boolean).join('\n')

  const body_en = [
    'Daily fiscal brief — oversight, not commentary.',
    '',
    oilLineEn,
    deficitUsd !== null ? `H1 deficit: $${(deficitUsd / 1e9).toFixed(1)}bn.` : '',
    salaryShare !== null ? `Salary share of spending: ${salaryShare.toFixed(0)}%.` : '',
    oilRevenueShare !== null ? `Oil share of revenue: ${oilRevenueShare.toFixed(0)}%.` : '',
    '',
    'Flags:',
    flagEn,
    '',
    fiscalNews.length ? `Fiscal coverage (${fiscalNews.length}):\n${newsEn}` : 'No new fiscal coverage in the current window.',
    '',
    'Method: we audit the structure — rent, the one-twelfth rule, the wage bill, diversification pledges — not persons. Sources are public. Documentation is not conviction.',
  ].filter(Boolean).join('\n')

  return {
    generated_at,
    date_key,
    title_ar: `الموجز المالي — ${date_key}`,
    title_en: `Fiscal brief — ${date_key}`,
    summary_ar,
    summary_en,
    body_ar,
    body_en,
    flags,
    oil_price: oilPrice,
    oil_vs_breakeven: oilPrice === null ? null : oilPrice - BREAKEVEN,
    deficit_usd: deficitUsd,
    salary_share: salaryShare,
    oil_revenue_share: oilRevenueShare,
    failed_fiscal_kpis: failed,
    stalled_fiscal_kpis: stalled,
    fiscal_news_count: fiscalNews.length,
  }
}

export const BRIEFING_SOURCE = 'المنبر — الموجز المالي'

export function briefingSourceUrl(dateKey: string): string {
  return `https://alminbar.internal/briefing/${dateKey}`
}
