import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export default async function AdminGovernmentPage({
  params,
}: {
  params: { locale: string }
}) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const isAr = locale === 'ar'

  // Auth check
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/auth/login`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') redirect(`/${locale}`)

  // Fetch data
  const admin = createAdminClient()
  const [{ data: officials }, { data: pendingNews }, { data: kpiData }, { data: metricsData }] = await Promise.all([
    admin.from('officials').select('id, name_ar, name_en, role_type, is_active').order('role_type'),
    admin.from('scraped_items').select('id, title_ar, source_name, source_url, published_at, is_published, category').eq('is_published', false).order('scraped_at', { ascending: false }).limit(20),
    admin.from('kpis').select('id, title_ar, status, officials(name_ar)').order('created_at', { ascending: false }).limit(10),
    admin.from('country_metrics').select('id, name_ar, value, year, global_rank, updated_at').order('category'),
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mb-8 border-b pb-4" style={{ borderColor: '#E4DCC9' }}>
        <p className="eyebrow mb-1">{isAr ? 'لوحة التحكم' : 'Admin Panel'}</p>
        <h1 className={`text-navy font-bold text-2xl ${isAr ? 'font-arabic' : 'font-heading italic'}`}>
          {isAr ? 'إدارة ملف الحكومة' : 'Government Module Admin'}
        </h1>
      </div>

      {/* Quick links */}
      <div className={`flex gap-3 mb-8 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
        <Link href={`/${locale}/admin/government/officials/new`}
          className="btn-primary text-sm px-4 py-2 rounded bg-navy text-white hover:bg-navy/90 transition-colors">
          {isAr ? '+ إضافة مسؤول' : '+ Add Official'}
        </Link>
        <Link href={`/${locale}/admin/government/kpis/new`}
          className="text-sm px-4 py-2 rounded border border-gold text-gold hover:bg-gold/10 transition-colors">
          {isAr ? '+ إضافة وعد/KPI' : '+ Add KPI'}
        </Link>
        <Link href={`/${locale}/admin/government/corruption/new`}
          className="text-sm px-4 py-2 rounded border border-red-400 text-red-600 hover:bg-red-50 transition-colors">
          {isAr ? '+ إضافة قضية فساد' : '+ Add Corruption Case'}
        </Link>
        <Link href={`/${locale}/admin/government/sessions/new`}
          className="text-sm px-4 py-2 rounded border border-navy/30 text-navy/70 hover:bg-navy/5 transition-colors">
          {isAr ? '+ إضافة دورة برلمانية' : '+ Add Parliament Session'}
        </Link>
        <form action="/api/scrape" method="POST">
          <button type="submit"
            className="text-sm px-4 py-2 rounded border border-navy/30 text-navy/70 hover:bg-navy/5 transition-colors">
            {isAr ? '↻ تشغيل السكرابر يدوياً' : '↻ Run Scraper Now'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Officials list */}
        <section>
          <h2 className={`section-heading mb-4 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'المسؤولون' : 'Officials'} ({officials?.length ?? 0})
          </h2>
          {officials?.length === 0 && (
            <p className={`text-navy/40 text-sm ${isAr ? 'font-arabic' : ''}`}>
              {isAr ? 'لا يوجد مسؤولون بعد.' : 'No officials added yet.'}
            </p>
          )}
          <div className="divide-y" style={{ borderColor: '#E4DCC9' }}>
            {officials?.map(o => (
              <div key={o.id}
                className={`flex items-center justify-between py-2 gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div>
                  <span className={`text-navy font-medium text-sm ${isAr ? 'font-arabic' : ''}`}>
                    {isAr ? o.name_ar : o.name_en}
                  </span>
                  <span className="ml-2 text-xs text-navy/40">{o.role_type}</span>
                </div>
                <div className={`flex gap-2 items-center ${isAr ? 'flex-row-reverse' : ''}`}>
                  {!o.is_active && (
                    <span className="text-xs text-gray-400">{isAr ? 'غير نشط' : 'inactive'}</span>
                  )}
                  <Link href={`/${locale}/admin/government/officials/${o.id}`}
                    className="text-xs text-gold hover:underline">
                    {isAr ? 'تعديل' : 'edit'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pending news to publish */}
        <section>
          <h2 className={`section-heading mb-4 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'أخبار تنتظر النشر' : 'Pending News'} ({pendingNews?.length ?? 0})
          </h2>
          {pendingNews?.length === 0 && (
            <p className={`text-navy/40 text-sm ${isAr ? 'font-arabic' : ''}`}>
              {isAr ? 'لا توجد أخبار معلقة.' : 'No pending items.'}
            </p>
          )}
          <div className="space-y-2">
            {pendingNews?.map(item => (
              <div key={item.id}
                className={`flex items-start justify-between gap-2 p-3 border rounded text-sm ${isAr ? 'flex-row-reverse' : ''}`}
                style={{ borderColor: '#E4DCC9' }}>
                <div className="flex-1 min-w-0">
                  <div className={`text-navy font-medium truncate ${isAr ? 'font-arabic' : ''}`}>
                    {item.title_ar}
                  </div>
                  <div className="text-xs text-navy/40 mt-0.5">{item.source_name}</div>
                </div>
                <Link href={`/${locale}/admin/government/news/${item.id}`}
                  className="text-xs text-gold hover:underline flex-shrink-0">
                  {isAr ? 'مراجعة' : 'review'}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Recent KPIs */}
        <section>
          <h2 className={`section-heading mb-4 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'آخر الوعود المُسجَّلة' : 'Recent KPIs'}
          </h2>
          <div className="divide-y" style={{ borderColor: '#E4DCC9' }}>
            {kpiData?.map(k => {
              const off = (k as any).officials
              return (
                <div key={k.id}
                  className={`flex items-center justify-between py-2 gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className={`text-navy text-sm truncate ${isAr ? 'font-arabic' : ''}`}>
                      {k.title_ar}
                    </div>
                    {off && (
                      <div className={`text-xs text-navy/40 ${isAr ? 'font-arabic' : ''}`}>
                        {off.name_ar}
                      </div>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    k.status === 'achieved' ? 'bg-green-100 text-green-700' :
                    k.status === 'failed' || k.status === 'abandoned' ? 'bg-red-100 text-red-700' :
                    k.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {k.status}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Country metrics status */}
        <section>
          <h2 className={`section-heading mb-4 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'مؤشرات العراق' : 'Country Metrics'} ({metricsData?.length ?? 0})
          </h2>
          <div className="divide-y text-sm" style={{ borderColor: '#E4DCC9' }}>
            {metricsData?.map(m => (
              <div key={m.id}
                className={`flex items-center justify-between py-2 gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className={`text-navy ${isAr ? 'font-arabic' : ''}`}>{m.name_ar}</span>
                <div className={`flex gap-2 text-xs text-navy/50 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span>{m.value ?? '—'}</span>
                  {m.global_rank && <span>#{m.global_rank}</span>}
                  <span>{m.year}</span>
                </div>
              </div>
            ))}
            {(metricsData?.length ?? 0) === 0 && (
              <p className={`text-navy/40 py-2 ${isAr ? 'font-arabic' : ''}`}>
                {isAr ? 'جارٍ جمع البيانات عبر السكرابر…' : 'Data being collected via scraper…'}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
