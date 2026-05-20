import Parser from 'rss-parser'
import { RSS_SOURCES, GOVERNMENT_KEYWORDS_AR, GOVERNMENT_KEYWORDS_EN } from './sources'

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
  return Math.min(score, 1)
}

function extractTags(text: string): string[] {
  const tags: string[] = []
  const checks: [string, string][] = [
    ['الفساد', 'corruption'], ['الميزانية', 'budget'], ['النفط', 'oil'],
    ['الكهرباء', 'electricity'], ['البرلمان', 'parliament'], ['الحكومة', 'government'],
    ['الوزير', 'minister'], ['المالية', 'finance'], ['الأمن', 'security'],
    ['الاقتصاد', 'economy'], ['التعليم', 'education'], ['الصحة', 'healthcare'],
  ]
  for (const [ar, en] of checks) {
    if (text.includes(ar) || text.toLowerCase().includes(en)) tags.push(en)
  }
  return [...new Set(tags)]
}

export async function scrapeRssSources(): Promise<ScrapedItem[]> {
  const results: ScrapedItem[] = []

  for (const source of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url)
      for (const item of feed.items.slice(0, 20)) {
        const title = item.title || ''
        const summary = item.contentSnippet || item.summary || ''
        const fullText = `${title} ${summary}`
        const score = scoreRelevance(fullText)

        // Only keep items with some relevance to government
        if (score < 0.1 && source.category === 'news') continue

        results.push({
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
    } catch {
      // Source unavailable — skip silently, continue with others
    }
  }

  return results
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
