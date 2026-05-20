import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { scrapeRssSources, scrapeTwitterViaRss } from '@/lib/scrapers/rss'
import { fetchAllWorldBankMetrics } from '@/lib/scrapers/worldbank'

// Vercel cron calls this with a secret header
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return run()
}

// Also allow manual POST trigger from admin
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return run()
}

async function run() {
  const admin = createAdminClient()
  const results = { news: 0, social: 0, metrics: 0, errors: [] as string[] }

  // 1. Scrape RSS news feeds
  try {
    const items = await scrapeRssSources()
    for (const item of items) {
      if (!item.source_url) continue
      await admin.from('scraped_items').upsert(
        {
          source_name: item.source_name,
          source_url: item.source_url,
          title_ar: item.title_ar,
          title_en: item.title_en,
          summary_ar: item.summary_ar,
          summary_en: item.summary_en,
          raw_content: item.raw_content,
          published_at: item.published_at,
          category: item.category,
          tags: item.tags,
          relevance_score: item.relevance_score,
          is_published: item.relevance_score >= 0.3,
        },
        { onConflict: 'source_url', ignoreDuplicates: true }
      )
      results.news++
    }
  } catch (e) {
    results.errors.push(`RSS: ${e}`)
  }

  // 2. Scrape Twitter for active officials with handles
  try {
    const { data: officials } = await admin
      .from('officials')
      .select('id, slug, twitter_handle')
      .eq('is_active', true)
      .not('twitter_handle', 'is', null)

    for (const official of officials ?? []) {
      if (!official.twitter_handle) continue
      const tweets = await scrapeTwitterViaRss(official.twitter_handle)
      for (const tweet of tweets) {
        if (!tweet.source_url) continue
        await admin.from('scraped_items').upsert(
          {
            ...tweet,
            official_id: official.id,
            is_published: true,
          },
          { onConflict: 'source_url', ignoreDuplicates: true }
        )
        results.social++
      }
    }
  } catch (e) {
    results.errors.push(`Twitter: ${e}`)
  }

  // 3. Fetch World Bank metrics for Iraq
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
        { onConflict: 'slug' }
      )
      results.metrics++
    }
  } catch (e) {
    results.errors.push(`WorldBank: ${e}`)
  }

  return NextResponse.json({
    ok: true,
    scraped_at: new Date().toISOString(),
    ...results,
  })
}
