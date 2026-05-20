import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { updateOfficial, deleteOfficial } from '@/app/actions/government'

export const dynamic = 'force-dynamic'

export default async function EditOfficialPage({
  params,
}: { params: { locale: string; id: string } }) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const isAr = locale === 'ar'

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/auth/login`)
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin') redirect(`/${locale}`)

  const { data: o } = await createAdminClient()
    .from('officials').select('*').eq('id', params.id).maybeSingle()
  if (!o) notFound()

  const roles = [
    { v: 'prime_minister', ar: 'رئيس الوزراء', en: 'Prime Minister' },
    { v: 'deputy_pm', ar: 'نائب رئيس الوزراء', en: 'Deputy PM' },
    { v: 'minister', ar: 'وزير', en: 'Minister' },
    { v: 'mp', ar: 'نائب برلماني', en: 'MP' },
    { v: 'speaker', ar: 'رئيس البرلمان', en: 'Speaker' },
    { v: 'other', ar: 'أخرى', en: 'Other' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-10" dir={isAr ? 'rtl' : 'ltr'}>
      <Link href={`/${locale}/admin/government`} className="text-sm text-gold hover:underline block mb-6">
        {isAr ? '← لوحة الحكومة' : '← Gov. Admin'}
      </Link>
      <h1 className={`text-navy font-bold text-2xl mb-8 ${isAr ? 'font-arabic' : 'font-heading italic'}`}>
        {isAr ? `تعديل: ${o.name_ar}` : `Edit: ${o.name_en}`}
      </h1>

      <form action={updateOfficial} className="space-y-6">
        <input type="hidden" name="id" value={o.id} />

        <fieldset className="border rounded p-5 space-y-4" style={{ borderColor: '#E4DCC9' }}>
          <legend className="text-sm font-bold text-navy px-2">{isAr ? 'الهوية' : 'Identity'}</legend>
          <div className="grid grid-cols-2 gap-4">
            <F label="الاسم بالعربية *" name="name_ar" defaultValue={o.name_ar} required dir="rtl" />
            <F label="Name in English *" name="name_en" defaultValue={o.name_en} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <F label="المنصب بالعربية *" name="title_ar" defaultValue={o.title_ar} required dir="rtl" />
            <F label="Title in English *" name="title_en" defaultValue={o.title_en} required />
          </div>
          <div>
            <label className="block text-xs text-navy/60 mb-1">{isAr ? 'نوع المنصب *' : 'Role Type *'}</label>
            <select name="role_type" required className="w-full border rounded px-3 py-2 text-sm text-navy" style={{ borderColor: '#E4DCC9' }}>
              {roles.map(r => (
                <option key={r.v} value={r.v} selected={o.role_type === r.v}>{isAr ? r.ar : r.en}</option>
              ))}
            </select>
          </div>
        </fieldset>

        <fieldset className="border rounded p-5 space-y-4" style={{ borderColor: '#E4DCC9' }}>
          <legend className="text-sm font-bold text-navy px-2">{isAr ? 'الكتلة والوزارة' : 'Party & Ministry'}</legend>
          <div className="grid grid-cols-2 gap-4">
            <F label="الكتلة / الحزب بالعربية" name="party_ar" defaultValue={o.party_ar ?? ''} dir="rtl" />
            <F label="Party in English" name="party_en" defaultValue={o.party_en ?? ''} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <F label="الوزارة بالعربية" name="ministry_ar" defaultValue={o.ministry_ar ?? ''} dir="rtl" />
            <F label="Ministry in English" name="ministry_en" defaultValue={o.ministry_en ?? ''} />
          </div>
        </fieldset>

        <fieldset className="border rounded p-5 space-y-4" style={{ borderColor: '#E4DCC9' }}>
          <legend className="text-sm font-bold text-navy px-2">{isAr ? 'السيرة والصورة' : 'Bio & Photo'}</legend>
          <F label="رابط الصورة (URL)" name="photo_url" defaultValue={o.photo_url ?? ''} />
          <TA label="السيرة الذاتية بالعربية" name="bio_ar" defaultValue={o.bio_ar ?? ''} dir="rtl" />
          <TA label="Biography in English" name="bio_en" defaultValue={o.bio_en ?? ''} />
        </fieldset>

        <fieldset className="border rounded p-5 space-y-4" style={{ borderColor: '#E4DCC9' }}>
          <legend className="text-sm font-bold text-navy px-2">{isAr ? 'وسائل التواصل' : 'Social'}</legend>
          <div className="grid grid-cols-2 gap-4">
            <F label="Twitter/X Handle" name="twitter_handle" defaultValue={o.twitter_handle ?? ''} />
            <F label="Facebook URL" name="facebook_url" defaultValue={o.facebook_url ?? ''} />
          </div>
        </fieldset>

        <fieldset className="border rounded p-5 space-y-4" style={{ borderColor: '#E4DCC9' }}>
          <legend className="text-sm font-bold text-navy px-2">{isAr ? 'فترة المنصب' : 'Term'}</legend>
          <div className="grid grid-cols-2 gap-4">
            <F label={isAr ? 'تاريخ البداية' : 'Term Start'} name="term_start" type="date" defaultValue={o.term_start ?? ''} />
            <F label={isAr ? 'تاريخ الانتهاء' : 'Term End'} name="term_end" type="date" defaultValue={o.term_end ?? ''} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="is_active" defaultChecked={o.is_active} className="w-4 h-4" />
            <span className="text-sm text-navy">{isAr ? 'مسؤول نشط' : 'Currently active'}</span>
          </label>
        </fieldset>

        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2 bg-navy text-white text-sm rounded hover:bg-navy/90 transition-colors">
              {isAr ? 'حفظ التغييرات' : 'Save Changes'}
            </button>
            <Link href={`/${locale}/admin/government`}
              className="px-6 py-2 border text-sm rounded text-navy/60 hover:bg-navy/5 transition-colors"
              style={{ borderColor: '#E4DCC9' }}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Link>
          </div>
          {/* Delete */}
          <form action={deleteOfficial} className="inline">
            <input type="hidden" name="id" value={o.id} />
            <button type="submit" className="px-4 py-2 border border-red-300 text-red-600 text-sm rounded hover:bg-red-50 transition-colors">
              {isAr ? 'حذف' : 'Delete'}
            </button>
          </form>
        </div>
      </form>
    </div>
  )
}

function F({ label, name, required, type = 'text', defaultValue = '', dir }: {
  label: string; name: string; required?: boolean; type?: string; defaultValue?: string; dir?: string
}) {
  return (
    <div>
      <label className="block text-xs text-navy/60 mb-1">{label}</label>
      <input type={type} name={name} required={required} defaultValue={defaultValue} dir={dir}
        className="w-full border rounded px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold"
        style={{ borderColor: '#E4DCC9' }} />
    </div>
  )
}

function TA({ label, name, defaultValue = '', dir }: { label: string; name: string; defaultValue?: string; dir?: string }) {
  return (
    <div>
      <label className="block text-xs text-navy/60 mb-1">{label}</label>
      <textarea name={name} rows={3} defaultValue={defaultValue} dir={dir}
        className="w-full border rounded px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold resize-none"
        style={{ borderColor: '#E4DCC9' }} />
    </div>
  )
}
