import { buildFiscalFlags } from '../src/lib/scrapers/briefing'
import { matchOfficialId } from '../src/lib/scrapers/match'
import { extractTags } from '../src/lib/scrapers/rss'

let failed = 0
function assert(cond: boolean, msg: string) {
  if (!cond) {
    failed++
    console.error('FAIL', msg)
  } else {
    console.log('ok  ', msg)
  }
}

const flags = buildFiscalFlags({
  oilPrice: 58,
  salaryShare: 85,
  deficitUsd: 16e9,
  oilRevenueShare: 80,
  investmentShare: 4.4,
  failedKpis: 3,
  stalledKpis: 4,
  fiscalNews: 5,
})
const codes = flags.map(f => f.code)
assert(codes.includes('oil-below-breakeven'), 'oil below $65 is critical')
assert(codes.includes('h1-deficit'), 'H1 deficit flagged')
assert(codes.includes('salary-capture'), 'payroll capture flagged')
assert(codes.includes('no-2026-budget'), 'no-budget watch always present')
assert(flags.filter(f => f.severity === 'critical').length >= 3, 'multiple critical flags')

const officials = [
  { id: 'pm', slug: 'ali-al-zaidi', name_ar: 'علي فالح كاظم الزيدي', name_en: 'Ali Faleh al-Zaidi', role_type: 'prime_minister', ministry_ar: null, ministry_en: null },
  { id: 'fin', slug: 'faleh-sari', name_ar: 'فالح ساري', name_en: 'Falih al-Sari', role_type: 'minister', ministry_ar: 'وزارة المالية', ministry_en: 'Finance' },
]
assert(matchOfficialId('رئيس الوزراء الزيدي يعلن إصلاحاً', officials) === 'pm', 'matches PM aliases')
assert(matchOfficialId('Finance Minister Falih al-Sari on salaries', officials) === 'fin', 'matches finance minister')

const tags = extractTags('عجز الموازنة والرواتب والنفط budget deficit')
assert(tags.includes('fiscal'), 'fiscal tag extracted')
assert(tags.includes('budget'), 'budget tag extracted')
assert(tags.includes('oil'), 'oil tag extracted')

if (failed) {
  console.error(`\n${failed} failed`)
  process.exit(1)
}
console.log('\nall checks passed')
