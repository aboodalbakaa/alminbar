import { notFound } from 'next/navigation'
import Link from 'next/link'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { getAllSessions, getCurrentSession } from '@/lib/supabase/government'
import { SeatChart } from './_components/SeatChart'

export const dynamic = 'force-dynamic'

// ─── Static data: Governorates ───────────────────────────────────────────────

const GOVERNORATES = [
  { name_en: 'Baghdad',       name_ar: 'بغداد',         region: 'central', pop: '8.1M', governor_en: 'Ahmad Hamid Zidan',     governor_ar: 'أحمد حميد زيدان',       party_en: 'State of Law',       party_ar: 'دولة القانون',        color: '#EF4444' },
  { name_en: 'Basra',         name_ar: 'البصرة',        region: 'south',   pop: '2.8M', governor_en: 'Asaad al-Eidani',       governor_ar: 'أسعد العيداني',         party_en: 'Fatah / Badr',       party_ar: 'الفتح / بدر',         color: '#F59E0B' },
  { name_en: 'Nineveh',       name_ar: 'نينوى',         region: 'north',   pop: '3.3M', governor_en: 'Najm al-Jubouri',       governor_ar: 'نجم الجبوري',           party_en: 'Independent',        party_ar: 'مستقل',               color: '#94A3B8' },
  { name_en: 'Anbar',         name_ar: 'الأنبار',       region: 'west',    pop: '1.9M', governor_en: 'Ali Farhan al-Dulaimy', governor_ar: 'علي فرحان الدليمي',     party_en: 'Azm Alliance',       party_ar: 'تحالف عزم',          color: '#6366F1' },
  { name_en: 'Diyala',        name_ar: 'ديالى',         region: 'central', pop: '1.8M', governor_en: 'Muayad al-Qaisi',      governor_ar: 'مؤيد القيسي',           party_en: 'State of Law',       party_ar: 'دولة القانون',        color: '#EF4444' },
  { name_en: 'Kirkuk',        name_ar: 'كركوك',         region: 'north',   pop: '1.6M', governor_en: 'Rakan Saeed al-Jubouri',governor_ar: 'ركان سعيد الجبوري',    party_en: 'Sunni / Disputed',   party_ar: 'سني / متنازع عليه',  color: '#94A3B8' },
  { name_en: 'Salah al-Din',  name_ar: 'صلاح الدين',   region: 'north',   pop: '1.5M', governor_en: 'Ammar Khalaf',         governor_ar: 'عمار خلف',              party_en: 'Sunni Coalition',    party_ar: 'التحالف السني',       color: '#3B82F6' },
  { name_en: 'Babil',         name_ar: 'بابل',          region: 'central', pop: '2.0M', governor_en: 'Hassan Mandalawi',     governor_ar: 'حسن الأسدي',            party_en: 'Coord. Framework',   party_ar: 'الإطار التنسيقي',    color: '#EF4444' },
  { name_en: 'Karbala',       name_ar: 'كربلاء',        region: 'central', pop: '1.3M', governor_en: 'Nassif Jassim',        governor_ar: 'ناصف جاسم',             party_en: 'Shia Coalition',     party_ar: 'الائتلاف الشيعي',    color: '#EF4444' },
  { name_en: 'Najaf',         name_ar: 'النجف',         region: 'central', pop: '1.4M', governor_en: 'Louay al-Yasiri',      governor_ar: 'لؤي الياسري',           party_en: 'Shia Coalition',     party_ar: 'الائتلاف الشيعي',    color: '#EF4444' },
  { name_en: 'Qadisiyah',     name_ar: 'القادسية',      region: 'south',   pop: '1.3M', governor_en: 'Ali Dawai',            governor_ar: 'علي دواي',              party_en: 'Shia Coalition',     party_ar: 'الائتلاف الشيعي',    color: '#EF4444' },
  { name_en: 'Dhi Qar',       name_ar: 'ذي قار',        region: 'south',   pop: '2.0M', governor_en: 'Mohammed al-Ghazzi',   governor_ar: 'محمد الغزي',            party_en: 'Imtidad',            party_ar: 'امتداد',              color: '#14B8A6' },
  { name_en: 'Maysan',        name_ar: 'ميسان',         region: 'south',   pop: '1.2M', governor_en: 'Ahmed Manhal',         governor_ar: 'أحمد منهل',             party_en: 'Shia Coalition',     party_ar: 'الائتلاف الشيعي',    color: '#EF4444' },
  { name_en: 'Muthanna',      name_ar: 'المثنى',        region: 'south',   pop: '0.9M', governor_en: 'Ali Dawood',           governor_ar: 'علي داوود',             party_en: 'Shia Coalition',     party_ar: 'الائتلاف الشيعي',    color: '#EF4444' },
  { name_en: 'Wasit',         name_ar: 'واسط',          region: 'central', pop: '1.5M', governor_en: 'Mohammed Jameel',      governor_ar: 'محمد جميل',             party_en: 'Shia Coalition',     party_ar: 'الائتلاف الشيعي',    color: '#EF4444' },
  { name_en: 'Erbil',         name_ar: 'أربيل',         region: 'kurdistan', pop: '2.0M', governor_en: 'Omar Nuri Mustafa', governor_ar: 'عمر نوري مصطفى',         party_en: 'KDP',                party_ar: 'الحزب الديمقراطي الكردستاني', color: '#8B5CF6' },
  { name_en: 'Sulaymaniyah',  name_ar: 'السليمانية',    region: 'kurdistan', pop: '2.2M', governor_en: 'Haval Abu Bakr',    governor_ar: 'هافال أبو بكر',          party_en: 'PUK',                party_ar: 'الاتحاد الوطني الكردستاني', color: '#06B6D4' },
  { name_en: 'Dohuk',         name_ar: 'دهوك',          region: 'kurdistan', pop: '1.3M', governor_en: 'Ali Tatar',         governor_ar: 'علي تاتار',              party_en: 'KDP',                party_ar: 'الحزب الديمقراطي الكردستاني', color: '#8B5CF6' },
]

const REGION_LABEL: Record<string, { en: string; ar: string }> = {
  central:   { en: 'Central',   ar: 'وسط' },
  south:     { en: 'South',     ar: 'جنوب' },
  north:     { en: 'North',     ar: 'شمال' },
  west:      { en: 'West',      ar: 'غرب' },
  kurdistan: { en: 'Kurdistan', ar: 'إقليم كردستان' },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ParliamentPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const isAr = locale === 'ar'

  const [currentSession, allSessions] = await Promise.all([
    getCurrentSession(),
    getAllSessions(),
  ])

  return (
    <div className="min-h-[100dvh]" style={{ backgroundColor: '#F9FAFB', fontFamily: 'var(--font-body)' }} dir={isAr ? 'rtl' : 'ltr'}>

      {/* ─── HERO ──────────────────────────────────────────────────────── */}
      <section className="bg-navy">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-14">
          <Link href={`/${locale}/government`} className="text-gold/60 hover:text-gold text-xs uppercase tracking-widest transition-colors block mb-6">
            {isAr ? '← الحكومة' : '← Government'}
          </Link>

          <div className={`flex flex-wrap items-end justify-between gap-6 mb-10 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div>
              <p className={`text-gold text-[10px] uppercase tracking-[0.2em] mb-3 ${isAr ? 'font-arabic text-xs normal-case tracking-normal' : ''}`}>
                {isAr ? 'مجلس النواب العراقي · الدورة الخامسة · 2021' : 'Iraqi Council of Representatives · 5th Term · 2021'}
              </p>
              <h1 className={`text-white font-bold leading-tight tracking-tight ${isAr ? 'font-arabic text-3xl md:text-4xl' : 'text-3xl md:text-5xl'}`}>
                {isAr ? 'خريطة المقاعد البرلمانية' : 'Parliament Seat Map'}
              </h1>
              <p className={`text-white/40 mt-2 text-base max-w-xl ${isAr ? 'font-arabic text-right' : ''}`}>
                {isAr
                  ? '329 مقعداً، 18 محافظة، 40+ حزباً — من يمسك بزمام القرار؟'
                  : '329 seats, 18 provinces, 40+ parties — mapping who holds the balance of power.'}
              </p>
            </div>

            {/* 3 key stats */}
            <div className={`flex gap-px rounded-xl overflow-hidden border border-white/10 ${isAr ? 'flex-row-reverse' : ''}`}>
              {[
                { v: '329', label: isAr ? 'مقعد إجمالي' : 'total seats' },
                { v: currentSession?.laws_passed ?? '—', label: isAr ? 'قانون أُقرَّ' : 'laws passed' },
                { v: currentSession?.attendance_rate ? `${currentSession.attendance_rate}%` : '—', label: isAr ? 'معدل الحضور' : 'attendance' },
              ].map(s => (
                <div key={String(s.label)} className="bg-white/5 px-6 py-4">
                  <div className="font-mono text-2xl font-bold text-white">{String(s.v)}</div>
                  <div className={`text-white/40 text-[10px] mt-1 uppercase tracking-wide ${isAr ? 'font-arabic text-xs normal-case tracking-normal' : ''}`}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-16">

        {/* ─── INTERACTIVE SEAT CHART ────────────────────────────────────── */}
        <section>
          <div className={`flex items-center justify-between mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
            <h2 className={`text-[#18181B] font-bold text-xl tracking-tight ${isAr ? 'font-arabic' : ''}`}>
              {isAr ? 'توزيع المقاعد — انقر لتصفية' : 'Seat Distribution — click to filter'}
            </h2>
            <span className={`text-xs text-[#94A3B8] ${isAr ? 'font-arabic' : ''}`}>
              {isAr ? 'نتائج انتخابات أكتوبر 2021' : 'October 2021 election results'}
            </span>
          </div>
          <SeatChart isAr={isAr} />
        </section>

        {/* ─── SADRIST NOTE ──────────────────────────────────────────────── */}
        <div className="rounded-xl p-5 flex gap-4 items-start" style={{ backgroundColor: '#10B98115', border: '1px solid #10B98140' }}>
          <span className="text-2xl flex-shrink-0">⚠</span>
          <div>
            <div className={`font-semibold text-[#065F46] mb-1 ${isAr ? 'font-arabic' : 'tracking-tight'}`}>
              {isAr ? 'الانسحاب الصدري — أغسطس 2022' : 'Sadrist Withdrawal — August 2022'}
            </div>
            <p className={`text-[#065F46]/70 text-sm leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
              {isAr
                ? 'في أغسطس 2022، أعلن التيار الصدري (73 مقعداً) استقالة جميع نوابه احتجاجاً على تشكيل الحكومة. ملأ الإطار التنسيقي الفراغ بتشكيل حكومة السوداني ومن بعده الزيدي. المقاعد الصدرية شُغلت بالمرشحين التاليين في القوائم.'
                : 'In August 2022, the Sadrist Movement (73 seats) resigned en masse, protesting the government formation process. The Coordination Framework filled the vacuum by forming the al-Sudani government, then al-Zaidi\'s. Sadrist seats were filled by runners-up from their election lists.'}
            </p>
          </div>
        </div>

        {/* ─── CURRENT SESSION ───────────────────────────────────────────── */}
        {currentSession && (
          <section>
            <h2 className={`text-[#18181B] font-bold text-xl tracking-tight mb-6 ${isAr ? 'font-arabic' : ''}`}>
              {isAr ? 'الدورة البرلمانية الحالية' : 'Current Parliamentary Session'}
            </h2>
            <div className="rounded-2xl overflow-hidden" style={{ background: '#1B2A4A', boxShadow: '0 20px 40px -15px rgba(27,42,74,0.25)' }}>
              <div className={`p-8 flex flex-wrap items-start justify-between gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div>
                  <div className="text-gold text-[10px] uppercase tracking-[0.2em] mb-2">
                    {isAr ? 'الدورة النشطة' : 'Active Session'}
                  </div>
                  <h3 className={`text-white font-bold text-2xl tracking-tight ${isAr ? 'font-arabic' : ''}`}>
                    {isAr ? currentSession.title_ar : currentSession.title_en}
                  </h3>
                  <p className="text-white/40 text-sm font-mono mt-1">
                    {new Date(currentSession.start_date).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <span className="bg-emerald-400/20 text-emerald-400 text-xs px-3 py-1 rounded-full font-semibold tracking-wide uppercase">
                  {isAr ? 'نشطة' : 'Active'}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10 border-t border-white/10">
                {[
                  { label: isAr ? 'قوانين أُقرَّت' : 'Laws Passed',    value: currentSession.laws_passed ?? 0 },
                  { label: isAr ? 'جلسات عُقدت'   : 'Sessions Held',   value: currentSession.sessions_held ?? 0 },
                  { label: isAr ? 'معدل الحضور'    : 'Attendance Rate', value: currentSession.attendance_rate ? `${currentSession.attendance_rate}%` : '—' },
                  { label: isAr ? 'الدورة رقم'     : 'Term No.',        value: `#${currentSession.term_number}` },
                ].map(s => (
                  <div key={s.label} className={`px-6 py-5 ${isAr ? 'text-right' : ''}`}>
                    <div className="text-white/40 text-[10px] uppercase tracking-wide mb-1">{s.label}</div>
                    <div className="font-mono text-white text-2xl font-bold">{String(s.value)}</div>
                  </div>
                ))}
              </div>
              {(isAr ? currentSession.description_ar : currentSession.description_en) && (
                <div className="px-8 py-5 border-t border-white/10">
                  <p className={`text-white/40 text-sm leading-relaxed ${isAr ? 'font-arabic text-right' : ''}`}>
                    {isAr ? currentSession.description_ar : currentSession.description_en}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ─── GOVERNORATES ──────────────────────────────────────────────── */}
        <section>
          <div className={`flex items-end justify-between mb-6 gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div>
              <h2 className={`text-[#18181B] font-bold text-xl tracking-tight ${isAr ? 'font-arabic' : ''}`}>
                {isAr ? 'المحافظات والمحافظون' : 'Governorates & Governors'}
              </h2>
              <p className={`text-[#71717A] text-sm mt-1 ${isAr ? 'font-arabic' : ''}`}>
                {isAr ? '18 محافظة — من يسيطر على الحكم المحلي؟' : '18 provinces — who controls local governance?'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {GOVERNORATES.map(g => (
              <div key={g.name_en}
                className="rounded-xl bg-white p-4 flex items-center gap-3 transition-all"
                style={{ border: '1px solid rgba(226,232,240,0.6)', boxShadow: '0 2px 8px -4px rgba(0,0,0,0.04)' }}>

                <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: g.color }} />

                <div className={`flex-1 min-w-0 ${isAr ? 'text-right' : ''}`}>
                  <div className={`flex items-center gap-2 mb-0.5 ${isAr ? 'flex-row-reverse justify-end' : ''}`}>
                    <span className={`font-semibold text-[#18181B] text-sm ${isAr ? 'font-arabic' : 'tracking-tight'}`}>
                      {isAr ? g.name_ar : g.name_en}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded text-[#94A3B8] bg-slate-100">
                      {isAr ? REGION_LABEL[g.region].ar : REGION_LABEL[g.region].en}
                    </span>
                  </div>
                  <div className={`text-[#71717A] text-xs ${isAr ? 'font-arabic' : ''}`}>
                    {isAr ? g.governor_ar : g.governor_en}
                  </div>
                </div>

                <div className={`flex flex-col items-end gap-1 flex-shrink-0 ${isAr ? 'items-start' : ''}`}>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: g.color + '20', color: g.color }}>
                    {isAr ? g.party_ar : g.party_en}
                  </span>
                  <span className="font-mono text-[10px] text-[#94A3B8]">{g.pop}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SESSION HISTORY ───────────────────────────────────────────── */}
        {allSessions.length > 1 && (
          <section>
            <h2 className={`text-[#18181B] font-bold text-xl tracking-tight mb-6 ${isAr ? 'font-arabic' : ''}`}>
              {isAr ? 'سجل الدورات' : 'Session History'}
            </h2>
            <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1px solid rgba(226,232,240,0.6)', boxShadow: '0 4px 24px -8px rgba(0,0,0,0.06)' }}>
              {allSessions.map((s, i) => (
                <div key={s.id}
                  className={`flex items-center gap-4 px-6 py-4 ${i > 0 ? 'border-t border-slate-100' : ''} ${isAr ? 'flex-row-reverse' : ''}`}>
                  <div className="font-mono text-2xl font-bold text-[#CBD5E1] w-8 flex-shrink-0 text-center">
                    {s.session_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-[#18181B] text-sm ${isAr ? 'font-arabic' : ''}`}>
                      {isAr ? s.title_ar : s.title_en}
                    </div>
                    <div className="font-mono text-[#94A3B8] text-xs mt-0.5">
                      {new Date(s.start_date).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', { year: 'numeric', month: 'short' })}
                      {s.end_date && ` — ${new Date(s.end_date).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', { year: 'numeric', month: 'short' })}`}
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 flex-shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
                    {(s.laws_passed ?? 0) > 0 && (
                      <span className="font-mono text-sm text-[#71717A]">{s.laws_passed} laws</span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: s.status === 'active' ? '#ECFDF5' : s.status === 'suspended' ? '#FFF7ED' : '#F8FAFC',
                        color: s.status === 'active' ? '#059669' : s.status === 'suspended' ? '#EA580C' : '#6B7280',
                      }}>
                      {isAr ? (s.status === 'active' ? 'نشطة' : s.status === 'closed' ? 'منتهية' : 'معلقة') : s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── DISCLAIMER ────────────────────────────────────────────────── */}
        <div className="rounded-xl p-5 bg-white" style={{ border: '1px solid rgba(226,232,240,0.6)' }}>
          <p className={`text-[#94A3B8] text-xs leading-relaxed ${isAr ? 'font-arabic text-right' : ''}`}>
            {isAr
              ? 'بيانات توزيع المقاعد مستندة إلى نتائج انتخابات أكتوبر 2021 الرسمية. بيانات المحافظين قد لا تعكس آخر التغييرات الوزارية. يُرجى مراجعة المواقع الرسمية للتأكيد.'
              : 'Seat distribution data based on official October 2021 election results. Governor data may not reflect the latest ministerial changes. Please verify against official government sources.'}
          </p>
        </div>
      </div>
    </div>
  )
}
