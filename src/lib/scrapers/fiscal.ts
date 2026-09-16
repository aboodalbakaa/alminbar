export type MarketMetric = {
  slug: string
  indicator_code: string | null
  name_en: string
  name_ar: string
  description_en: string
  description_ar: string
  value: number
  unit: string
  year: number
  category: string
  source_name: string
  source_url: string
  global_rank: number | null
  total_countries: number | null
  trend: 'up' | 'down' | 'stable' | null
  previous_value: number | null
}

type YahooChart = {
  chart?: {
    result?: Array<{
      meta?: { regularMarketPrice?: number; previousClose?: number; currency?: string }
      indicators?: { quote?: Array<{ close?: Array<number | null> }> }
    }>
  }
}

async function fetchYahooLast(symbol: string): Promise<{ price: number; previous: number | null } | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=10d`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AlMinbar/1.0 (Iraqi fiscal watchdog)' },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const json = (await res.json()) as YahooChart
    const result = json.chart?.result?.[0]
    const price = result?.meta?.regularMarketPrice
    if (typeof price !== 'number' || Number.isNaN(price)) return null
    const closes = (result?.indicators?.quote?.[0]?.close ?? []).filter((v): v is number => typeof v === 'number')
    const previous = result?.meta?.previousClose ?? (closes.length >= 2 ? closes[closes.length - 2] : null)
    return { price, previous: typeof previous === 'number' ? previous : null }
  } catch {
    return null
  }
}

function trendFrom(current: number, previous: number | null): 'up' | 'down' | 'stable' | null {
  if (previous === null) return null
  const diff = current - previous
  if (Math.abs(diff) / Math.max(Math.abs(previous), 1e-9) < 0.005) return 'stable'
  return diff > 0 ? 'up' : 'down'
}

/** Live oil + dinar prints. Public Yahoo chart endpoint — no key. */
export async function fetchMarketFiscalMetrics(): Promise<MarketMetric[]> {
  const year = new Date().getUTCFullYear()
  const results: MarketMetric[] = []

  const oil = await fetchYahooLast('CL=F')
  if (oil) {
    results.push({
      slug: 'brent-wti-spot',
      indicator_code: 'CL=F',
      name_en: 'Crude oil (WTI front month)',
      name_ar: 'خام النفط — عقد غرب تكساس',
      description_en: 'Market print used as a daily stress test against Iraq’s ~$65/barrel budget break-even.',
      description_ar: 'سعر السوق اليومي كاختبار ضغط مقابل سعر تعادل الموازنة العراقية حول ٦٥ دولاراً للبرميل.',
      value: oil.price,
      unit: 'USD/bbl',
      year,
      category: 'economy',
      source_name: 'Yahoo Finance / NYMEX',
      source_url: 'https://finance.yahoo.com/quote/CL=F',
      global_rank: null,
      total_countries: null,
      trend: trendFrom(oil.price, oil.previous),
      previous_value: oil.previous,
    })
  }

  const iqd = await fetchYahooLast('IQD=X')
  if (iqd) {
    results.push({
      slug: 'iqd-usd-market',
      indicator_code: 'IQD=X',
      name_en: 'Iraqi dinar per USD (market)',
      name_ar: 'الدينار العراقي مقابل الدولار (سوق)',
      description_en: 'Market FX print, not the Central Bank official window. Gap vs the official rate is itself a fiscal signal.',
      description_ar: 'سعر السوق لا نافذة البنك المركزي. الفجوة مع السعر الرسمي إشارة مالية بحد ذاتها.',
      value: iqd.price,
      unit: 'IQD/USD',
      year,
      category: 'economy',
      source_name: 'Yahoo Finance',
      source_url: 'https://finance.yahoo.com/quote/IQD=X',
      global_rank: null,
      total_countries: null,
      trend: trendFrom(iqd.price, iqd.previous),
      previous_value: iqd.previous,
    })
  }

  return results
}
