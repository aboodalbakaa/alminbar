'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin') throw new Error('Unauthorized')
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ─── Officials ─────────────────────────────────────────────────────────────────

export async function createOfficial(formData: FormData) {
  await requireAdmin()
  const admin = createAdminClient()

  const nameEn = formData.get('name_en') as string
  const slug = formData.get('slug') as string || slugify(nameEn)

  const { error } = await admin.from('officials').insert({
    slug,
    name_ar: formData.get('name_ar') as string,
    name_en: nameEn,
    title_ar: formData.get('title_ar') as string,
    title_en: formData.get('title_en') as string,
    role_type: formData.get('role_type') as string,
    party_ar: formData.get('party_ar') || null,
    party_en: formData.get('party_en') || null,
    ministry_ar: formData.get('ministry_ar') || null,
    ministry_en: formData.get('ministry_en') || null,
    photo_url: formData.get('photo_url') || null,
    bio_ar: formData.get('bio_ar') || null,
    bio_en: formData.get('bio_en') || null,
    twitter_handle: formData.get('twitter_handle') || null,
    facebook_url: formData.get('facebook_url') || null,
    instagram_url: formData.get('instagram_url') || null,
    term_start: formData.get('term_start') || null,
    term_end: formData.get('term_end') || null,
    is_active: formData.get('is_active') === 'on',
  })

  if (error) throw new Error(error.message)
  revalidatePath('/government')
  redirect(`/ar/admin/government`)
}

export async function updateOfficial(formData: FormData) {
  await requireAdmin()
  const admin = createAdminClient()
  const id = formData.get('id') as string

  const { error } = await admin.from('officials').update({
    name_ar: formData.get('name_ar') as string,
    name_en: formData.get('name_en') as string,
    title_ar: formData.get('title_ar') as string,
    title_en: formData.get('title_en') as string,
    role_type: formData.get('role_type') as string,
    party_ar: formData.get('party_ar') || null,
    party_en: formData.get('party_en') || null,
    ministry_ar: formData.get('ministry_ar') || null,
    ministry_en: formData.get('ministry_en') || null,
    photo_url: formData.get('photo_url') || null,
    bio_ar: formData.get('bio_ar') || null,
    bio_en: formData.get('bio_en') || null,
    twitter_handle: formData.get('twitter_handle') || null,
    facebook_url: formData.get('facebook_url') || null,
    instagram_url: formData.get('instagram_url') || null,
    term_start: formData.get('term_start') || null,
    term_end: formData.get('term_end') || null,
    is_active: formData.get('is_active') === 'on',
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/government')
  redirect(`/ar/admin/government`)
}

export async function deleteOfficial(formData: FormData) {
  await requireAdmin()
  const id = formData.get('id') as string
  await createAdminClient().from('officials').delete().eq('id', id)
  revalidatePath('/government')
  redirect(`/ar/admin/government`)
}

// ─── KPIs ───────────────────────────────────────────────────────────────────────

export async function createKpi(formData: FormData) {
  await requireAdmin()
  const admin = createAdminClient()

  const { error } = await admin.from('kpis').insert({
    official_id: formData.get('official_id') as string,
    session_id: formData.get('session_id') || null,
    title_ar: formData.get('title_ar') as string,
    title_en: formData.get('title_en') as string,
    description_ar: formData.get('description_ar') || null,
    description_en: formData.get('description_en') || null,
    category: formData.get('category') as string,
    status: formData.get('status') as string,
    date_promised: formData.get('date_promised') || null,
    deadline: formData.get('deadline') || null,
    source_url: formData.get('source_url') || null,
    evidence_url: formData.get('evidence_url') || null,
    notes_ar: formData.get('notes_ar') || null,
    notes_en: formData.get('notes_en') || null,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/government')
  redirect(`/ar/admin/government`)
}

export async function updateKpiStatus(formData: FormData) {
  await requireAdmin()
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  await createAdminClient().from('kpis').update({
    status,
    completion_date: status === 'achieved' ? new Date().toISOString().split('T')[0] : null,
    updated_at: new Date().toISOString(),
  }).eq('id', id)
  revalidatePath('/government')
  redirect(`/ar/admin/government`)
}

// ─── Corruption Cases ──────────────────────────────────────────────────────────

export async function createCorruptionCase(formData: FormData) {
  await requireAdmin()
  const admin = createAdminClient()

  const sourceUrlsRaw = (formData.get('source_urls') as string) || ''
  const source_urls = sourceUrlsRaw.split('\n').map(s => s.trim()).filter(Boolean)

  const { error } = await admin.from('corruption_cases').insert({
    official_id: formData.get('official_id') || null,
    title_ar: formData.get('title_ar') as string,
    title_en: formData.get('title_en') as string,
    description_ar: formData.get('description_ar') as string,
    description_en: formData.get('description_en') as string,
    amount_usd: formData.get('amount_usd') ? parseInt(formData.get('amount_usd') as string) : null,
    date_reported: formData.get('date_reported') || null,
    date_occurred: formData.get('date_occurred') || null,
    source_urls,
    status: formData.get('status') as string,
    evidence_level: formData.get('evidence_level') as string,
    case_type: formData.get('case_type') as string,
    is_published: formData.get('is_published') === 'on',
  })

  if (error) throw new Error(error.message)
  revalidatePath('/government/corruption')
  redirect(`/ar/admin/government`)
}

// ─── Parliament Sessions ───────────────────────────────────────────────────────

export async function createSession(formData: FormData) {
  await requireAdmin()
  const admin = createAdminClient()

  const { error } = await admin.from('parliament_sessions').insert({
    session_number: parseInt(formData.get('session_number') as string),
    term_number: parseInt(formData.get('term_number') as string) || 5,
    title_ar: formData.get('title_ar') as string,
    title_en: formData.get('title_en') as string,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') || null,
    status: formData.get('status') as string,
    laws_passed: parseInt(formData.get('laws_passed') as string) || 0,
    sessions_held: parseInt(formData.get('sessions_held') as string) || 0,
    attendance_rate: formData.get('attendance_rate') ? parseFloat(formData.get('attendance_rate') as string) : null,
    description_ar: formData.get('description_ar') || null,
    description_en: formData.get('description_en') || null,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/government/parliament')
  redirect(`/ar/admin/government`)
}

export async function updateSession(formData: FormData) {
  await requireAdmin()
  const id = formData.get('id') as string
  await createAdminClient().from('parliament_sessions').update({
    laws_passed: parseInt(formData.get('laws_passed') as string) || 0,
    sessions_held: parseInt(formData.get('sessions_held') as string) || 0,
    attendance_rate: formData.get('attendance_rate') ? parseFloat(formData.get('attendance_rate') as string) : null,
    status: formData.get('status') as string,
    end_date: formData.get('end_date') || null,
  }).eq('id', id)
  revalidatePath('/government/parliament')
  redirect(`/ar/admin/government`)
}

// ─── Scraped News ──────────────────────────────────────────────────────────────

export async function publishScrapedItem(formData: FormData) {
  await requireAdmin()
  const id = formData.get('id') as string

  await createAdminClient().from('scraped_items').update({
    official_id: formData.get('official_id') || null,
    title_en: formData.get('title_en') || null,
    summary_en: formData.get('summary_en') || null,
    is_published: true,
    is_verified: formData.get('is_verified') === 'on',
    category: formData.get('category') as string,
  }).eq('id', id)

  revalidatePath('/government')
  redirect(`/ar/admin/government`)
}

export async function discardScrapedItem(formData: FormData) {
  await requireAdmin()
  const id = formData.get('id') as string
  await createAdminClient().from('scraped_items').delete().eq('id', id)
  redirect(`/ar/admin/government`)
}

// ─── Country Metrics (manual entry) ───────────────────────────────────────────

export async function upsertMetric(formData: FormData) {
  await requireAdmin()
  const admin = createAdminClient()
  const slug = formData.get('slug') as string

  const { error } = await admin.from('country_metrics').upsert({
    slug,
    name_ar: formData.get('name_ar') as string,
    name_en: formData.get('name_en') as string,
    description_ar: formData.get('description_ar') || null,
    description_en: formData.get('description_en') || null,
    value: formData.get('value') ? parseFloat(formData.get('value') as string) : null,
    unit: formData.get('unit') as string,
    year: parseInt(formData.get('year') as string),
    global_rank: formData.get('global_rank') ? parseInt(formData.get('global_rank') as string) : null,
    total_countries: formData.get('total_countries') ? parseInt(formData.get('total_countries') as string) : null,
    previous_value: formData.get('previous_value') ? parseFloat(formData.get('previous_value') as string) : null,
    previous_rank: formData.get('previous_rank') ? parseInt(formData.get('previous_rank') as string) : null,
    trend: formData.get('trend') || null,
    category: formData.get('category') as string,
    source_name: formData.get('source_name') as string,
    source_url: formData.get('source_url') as string,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'slug' })

  if (error) throw new Error(error.message)
  revalidatePath('/government/metrics')
  redirect(`/ar/admin/government`)
}
