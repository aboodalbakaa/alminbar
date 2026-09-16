import type { SupabaseClient } from '@supabase/supabase-js'
import {
  SEED_CASES,
  SEED_KPIS,
  SEED_METRICS,
  SEED_OFFICIALS,
  SEED_SESSION,
} from './seed-data'

export type SeedResult = {
  officials: number
  session: boolean
  kpis: number
  metrics: number
  cases: number
  errors: string[]
}

export async function seedGovernment(admin: SupabaseClient): Promise<SeedResult> {
  const result: SeedResult = { officials: 0, session: false, kpis: 0, metrics: 0, cases: 0, errors: [] }

  for (const o of SEED_OFFICIALS) {
    const { error } = await admin.from('officials').upsert(
      {
        slug: o.slug,
        name_ar: o.name_ar,
        name_en: o.name_en,
        title_ar: o.title_ar,
        title_en: o.title_en,
        role_type: o.role_type,
        party_ar: o.party_ar,
        party_en: o.party_en,
        ministry_ar: o.ministry_ar,
        ministry_en: o.ministry_en,
        bio_ar: o.bio_ar,
        bio_en: o.bio_en,
        twitter_handle: o.twitter_handle,
        term_start: o.term_start,
        is_active: o.is_active,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' },
    )
    if (error) result.errors.push(`official ${o.slug}: ${error.message}`)
    else result.officials++
  }

  const { data: existingSession } = await admin
    .from('parliament_sessions')
    .select('id')
    .eq('term_number', SEED_SESSION.term_number)
    .eq('session_number', SEED_SESSION.session_number)
    .maybeSingle()

  if (!existingSession) {
    const { error } = await admin.from('parliament_sessions').insert(SEED_SESSION)
    if (error) result.errors.push(`session: ${error.message}`)
    else result.session = true
  } else {
    result.session = true
  }

  const { data: officials } = await admin.from('officials').select('id, slug')
  const idBySlug = new Map((officials ?? []).map(o => [o.slug as string, o.id as string]))

  const { data: existingKpis } = await admin.from('kpis').select('title_en, official_id')
  const kpiKeys = new Set((existingKpis ?? []).map(k => `${k.official_id}::${k.title_en}`))

  const { data: sessionRow } = await admin
    .from('parliament_sessions')
    .select('id')
    .eq('term_number', SEED_SESSION.term_number)
    .eq('session_number', SEED_SESSION.session_number)
    .maybeSingle()

  for (const k of SEED_KPIS) {
    const officialId = idBySlug.get(k.official_slug)
    if (!officialId) {
      result.errors.push(`kpi missing official ${k.official_slug}`)
      continue
    }
    if (kpiKeys.has(`${officialId}::${k.title_en}`)) continue
    const { error } = await admin.from('kpis').insert({
      official_id: officialId,
      session_id: sessionRow?.id ?? null,
      title_ar: k.title_ar,
      title_en: k.title_en,
      description_ar: k.description_ar,
      description_en: k.description_en,
      category: k.category,
      status: k.status,
      date_promised: k.date_promised,
      deadline: k.deadline,
      source_url: k.source_url,
      notes_ar: k.notes_ar ?? null,
      notes_en: k.notes_en ?? null,
    })
    if (error) result.errors.push(`kpi ${k.title_en}: ${error.message}`)
    else result.kpis++
  }

  for (const m of SEED_METRICS) {
    const { error } = await admin.from('country_metrics').upsert(
      {
        slug: m.slug,
        name_ar: m.name_ar,
        name_en: m.name_en,
        description_ar: m.description_ar,
        description_en: m.description_en,
        value: m.value,
        unit: m.unit,
        year: m.year,
        global_rank: m.global_rank ?? null,
        total_countries: m.total_countries ?? null,
        previous_value: m.previous_value ?? null,
        trend: m.trend ?? null,
        category: m.category,
        source_name: m.source_name,
        source_url: m.source_url,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' },
    )
    if (error) result.errors.push(`metric ${m.slug}: ${error.message}`)
    else result.metrics++
  }

  const { data: existingCases } = await admin.from('corruption_cases').select('title_en')
  const caseTitles = new Set((existingCases ?? []).map(c => c.title_en as string))

  for (const c of SEED_CASES) {
    if (caseTitles.has(c.title_en)) continue
    const officialId = c.official_slug ? idBySlug.get(c.official_slug) ?? null : null
    const { error } = await admin.from('corruption_cases').insert({
      official_id: officialId,
      title_ar: c.title_ar,
      title_en: c.title_en,
      description_ar: c.description_ar,
      description_en: c.description_en,
      amount_usd: c.amount_usd,
      date_reported: c.date_reported,
      source_urls: c.source_urls,
      status: c.status,
      evidence_level: c.evidence_level,
      case_type: c.case_type,
      is_published: c.is_published,
    })
    if (error) result.errors.push(`case ${c.title_en}: ${error.message}`)
    else result.cases++
  }

  return result
}
