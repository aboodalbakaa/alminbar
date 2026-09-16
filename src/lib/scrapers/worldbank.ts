import { WORLD_BANK_INDICATORS } from './sources'

export type WorldBankMetric = {
  indicator_code: string
  name_en: string
  name_ar: string
  value: number | null
  year: number
  unit: string
  category: string
  source_name: string
  source_url: string
  global_rank: number | null
  total_countries: number | null
  trend: 'up' | 'down' | 'stable' | null
  previous_value: number | null
}

const WB_BASE = 'https://api.worldbank.org/v2'

async function fetchIraqRank(code: string): Promise<{ rank: number; total: number } | null> {
  try {
    const url = `${WB_BASE}/country/all/indicator/${code}?format=json&mrv=1&per_page=300`
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) return null
    const json = await res.json()
    const data = json[1] as Array<{ countryiso3code: string; value: number | null }> | null
    if (!data) return null

    const valid = data.filter(d => d.value !== null)
    const sorted = [...valid].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    const iraqIdx = sorted.findIndex(d => d.countryiso3code === 'IRQ')
    if (iraqIdx === -1) return null

    return { rank: iraqIdx + 1, total: sorted.length }
  } catch {
    return null
  }
}

async function fetchIndicatorSeries(code: string): Promise<Array<{ value: number | null; date: string }>> {
  try {
    const url = `${WB_BASE}/country/IRQ/indicator/${code}?format=json&mrv=5&per_page=5`
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) return []
    const json = await res.json()
    return (json[1] as Array<{ value: number | null; date: string }> | null) ?? []
  } catch {
    return []
  }
}

async function fetchOneIndicator(indicator: (typeof WORLD_BANK_INDICATORS)[number]): Promise<WorldBankMetric | null> {
  const [series, rank] = await Promise.all([
    fetchIndicatorSeries(indicator.code),
    fetchIraqRank(indicator.code),
  ])
  const withValues = series.filter(d => d.value !== null)
  const latest = withValues[0]
  if (!latest || latest.value === null) return null

  const previousValue = withValues[1]?.value ?? null
  let trend: 'up' | 'down' | 'stable' | null = null
  if (previousValue !== null) {
    const diff = latest.value - previousValue
    trend = Math.abs(diff) < 0.01 ? 'stable' : diff > 0 ? 'up' : 'down'
  }

  return {
    indicator_code: indicator.code,
    name_en: indicator.name_en,
    name_ar: indicator.name_ar,
    value: latest.value,
    year: parseInt(latest.date),
    unit: indicator.unit,
    category: indicator.category,
    source_name: 'World Bank',
    source_url: `https://data.worldbank.org/indicator/${indicator.code}?locations=IQ`,
    global_rank: rank?.rank ?? null,
    total_countries: rank?.total ?? null,
    trend,
    previous_value: previousValue,
  }
}

export async function fetchAllWorldBankMetrics(): Promise<WorldBankMetric[]> {
  const settled = await Promise.all(WORLD_BANK_INDICATORS.map(fetchOneIndicator))
  return settled.filter((m): m is WorldBankMetric => m !== null)
}
