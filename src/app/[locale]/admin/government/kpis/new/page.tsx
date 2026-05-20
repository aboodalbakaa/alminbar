import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createKpi } from '@/app/actions/government'

export const dynamic = 'force-dynamic'

export default async function NewKpiPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const isAr = locale === 'ar'

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/auth/login`)
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin') redirect(`/${locale}`)

  const { data: officials } = await createAdminClient()
    .from('officials').select('id, name_ar, name_en').eq('is_active', true).order('role_type')
  const { data: sessions } = await createAdminClient()
    .from('parliament_sessions').select('id, title_ar, title_en').order('start_date', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto px-4 py-10" dir={isAr ? 'rtl' : 'ltr'}>
      <Link href={`/${locale}/admin/government`} className="text-sm text-gold hover:underline block mb-6">
        {isAr ? '← لوحة الحكومة' : '← Gov. Admin'}
      </Link>
      <h1 className={`text-navy font-bold text-2xl mb-8 ${isAr ? 'font-arabic' : 'font-heading italic'}`}>
        {isAr ? 'إضافة وعد / التزام' : 'Add Promise / KPI'}
      </h1>

      <form action={createKpi} className="space-y-5">
        {/* Official */}
        <div>
          <label className={`block text-xs text-navy/60 mb-1 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'المسؤول *' : 'Official *'}
          </label>
          <select name="official_id" required className="w-full border rounded px-3 py-2 text-sm text-navy" style={{ borderColor: '#E4DCC9' }}>
            <option value="">{isAr ? 'اختر مسؤولاً...' : 'Select official...'}</option>
            {(officials ?? []).map(o => (
              <option key={o.id} value={o.id}>{isAr ? o.name_ar : o.name_en}</option>
            ))}
          </select>
        </div>

        {/* Session (optional) */}
        <div>
          <label className={`block text-xs text-navy/60 mb-1 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'الدورة البرلمانية (اختياري)' : 'Parliament Session (optional)'}
          </label>
          <select name="session_id" className="w-full border rounded px-3 py-2 text-sm text-navy" style={{ borderColor: '#E4DCC9' }}>
            <option value="">{isAr ? 'لا شيء' : 'None'}</option>
            {(sessions ?? []).map(s => (
              <option key={s.id} value={s.id}>{isAr ? s.title_ar : s.title_en}</option>
            ))}
          </select>
        </div>

        {/* Titles */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="العنوان بالعربية *" name="title_ar" required dir="rtl" />
          <Field label="Title in English *" name="title_en" required />
        </div>

        {/* Descriptions */}
        <div className="grid grid-cols-2 gap-4">
          <TextArea label="التفاصيل بالعربية" name="description_ar" dir="rtl" />
          <TextArea label="Details in English" name="description_en" />
        </div>

        {/* Category + Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs text-navy/60 mb-1 ${isAr ? 'font-arabic' : ''}`}>{isAr ? 'المجال *' : 'Category *'}</label>
            <select name="category" required className="w-full border rounded px-3 py-2 text-sm text-navy" style={{ borderColor: '#E4DCC9' }}>
              {[
                ['economy', 'الاقتصاد'], ['infrastructure', 'البنية التحتية'], ['security', 'الأمن'],
                ['corruption', 'الفساد'], ['healthcare', 'الصحة'], ['education', 'التعليم'],
                ['services', 'الخدمات'], ['general', 'عام'],
              ].map(([v, ar]) => <option key={v} value={v}>{isAr ? ar : v}</option>)}
            </select>
          </div>
          <div>
            <label className={`block text-xs text-navy/60 mb-1 ${isAr ? 'font-arabic' : ''}`}>{isAr ? 'الحالة *' : 'Status *'}</label>
            <select name="status" required className="w-full border rounded px-3 py-2 text-sm text-navy" style={{ borderColor: '#E4DCC9' }}>
              {[
                ['promised', 'وعد'], ['in_progress', 'قيد التنفيذ'], ['achieved', 'أُنجز'],
                ['failed', 'فشل'], ['abandoned', 'متروك'], ['stalled', 'متعثر'],
              ].map(([v, ar]) => <option key={v} value={v}>{isAr ? ar : v.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <Field label={isAr ? 'تاريخ الوعد' : 'Date Promised'} name="date_promised" type="date" />
          <Field label={isAr ? 'الموعد النهائي' : 'Deadline'} name="deadline" type="date" />
        </div>

        {/* Sources */}
        <Field label={isAr ? 'رابط المصدر' : 'Source URL'} name="source_url" placeholder="https://..." />
        <Field label={isAr ? 'رابط الدليل' : 'Evidence URL'} name="evidence_url" placeholder="https://..." />
        <div className="grid grid-cols-2 gap-4">
          <TextArea label="ملاحظات بالعربية" name="notes_ar" dir="rtl" />
          <TextArea label="Notes in English" name="notes_en" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="px-6 py-2 bg-navy text-white text-sm rounded hover:bg-navy/90 transition-colors">
            {isAr ? 'حفظ الوعد' : 'Save KPI'}
          </button>
          <Link href={`/${locale}/admin/government`}
            className="px-6 py-2 border text-sm rounded text-navy/60 hover:bg-navy/5 transition-colors"
            style={{ borderColor: '#E4DCC9' }}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Link>
        </div>
      </form>
    </div>
  )
}

function Field({ label, name, required, type = 'text', placeholder, dir }: {
  label: string; name: string; required?: boolean; type?: string; placeholder?: string; dir?: string
}) {
  return (
    <div>
      <label className="block text-xs text-navy/60 mb-1">{label}</label>
      <input type={type} name={name} required={required} placeholder={placeholder} dir={dir}
        className="w-full border rounded px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold"
        style={{ borderColor: '#E4DCC9' }} />
    </div>
  )
}

function TextArea({ label, name, dir }: { label: string; name: string; dir?: string }) {
  return (
    <div>
      <label className="block text-xs text-navy/60 mb-1">{label}</label>
      <textarea name={name} rows={3} dir={dir}
        className="w-full border rounded px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold resize-none"
        style={{ borderColor: '#E4DCC9' }} />
    </div>
  )
}
