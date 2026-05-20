import 'server-only'
import { createAdminClient } from './admin'

// ─── Types ───────────────────────────────────────────────────────────────────

export type Official = {
  id: string
  slug: string
  name_ar: string
  name_en: string
  title_ar: string
  title_en: string
  role_type: 'prime_minister' | 'deputy_pm' | 'minister' | 'mp' | 'speaker' | 'other'
  party_ar: string | null
  party_en: string | null
  ministry_ar: string | null
  ministry_en: string | null
  photo_url: string | null
  bio_ar: string | null
  bio_en: string | null
  twitter_handle: string | null
  facebook_url: string | null
  term_start: string | null
  is_active: boolean
}

export type KPI = {
  id: string
  official_id: string
  title_ar: string
  title_en: string
  description_ar: string | null
  description_en: string | null
  category: string
  status: 'promised' | 'in_progress' | 'achieved' | 'failed' | 'abandoned' | 'stalled'
  date_promised: string | null
  deadline: string | null
  source_url: string | null
}

export type ScrapedItem = {
  id: string
  official_id: string | null
  source_name: string
  source_url: string
  title_ar: string | null
  title_en: string | null
  summary_ar: string | null
  summary_en: string | null
  published_at: string | null
  category: string
  tags: string[]
  relevance_score: number
}

export type CorruptionCase = {
  id: string
  official_id: string | null
  title_ar: string
  title_en: string
  description_ar: string
  description_en: string
  amount_usd: number | null
  date_reported: string | null
  source_urls: string[]
  status: string
  evidence_level: string
  case_type: string
}

export type CountryMetric = {
  id: string
  slug: string
  indicator_code: string | null
  name_ar: string
  name_en: string
  description_ar: string | null
  description_en: string | null
  value: number | null
  unit: string
  year: number
  global_rank: number | null
  total_countries: number | null
  previous_value: number | null
  previous_rank: number | null
  trend: 'up' | 'down' | 'stable' | null
  category: string
  source_name: string
  source_url: string
}

export type ParliamentSession = {
  id: string
  session_number: number
  term_number: number
  title_ar: string
  title_en: string
  start_date: string
  end_date: string | null
  status: string
  laws_passed: number
  sessions_held: number
  attendance_rate: number | null
  description_ar: string | null
  description_en: string | null
}

// ─── Officials ────────────────────────────────────────────────────────────────

export async function getAllOfficials(): Promise<Official[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('officials')
    .select('*')
    .eq('is_active', true)
    .order('role_type')
  return data ?? []
}

export async function getOfficialBySlug(slug: string): Promise<Official | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('officials')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  return data
}

// ─── KPIs ─────────────────────────────────────────────────────────────────────

export async function getKpisByOfficial(officialId: string): Promise<KPI[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('kpis')
    .select('*')
    .eq('official_id', officialId)
    .order('date_promised', { ascending: false })
  return data ?? []
}

export async function getAllKpis(): Promise<KPI[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('kpis')
    .select('*, officials(name_ar, name_en, slug)')
    .order('created_at', { ascending: false })
  return data ?? []
}

// ─── Scraped News ─────────────────────────────────────────────────────────────

export async function getRecentNews(limit = 20): Promise<ScrapedItem[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('scraped_items')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getNewsByOfficial(officialId: string, limit = 10): Promise<ScrapedItem[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('scraped_items')
    .select('*')
    .eq('official_id', officialId)
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

// ─── Corruption Cases ─────────────────────────────────────────────────────────

export async function getPublishedCorruptionCases(): Promise<CorruptionCase[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('corruption_cases')
    .select('*, officials(name_ar, name_en, slug, photo_url)')
    .eq('is_published', true)
    .order('date_reported', { ascending: false })
  return data ?? []
}

export async function getCorruptionByOfficial(officialId: string): Promise<CorruptionCase[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('corruption_cases')
    .select('*')
    .eq('official_id', officialId)
    .eq('is_published', true)
    .order('date_reported', { ascending: false })
  return data ?? []
}

// ─── Country Metrics ──────────────────────────────────────────────────────────

export async function getCountryMetrics(): Promise<CountryMetric[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('country_metrics')
    .select('*')
    .order('category')
    .order('name_en')
  return data ?? []
}

export async function getMetricBySlug(slug: string): Promise<CountryMetric | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('country_metrics')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  return data
}

// ─── Parliament ───────────────────────────────────────────────────────────────

export async function getCurrentSession(): Promise<ParliamentSession | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('parliament_sessions')
    .select('*')
    .eq('status', 'active')
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data
}

export async function getAllSessions(): Promise<ParliamentSession[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('parliament_sessions')
    .select('*')
    .order('start_date', { ascending: false })
  return data ?? []
}

// ─── KPI stats for a given official ──────────────────────────────────────────

export function calcKpiStats(kpis: KPI[]) {
  const total = kpis.length
  const achieved = kpis.filter(k => k.status === 'achieved').length
  const failed = kpis.filter(k => k.status === 'failed' || k.status === 'abandoned').length
  const inProgress = kpis.filter(k => k.status === 'in_progress').length
  const stalled = kpis.filter(k => k.status === 'stalled').length
  const rate = total > 0 ? Math.round((achieved / total) * 100) : 0
  return { total, achieved, failed, inProgress, stalled, rate }
}
