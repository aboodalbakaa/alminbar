export type MatchableOfficial = {
  id: string
  slug: string
  name_ar: string
  name_en: string
  role_type: string
  ministry_ar: string | null
  ministry_en: string | null
}

const PM_ALIASES = ['الزيدي', 'الزعيدي', 'ali al-zaidi', 'ali al zaidi', 'al-zaidi', 'al zaidi', 'رئيس الوزراء', 'prime minister']
const FINANCE_ALIASES = ['فالح ساري', 'فالح الساري', 'faleh sari', 'falih sari', 'falih al-sari', 'وزير المالية', 'finance minister']
const OIL_ALIASES = ['باسم محمد', 'وزير النفط', 'oil minister', 'وزارة النفط']
const SPEAKER_ALIASES = ['الحلبوسي', 'haibat', 'halbousi', 'رئيس البرلمان', 'speaker']

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some(n => haystack.includes(n))
}

/** Attach a scraped item to the most specific official mentioned in title/summary. */
export function matchOfficialId(text: string, officials: MatchableOfficial[]): string | null {
  if (!text || officials.length === 0) return null
  const lower = text.toLowerCase()

  for (const o of officials) {
    if (o.name_ar && text.includes(o.name_ar)) return o.id
    if (o.name_en && lower.includes(o.name_en.toLowerCase())) return o.id
  }

  const pm = officials.find(o => o.role_type === 'prime_minister')
  if (pm && includesAny(lower, PM_ALIASES.map(a => a.toLowerCase()))) return pm.id

  const finance = officials.find(o => o.slug === 'faleh-sari' || o.ministry_en === 'Finance')
  if (finance && includesAny(lower, FINANCE_ALIASES.map(a => a.toLowerCase()))) return finance.id

  const oil = officials.find(o => o.slug === 'basim-mohammed' || o.ministry_en === 'Oil')
  if (oil && includesAny(lower, OIL_ALIASES.map(a => a.toLowerCase()))) return oil.id

  const speaker = officials.find(o => o.role_type === 'speaker')
  if (speaker && includesAny(lower, SPEAKER_ALIASES.map(a => a.toLowerCase()))) return speaker.id

  for (const o of officials) {
    if (o.ministry_ar && text.includes(o.ministry_ar)) return o.id
    if (o.ministry_en && lower.includes(o.ministry_en.toLowerCase())) return o.id
  }

  return null
}
