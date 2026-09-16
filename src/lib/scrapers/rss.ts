import Parser from 'rss-parser'
import {
  RSS_SOURCES,
  GOVERNMENT_KEYWORDS_AR,
  GOVERNMENT_KEYWORDS_EN,
  FISCAL_KEYWORDS_AR,
  FISCAL_KEYWORDS_EN,
} from './sources'

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'AlMinbar/1.0 (Iraqi government accountability tracker)' },
})

export type ScrapedItem = {
  source_name: string
  source_url: string
  title_ar: string | null
  title_en: string | null
  summary_ar: string | null
  summary_en: string | null
  raw_content: string | null
  published_at: string | null
  category: string
  tags: string[]
  relevance_score: number
}

function scoreRelevance(text: string): number {
  const lower = text.toLowerCase()
  let score = 0
  for (const kw of GOVERNMENT_KEYWORDS_AR) {
    if (text.includes(kw)) score += 0.1
  }
  for (const kw of GOVERNMENT_KEYWORDS_EN) {
    if (lower.includes(kw)) score += 0.1
  }
  for (const kw of FISCAL_KEYWORDS_AR) {
    if (text.includes(kw)) score += 0.15
  }
  for (const kw of FISCAL_KEYWORDS_EN) {
    if (lower.includes(kw)) score += 0.15
  }
  return Math.min(score, 1)
}

export function extractTags(text: string): string[] {
  const tags: string[] = []
  const checks: [string, string][] = [
    ['الفساد', 'corruption'], ['الميزانية', 'budget'], ['الموازنة', 'budget'], ['النفط', 'oil'],
    ['الكهرباء', 'electricity'], ['البرلمان', 'parliament'], ['الحكومة', 'government'],
    ['الوزير', 'minister'], ['المالية', 'finance'], ['الأمن', 'security'],
    ['الاقتصاد', 'economy'], ['التعليم', 'education'], ['الصحة', 'healthcare'],
    ['العجز', 'fiscal'], ['الرواتب', 'finance'], ['الدينار', 'finance'],
    ['الضريبة', 'finance'], ['الاقتراض', 'fiscal'],
  ]
  for (const [ar, en] of checks) {
    if (text.includes(ar) || text.toLowerCase().includes(en)) tags.push(en)
  }
  const lower = text.toLowerCase()
  if (FISCAL_KEYWORDS_AR.some(k => text.includes(k)) || FISCAL_KEYWORDS_EN.some(k => lower.includes(k))) {
    tags.push('fiscal')
  }
  return [...new Set(tags)]
}

export async function scrapeRssSources(): Promise<ScrapedItem[]> {
  const perSource = await Promise.all(RSS_SOURCES.map(async source => {
    try {
      const feed = await parser.parseURL(source.url)
      const items: ScrapedItem[] = []
      for (const item of feed.items.slice(0, 20)) {
        const title = item.title || ''
        const summary = item.contentSnippet || item.summary || ''
        const fullText = `${title} ${summary}`
        const score = scoreRelevance(fullText)

        if (score < 0.1 && source.category === 'news') continue

        items.push({
          source_name: source.name_ar,
          source_url: item.link || '',
          title_ar: title || null,
          title_en: null,
          summary_ar: summary.slice(0, 500) || null,
          summary_en: null,
          raw_content: item.content?.slice(0, 2000) || null,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
          category: source.category,
          tags: extractTags(fullText),
          relevance_score: Math.round(score * 100) / 100,
        })
      }
      return items
    } catch {
      return [] as ScrapedItem[]
    }
  }))

  return perSource.flat()
}

// Nitter RSS for a Twitter handle (nitter is a public Twitter frontend with RSS)
export async function scrapeTwitterViaRss(handle: string): Promise<ScrapedItem[]> {
  const nitterInstances = [
    `https://nitter.privacydev.net/${handle}/rss`,
    `https://nitter.net/${handle}/rss`,
  ]

  for (const url of nitterInstances) {
    try {
      const feed = await parser.parseURL(url)
      return feed.items.slice(0, 10).map(item => ({
        source_name: `@${handle}`,
        source_url: item.link || `https://twitter.com/${handle}`,
        title_ar: null,
        title_en: item.title || null,
        summary_ar: null,
        summary_en: item.contentSnippet?.slice(0, 500) || null,
        raw_content: null,
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
        category: 'social_media',
        tags: ['twitter'],
        relevance_score: 0.9,
      }))
    } catch {
      continue
    }
  }

  return []
}
