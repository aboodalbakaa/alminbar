import { notFound } from 'next/navigation'
import Link from 'next/link'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { getAllSessions, getCurrentSession, getRecentNews } from '@/lib/supabase/government'

export const dynamic = 'force-dynamic'

export default async function ParliamentPage({
  params,
}: {
  params: { locale: string }
}) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const isAr = locale === 'ar'

  const [currentSession, allSessions, parliamentNews] = await Promise.all([
    getCurrentSession(),
    getAllSessions(),
    getRecentNews(10),
  ])

  const filteredNews = parliamentNews.filter(n =>
    n.category === 'parliament' || n.tags.includes('parliament')
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-10" dir={isAr ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="border-b pb-6 mb-10" style={{ borderColor: '#E4DCC9' }}>
        <Link href={`/${locale}/government`} className="text-sm text-gold hover:underline block mb-4">
          {isAr ? '← الحكومة' : '← Government'}
        </Link>
        <p className="eyebrow mb-2">{isAr ? 'الدورة البرلمانية الخامسة' : '5th Parliamentary Term'}</p>
        <h1 className={`text-navy font-bold ${isAr ? 'font-arabic text-3xl' : 'font-heading text-2xl italic'}`}>
          {isAr ? 'مجلس النواب العراقي' : 'Iraqi Council of Representatives'}
        </h1>
        <p className={`mt-2 text-navy/60 text-sm ${isAr ? 'font-arabic' : ''}`}>
          {isAr
            ? 'متابعة جلسات البرلمان وأداء المشرّعين وأبرز القرارات والتشريعات'
            : 'Tracking sessions, legislator performance, key decisions and legislation'}
        </p>
        <a href="https://www.parliament.iq" target="_blank" rel="noopener noreferrer"
          className="text-xs text-gold hover:underline mt-2 block">
          {isAr ? 'الموقع الرسمي لمجلس النواب ←' : 'Official Parliament Website →'}
        </a>
      </div>

      {/* Current session stats */}
      {currentSession ? (
        <section className="mb-10 p-6 rounded border" style={{ background: '#1B2A4A', borderColor: '#1B2A4A' }}>
          <div className={`flex items-start justify-between mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div>
              <div className="text-gold text-xs uppercase tracking-widest mb-1">
                {isAr ? 'الدورة الحالية' : 'Current Session'}
              </div>
              <h2 className={`text-white font-bold text-xl ${isAr ? 'font-arabic' : 'font-heading italic'}`}>
                {isAr ? currentSession.title_ar : currentSession.title_en}
              </h2>
            </div>
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-bold">
              {isAr ? 'نشطة' : 'ACTIVE'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {[
              {
                label: isAr ? 'تشريعات أُقرَّت' : 'Laws Passed',
                value: currentSession.laws_passed ?? 0,
              },
              {
                label: isAr ? 'جلسات عُقدت' : 'Sessions Held',
                value: currentSession.sessions_held ?? 0,
              },
              {
                label: isAr ? 'معدل الحضور' : 'Attendance Rate',
                value: currentSession.attendance_rate
                  ? `${currentSession.attendance_rate}%`
                  : '—',
              },
              {
                label: isAr ? 'بدأت في' : 'Started',
                value: new Date(currentSession.start_date).toLocaleDateString(
                  isAr ? 'ar-IQ' : 'en-GB',
                  { year: 'numeric', month: 'long' }
                ),
              },
            ].map(s => (
              <div key={s.label}>
                <div className="text-white/50 text-xs mb-1">{s.label}</div>
                <div className={`text-white font-bold text-lg ${isAr ? 'font-arabic' : ''}`}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {(isAr ? currentSession.description_ar : currentSession.description_en) && (
            <p className={`mt-4 text-white/60 text-sm leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
              {isAr ? currentSession.description_ar : currentSession.description_en}
            </p>
          )}
        </section>
      ) : (
        <section className="mb-10 p-6 rounded border text-center" style={{ borderColor: '#E4DCC9', background: '#FAFAF6' }}>
          <p className={`text-navy/40 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'جارٍ إضافة بيانات الجلسات البرلمانية…' : 'Parliamentary session data being added…'}
          </p>
        </section>
      )}

      {/* All sessions history */}
      {allSessions.length > 1 && (
        <section className="mb-10">
          <h2 className={`section-heading mb-4 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'سجل الجلسات' : 'Session History'}
          </h2>
          <div className="divide-y" style={{ borderColor: '#E4DCC9' }}>
            {allSessions.map(s => (
              <div key={s.id}
                className={`flex items-center justify-between py-3 gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div>
                  <div className={`font-medium text-navy ${isAr ? 'font-arabic' : ''}`}>
                    {isAr ? s.title_ar : s.title_en}
                  </div>
                  <div className="text-xs text-navy/50 mt-0.5">
                    {new Date(s.start_date).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', { year: 'numeric', month: 'short' })}
                    {s.end_date && ` — ${new Date(s.end_date).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', { year: 'numeric', month: 'short' })}`}
                  </div>
                </div>
                <div className={`flex gap-4 text-sm ${isAr ? 'flex-row-reverse' : ''}`}>
                  {s.laws_passed > 0 && (
                    <span className="text-navy/60">
                      {s.laws_passed} {isAr ? 'قانون' : 'laws'}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    s.status === 'active' ? 'bg-green-100 text-green-700' :
                    s.status === 'suspended' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {isAr
                      ? s.status === 'active' ? 'نشطة' : s.status === 'closed' ? 'منتهية' : 'معلقة'
                      : s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Parliament news */}
      {filteredNews.length > 0 && (
        <section>
          <h2 className={`section-heading mb-4 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'آخر أخبار البرلمان' : 'Latest Parliament News'}
          </h2>
          <div className="divide-y" style={{ borderColor: '#E4DCC9' }}>
            {filteredNews.map(item => (
              <a key={item.id} href={item.source_url} target="_blank" rel="noopener noreferrer"
                className="block py-3 hover:text-gold transition-colors group">
                <div className={`font-medium text-navy group-hover:text-gold ${isAr ? 'font-arabic' : ''}`}>
                  {isAr ? item.title_ar : (item.title_en ?? item.title_ar)}
                </div>
                <div className={`text-xs text-navy/50 mt-1 flex gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span>{item.source_name}</span>
                  {item.published_at && (
                    <time>{new Date(item.published_at).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB')}</time>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Note about MPs */}
      <div className={`mt-10 p-4 border rounded text-sm text-navy/60 ${isAr ? 'font-arabic text-right' : ''}`}
        style={{ borderColor: '#E4DCC9', background: '#FAFAF6' }}>
        {isAr
          ? 'ملف تفصيلي لكل نائب — الحضور، التصويت، الإنجازات — قيد الإضافة. تابع الموقع.'
          : 'Individual MP profiles — attendance, voting record, legislation — being added. Check back soon.'}
      </div>
    </div>
  )
}
