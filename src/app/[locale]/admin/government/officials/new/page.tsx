import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { createClient } from '@/lib/supabase/server'
import { createOfficial } from '@/app/actions/government'

export const dynamic = 'force-dynamic'

export default async function NewOfficialPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const isAr = locale === 'ar'

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/auth/login`)
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin') redirect(`/${locale}`)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10" dir={isAr ? 'rtl' : 'ltr'}>
      <Link href={`/${locale}/admin/government`} className="text-sm text-gold hover:underline block mb-6">
        {isAr ? '← لوحة الحكومة' : '← Gov. Admin'}
      </Link>
      <h1 className={`text-navy font-bold text-2xl mb-8 ${isAr ? 'font-arabic' : 'font-heading italic'}`}>
        {isAr ? 'إضافة مسؤول جديد' : 'Add New Official'}
      </h1>

      <form action={createOfficial} className="space-y-6">
        {/* Identity */}
        <fieldset className="border rounded p-5 space-y-4" style={{ borderColor: '#E4DCC9' }}>
          <legend className={`text-sm font-bold text-navy px-2 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'الهوية' : 'Identity'}
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <Field label="الاسم بالعربية *" name="name_ar" required dir="rtl" />
            <Field label="Name in English *" name="name_en" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="المنصب بالعربية *" name="title_ar" required dir="rtl" />
            <Field label="Title in English *" name="title_en" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Slug (URL)" name="slug" placeholder="e.g. mohammed-al-sudani" />
            <div>
              <label className="block text-xs text-navy/60 mb-1">{isAr ? 'نوع المنصب *' : 'Role Type *'}</label>
              <select name="role_type" required className="w-full border rounded px-3 py-2 text-sm text-navy" style={{ borderColor: '#E4DCC9' }}>
                <option value="prime_minister">{isAr ? 'رئيس الوزراء' : 'Prime Minister'}</option>
                <option value="deputy_pm">{isAr ? 'نائب رئيس الوزراء' : 'Deputy PM'}</option>
                <option value="minister" selected>{isAr ? 'وزير' : 'Minister'}</option>
                <option value="mp">{isAr ? 'نائب برلماني' : 'MP'}</option>
                <option value="speaker">{isAr ? 'رئيس البرلمان' : 'Speaker'}</option>
                <option value="other">{isAr ? 'أخرى' : 'Other'}</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* Party & Ministry */}
        <fieldset className="border rounded p-5 space-y-4" style={{ borderColor: '#E4DCC9' }}>
          <legend className={`text-sm font-bold text-navy px-2 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'الكتلة والوزارة' : 'Party & Ministry'}
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <Field label="الكتلة / الحزب بالعربية" name="party_ar" dir="rtl" />
            <Field label="Party in English" name="party_en" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="الوزارة بالعربية" name="ministry_ar" dir="rtl" />
            <Field label="Ministry in English" name="ministry_en" />
          </div>
        </fieldset>

        {/* Bio */}
        <fieldset className="border rounded p-5 space-y-4" style={{ borderColor: '#E4DCC9' }}>
          <legend className={`text-sm font-bold text-navy px-2 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'السيرة والصورة' : 'Bio & Photo'}
          </legend>
          <Field label="رابط الصورة (URL)" name="photo_url" placeholder="https://..." />
          <TextArea label="السيرة الذاتية بالعربية" name="bio_ar" dir="rtl" rows={3} />
          <TextArea label="Biography in English" name="bio_en" rows={3} />
        </fieldset>

        {/* Social */}
        <fieldset className="border rounded p-5 space-y-4" style={{ borderColor: '#E4DCC9' }}>
          <legend className={`text-sm font-bold text-navy px-2 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'وسائل التواصل' : 'Social Media'}
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Twitter/X Handle" name="twitter_handle" placeholder="@username" />
            <Field label="Facebook URL" name="facebook_url" placeholder="https://facebook.com/..." />
          </div>
          <Field label="Instagram URL" name="instagram_url" placeholder="https://instagram.com/..." />
        </fieldset>

        {/* Term */}
        <fieldset className="border rounded p-5 space-y-4" style={{ borderColor: '#E4DCC9' }}>
          <legend className={`text-sm font-bold text-navy px-2 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'فترة المنصب' : 'Term'}
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <Field label={isAr ? 'تاريخ البداية' : 'Term Start'} name="term_start" type="date" />
            <Field label={isAr ? 'تاريخ الانتهاء' : 'Term End'} name="term_end" type="date" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="is_active" defaultChecked className="w-4 h-4" />
            <span className={`text-sm text-navy ${isAr ? 'font-arabic' : ''}`}>
              {isAr ? 'مسؤول نشط حالياً' : 'Currently active'}
            </span>
          </label>
        </fieldset>

        <div className="flex gap-3">
          <button type="submit"
            className="px-6 py-2 bg-navy text-white text-sm rounded hover:bg-navy/90 transition-colors">
            {isAr ? 'حفظ المسؤول' : 'Save Official'}
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
  label: string; name: string; required?: boolean
  type?: string; placeholder?: string; dir?: string
}) {
  return (
    <div>
      <label className="block text-xs text-navy/60 mb-1">{label}</label>
      <input
        type={type} name={name} required={required} placeholder={placeholder}
        dir={dir}
        className="w-full border rounded px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold"
        style={{ borderColor: '#E4DCC9' }}
      />
    </div>
  )
}

function TextArea({ label, name, rows = 3, dir }: { label: string; name: string; rows?: number; dir?: string }) {
  return (
    <div>
      <label className="block text-xs text-navy/60 mb-1">{label}</label>
      <textarea
        name={name} rows={rows} dir={dir}
        className="w-full border rounded px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold resize-none"
        style={{ borderColor: '#E4DCC9' }}
      />
    </div>
  )
}
