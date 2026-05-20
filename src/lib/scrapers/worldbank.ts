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

async function fetchIndicator(code: string): Promise<{ value: number | null; year: number } | null> {
  try {
    const url = `${WB_BASE}/country/IRQ/indicator/${code}?format=json&mrv=2&per_page=2`
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) return null
    const json = await res.json()
    const data = json[1] as Array<{ value: number | null; date: string }> | null
    if (!data || data.length === 0) return null
    const latest = data.find(d => d.value !== null)
    return latest ? { value: latest.value, year: parseInt(latest.date) } : null
  } catch {
    return null
  }
}

// Fetch global rank for Iraq on a given indicator
async function fetchIraqRank(code: string): Promise<{ rank: number; total: number } | null> {
  try {
    // Get all countries for this indicator for the latest year
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

export async function fetchAllWorldBankMetrics(): Promise<WorldBankMetric[]> {
  const results: WorldBankMetric[] = []

  for (const indicator of WORLD_BANK_INDICATORS) {
    const [current, rank] = await Promise.all([
      fetchIndicator(indicator.code),
      fetchIraqRank(indicator.code),
    ])

    if (!current) continue

    // Get previous year value for trend
    let previousValue: number | null = null
    let trend: 'up' | 'down' | 'stable' | null = null
    try {
      const url = `${WB_BASE}/country/IRQ/indicator/${indicator.code}?format=json&mrv=5&per_page=5`
      const res = await fetch(url, { next: { revalidate: 86400 } })
      const json = await res.json()
      const data = json[1] as Array<{ value: number | null; date: string }> | null
      if (data) {
        const withValues = data.filter(d => d.value !== null)
        if (withValues.length >= 2) {
          previousValue = withValues[1].value ?? null
          if (previousValue !== null && current.value !== null) {
            const diff = current.value - previousValue
            trend = Math.abs(diff) < 0.01 ? 'stable' : diff > 0 ? 'up' : 'down'
          }
        }
      }
    } catch {
      // No trend data available
    }

    results.push({
      indicator_code: indicator.code,
      name_en: indicator.name_en,
      name_ar: indicator.name_ar,
      value: current.value,
      year: current.year,
      unit: indicator.unit,
      category: indicator.category,
      source_name: 'World Bank',
      source_url: `https://data.worldbank.org/indicator/${indicator.code}?locations=IQ`,
      global_rank: rank?.rank ?? null,
      total_countries: rank?.total ?? null,
      trend,
      previous_value: previousValue,
    })
  }

  return results
}
