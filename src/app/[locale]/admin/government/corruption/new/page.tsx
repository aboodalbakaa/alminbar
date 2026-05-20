import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createCorruptionCase } from '@/app/actions/government'

export const dynamic = 'force-dynamic'

export default async function NewCorruptionPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const isAr = locale === 'ar'

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/auth/login`)
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin') redirect(`/${locale}`)

  const { data: officials } = await createAdminClient()
    .from('officials').select('id, name_ar, name_en').order('role_type')

  return (
    <div className="max-w-2xl mx-auto px-4 py-10" dir={isAr ? 'rtl' : 'ltr'}>
      <Link href={`/${locale}/admin/government`} className="text-sm text-gold hover:underline block mb-6">
        {isAr ? '← لوحة الحكومة' : '← Gov. Admin'}
      </Link>
      <h1 className={`text-navy font-bold text-2xl mb-2 ${isAr ? 'font-arabic' : 'font-heading italic'}`}>
        {isAr ? 'إضافة قضية فساد' : 'Add Corruption Case'}
      </h1>
      <p className={`text-sm text-navy/50 mb-8 ${isAr ? 'font-arabic' : ''}`}>
        {isAr ? 'لا تنشر إلا ما هو مدعوم بمصادر موثوقة.' : 'Only publish what is backed by credible sources.'}
      </p>

      <form action={createCorruptionCase} className="space-y-5">
        {/* Official */}
        <div>
          <label className="block text-xs text-navy/60 mb-1">{isAr ? 'المسؤول المعني (اختياري)' : 'Official (optional)'}</label>
          <select name="official_id" className="w-full border rounded px-3 py-2 text-sm text-navy" style={{ borderColor: '#E4DCC9' }}>
            <option value="">{isAr ? 'قضية مؤسسية / غير محددة' : 'Institutional / unspecified'}</option>
            {(officials ?? []).map(o => (
              <option key={o.id} value={o.id}>{isAr ? o.name_ar : o.name_en}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="عنوان القضية بالعربية *" name="title_ar" required dir="rtl" />
          <Field label="Case Title in English *" name="title_en" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextArea label="التفاصيل بالعربية *" name="description_ar" required dir="rtl" rows={4} />
          <TextArea label="Description in English *" name="description_en" required rows={4} />
        </div>

        {/* Type + Status + Evidence */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-navy/60 mb-1">{isAr ? 'نوع القضية *' : 'Case Type *'}</label>
            <select name="case_type" required className="w-full border rounded px-3 py-2 text-sm text-navy" style={{ borderColor: '#E4DCC9' }}>
              {[['financial','مالية'],['bribery','رشوة'],['embezzlement','اختلاس'],
                ['nepotism','محسوبية'],['abuse_of_power','إساءة السلطة'],['other','أخرى']].map(([v,ar]) => (
                <option key={v} value={v}>{isAr ? ar : v.replace(/_/g,' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-navy/60 mb-1">{isAr ? 'الحالة القانونية *' : 'Legal Status *'}</label>
            <select name="status" required className="w-full border rounded px-3 py-2 text-sm text-navy" style={{ borderColor: '#E4DCC9' }}>
              {[['alleged','مزعوم'],['under_investigation','قيد التحقيق'],['confirmed','مؤكد'],
                ['acquitted','بُرِّئ'],['convicted','مُدان'],['dismissed','أُسقطت']].map(([v,ar]) => (
                <option key={v} value={v}>{isAr ? ar : v.replace(/_/g,' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-navy/60 mb-1">{isAr ? 'مستوى الأدلة *' : 'Evidence Level *'}</label>
            <select name="evidence_level" required className="w-full border rounded px-3 py-2 text-sm text-navy" style={{ borderColor: '#E4DCC9' }}>
              {[['low','محدودة'],['medium','متوسطة'],['high','قوية'],['documented','موثقة']].map(([v,ar]) => (
                <option key={v} value={v}>{isAr ? ar : v}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount + Dates */}
        <div className="grid grid-cols-3 gap-4">
          <Field label={isAr ? 'المبلغ (USD)' : 'Amount (USD)'} name="amount_usd" type="number" placeholder="e.g. 5000000" />
          <Field label={isAr ? 'تاريخ الحدوث' : 'Date Occurred'} name="date_occurred" type="date" />
          <Field label={isAr ? 'تاريخ الإبلاغ' : 'Date Reported'} name="date_reported" type="date" />
        </div>

        {/* Sources — one per line */}
        <div>
          <label className="block text-xs text-navy/60 mb-1">
            {isAr ? 'روابط المصادر (رابط لكل سطر) *' : 'Source URLs (one per line) *'}
          </label>
          <textarea name="source_urls" rows={4} required
            placeholder={isAr ? 'https://...\nhttps://...' : 'https://...\nhttps://...'}
            className="w-full border rounded px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold resize-none font-mono"
            style={{ borderColor: '#E4DCC9' }} />
          <p className={`text-xs text-navy/40 mt-1 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'أضف رابطاً واحداً في كل سطر على الأقل.' : 'Add at least one source link, one per line.'}
          </p>
        </div>

        {/* Publish toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="is_published" className="w-4 h-4" />
          <span className={`text-sm text-navy ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'نشر فوراً (ستظهر للعموم)' : 'Publish immediately (visible to public)'}
          </span>
        </label>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="px-6 py-2 bg-red-700 text-white text-sm rounded hover:bg-red-800 transition-colors">
            {isAr ? 'حفظ القضية' : 'Save Case'}
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

function TextArea({ label, name, required, rows = 3, dir }: {
  label: string; name: string; required?: boolean; rows?: number; dir?: string
}) {
  return (
    <div>
      <label className="block text-xs text-navy/60 mb-1">{label}</label>
      <textarea name={name} required={required} rows={rows} dir={dir}
        className="w-full border rounded px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold resize-none"
        style={{ borderColor: '#E4DCC9' }} />
    </div>
  )
}
