import type { SupabaseClient } from '@supabase/supabase-js'
import { scrapeRssSources, scrapeTwitterViaRss } from './rss'
import { fetchAllWorldBankMetrics } from './worldbank'
import { fetchMarketFiscalMetrics } from './fiscal'
import { matchOfficialId, type MatchableOfficial } from './match'
import { seedGovernment } from './seed'
import { briefingSourceUrl, BRIEFING_SOURCE, buildFiscalBriefing } from './briefing'
import type { CountryMetric, KPI, ScrapedItem } from '@/lib/supabase/government'

export type ScrapePipelineResult = {
  seeded: boolean
  seed?: Awaited<ReturnType<typeof seedGovernment>>
  news: number
  social: number
  metrics: number
  briefing: boolean
  errors: string[]
}

async function upsertScraped(
  admin: SupabaseClient,
  item: Record<string, unknown>,
) {
  if (!item.source_url) return
  await admin.from('scraped_items').upsert(item, { onConflict: 'source_url', ignoreDuplicates: true })
}

export async function runScrapePipeline(admin: SupabaseClient): Promise<ScrapePipelineResult> {
  const results: ScrapePipelineResult = {
    seeded: false,
    news: 0,
    social: 0,
    metrics: 0,
    briefing: false,
    errors: [],
  }

  const { count } = await admin.from('officials').select('id', { count: 'exact', head: true })
  if ((count ?? 0) === 0) {
    try {
      results.seed = await seedGovernment(admin)
      results.seeded = true
      results.errors.push(...(results.seed.errors ?? []))
    } catch (e) {
      results.errors.push(`Seed: ${e}`)
    }
  }

  const { data: officialRows } = await admin
    .from('officials')
    .select('id, slug, name_ar, name_en, role_type, ministry_ar, ministry_en')
    .eq('is_active', true)
  const officials = (officialRows ?? []) as MatchableOfficial[]

  try {
    const items = await scrapeRssSources()
    await Promise.all(items.map(async item => {
      if (!item.source_url) return
      const blob = `${item.title_ar ?? ''} ${item.title_en ?? ''} ${item.summary_ar ?? ''} ${item.summary_en ?? ''}`
      const official_id = matchOfficialId(blob, officials)
      const fiscalBoost = item.tags.includes('fiscal') || item.tags.includes('budget') || item.tags.includes('oil')
      await upsertScraped(admin, {
        source_name: item.source_name,
        source_url: item.source_url,
        title_ar: item.title_ar,
        title_en: item.title_en,
        summary_ar: item.summary_ar,
        summary_en: item.summary_en,
        raw_content: item.raw_content,
        published_at: item.published_at,
        category: fiscalBoost ? 'decision' : item.category,
        tags: item.tags,
        relevance_score: item.relevance_score,
        official_id,
        is_published: item.relevance_score >= 0.3 || fiscalBoost,
      })
    }))
    results.news = items.filter(item => item.source_url).length
  } catch (e) {
    results.errors.push(`RSS: ${e}`)
  }

  try {
    const { data: twitterOfficials } = await admin
      .from('officials')
      .select('id, slug, twitter_handle')
      .eq('is_active', true)
      .not('twitter_handle', 'is', null)

    for (const official of twitterOfficials ?? []) {
      if (!official.twitter_handle) continue
      const tweets = await scrapeTwitterViaRss(official.twitter_handle)
      for (const tweet of tweets) {
        if (!tweet.source_url) continue
        await upsertScraped(admin, {
          ...tweet,
          official_id: official.id,
          is_published: true,
        })
        results.social++
      }
    }
  } catch (e) {
    results.errors.push(`Twitter: ${e}`)
  }

  try {
    const metrics = await fetchAllWorldBankMetrics()
    for (const m of metrics) {
      await admin.from('country_metrics').upsert(
        {
          slug: m.indicator_code?.toLowerCase().replace(/\./g, '-') ?? m.name_en.toLowerCase().replace(/\s+/g, '-'),
          indicator_code: m.indicator_code,
          name_en: m.name_en,
          name_ar: m.name_ar,
          value: m.value,
          unit: m.unit,
          year: m.year,
          category: m.category,
          source_name: m.source_name,
          source_url: m.source_url,
          global_rank: m.global_rank,
          total_countries: m.total_countries,
          trend: m.trend,
          previous_value: m.previous_value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'slug' },
      )
      results.metrics++
    }
  } catch (e) {
    results.errors.push(`WorldBank: ${e}`)
  }

  try {
    const market = await fetchMarketFiscalMetrics()
    for (const m of market) {
      await admin.from('country_metrics').upsert(
        {
          slug: m.slug,
          indicator_code: m.indicator_code,
          name_en: m.name_en,
          name_ar: m.name_ar,
          description_en: m.description_en,
          description_ar: m.description_ar,
          value: m.value,
          unit: m.unit,
          year: m.year,
          category: m.category,
          source_name: m.source_name,
          source_url: m.source_url,
          global_rank: m.global_rank,
          total_countries: m.total_countries,
          trend: m.trend,
          previous_value: m.previous_value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'slug' },
      )
      results.metrics++
    }
  } catch (e) {
    results.errors.push(`Market: ${e}`)
  }

  try {
    const [{ data: metrics }, { data: kpis }, { data: news }] = await Promise.all([
      admin.from('country_metrics').select('*'),
      admin.from('kpis').select('*'),
      admin.from('scraped_items').select('*').eq('is_published', true).order('published_at', { ascending: false }).limit(40),
    ])
    const briefing = buildFiscalBriefing({
      metrics: (metrics ?? []) as CountryMetric[],
      kpis: (kpis ?? []) as KPI[],
      news: (news ?? []) as ScrapedItem[],
    })
    const { error } = await admin.from('scraped_items').upsert(
      {
        source_name: BRIEFING_SOURCE,
        source_url: briefingSourceUrl(briefing.date_key),
        title_ar: briefing.title_ar,
        title_en: briefing.title_en,
        summary_ar: briefing.summary_ar,
        summary_en: briefing.summary_en,
        raw_content: `${briefing.body_ar}\n\n---\n\n${briefing.body_en}`,
        published_at: briefing.generated_at,
        category: 'decision',
        tags: ['briefing', 'fiscal', 'finance', 'budget'],
        relevance_score: 1,
        is_published: true,
        is_verified: true,
      },
      { onConflict: 'source_url' },
    )
    if (error) results.errors.push(`Briefing: ${error.message}`)
    else results.briefing = true
  } catch (e) {
    results.errors.push(`Briefing: ${e}`)
  }

  return results
}
