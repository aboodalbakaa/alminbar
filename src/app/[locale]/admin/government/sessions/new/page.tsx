import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { createClient } from '@/lib/supabase/server'
import { createSession } from '@/app/actions/government'

export const dynamic = 'force-dynamic'

export default async function NewSessionPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const isAr = locale === 'ar'

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/auth/login`)
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin') redirect(`/${locale}`)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10" dir={isAr ? 'rtl' : 'ltr'}>
      <Link href={`/${locale}/admin/government`} className="text-sm text-gold hover:underline block mb-6">
        {isAr ? '← لوحة الحكومة' : '← Gov. Admin'}
      </Link>
      <h1 className={`text-navy font-bold text-2xl mb-8 ${isAr ? 'font-arabic' : 'font-heading italic'}`}>
        {isAr ? 'إضافة دورة برلمانية' : 'Add Parliament Session'}
      </h1>

      <form action={createSession} className="space-y-5">
        {/* Session & Term Numbers */}
        <div className="grid grid-cols-2 gap-4">
          <Field label={isAr ? 'رقم الدورة *' : 'Session Number *'} name="session_number" type="number" required placeholder="e.g. 1" />
          <Field label={isAr ? 'رقم الفصل التشريعي *' : 'Term Number *'} name="term_number" type="number" required placeholder="e.g. 5" />
        </div>

        {/* Titles */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="عنوان الدورة بالعربية *" name="title_ar" required dir="rtl" placeholder="مثال: الدورة الأولى للفصل الخامس" />
          <Field label="Session Title in English *" name="title_en" required placeholder="e.g. First Session, 5th Term" />
        </div>

        {/* Status */}
        <div>
          <label className={`block text-xs text-navy/60 mb-1 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'الحالة *' : 'Status *'}
          </label>
          <select name="status" required className="w-full border rounded px-3 py-2 text-sm text-navy" style={{ borderColor: '#E4DCC9' }}>
            {[
              ['active', 'نشطة', 'Active'],
              ['completed', 'مكتملة', 'Completed'],
              ['suspended', 'معلّقة', 'Suspended'],
            ].map(([v, ar, en]) => (
              <option key={v} value={v}>{isAr ? ar : en}</option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <Field label={isAr ? 'تاريخ الانعقاد *' : 'Start Date *'} name="start_date" type="date" required />
          <Field label={isAr ? 'تاريخ الانتهاء' : 'End Date'} name="end_date" type="date" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Field label={isAr ? 'قوانين أُقرّت' : 'Laws Passed'} name="laws_passed" type="number" placeholder="0" />
          <Field label={isAr ? 'جلسات عُقدت' : 'Sessions Held'} name="sessions_held" type="number" placeholder="0" />
          <Field label={isAr ? 'معدل الحضور (%)' : 'Attendance Rate (%)'} name="attendance_rate" type="number" placeholder="e.g. 72.5" />
        </div>

        {/* Descriptions */}
        <div className="grid grid-cols-2 gap-4">
          <TextArea label="ملاحظات بالعربية" name="description_ar" dir="rtl" />
          <TextArea label="Notes in English" name="description_en" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="px-6 py-2 bg-navy text-white text-sm rounded hover:bg-navy/90 transition-colors">
            {isAr ? 'حفظ الدورة' : 'Save Session'}
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
