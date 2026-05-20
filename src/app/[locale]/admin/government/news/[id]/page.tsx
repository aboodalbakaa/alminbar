import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { publishScrapedItem, discardScrapedItem } from '@/app/actions/government'

export const dynamic = 'force-dynamic'

export default async function ReviewScrapedNewsPage({
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

  const admin = createAdminClient()
  const { data: item } = await admin
    .from('scraped_items')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()
  if (!item) notFound()

  const { data: officials } = await admin
    .from('officials')
    .select('id, name_ar, name_en')
    .eq('is_active', true)
    .order('role_type')

  const categories = [
    ['economy', 'الاقتصاد', 'Economy'],
    ['security', 'الأمن', 'Security'],
    ['corruption', 'الفساد', 'Corruption'],
    ['parliament', 'البرلمان', 'Parliament'],
    ['infrastructure', 'البنية التحتية', 'Infrastructure'],
    ['foreign_affairs', 'الشؤون الخارجية', 'Foreign Affairs'],
    ['general', 'عام', 'General'],
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-10" dir={isAr ? 'rtl' : 'ltr'}>
      <Link href={`/${locale}/admin/government`} className="text-sm text-gold hover:underline block mb-6">
        {isAr ? '← لوحة الحكومة' : '← Gov. Admin'}
      </Link>
      <h1 className={`text-navy font-bold text-2xl mb-2 ${isAr ? 'font-arabic' : 'font-heading italic'}`}>
        {isAr ? 'مراجعة خبر مجمّع' : 'Review Scraped Item'}
      </h1>
      <p className="text-xs text-navy/40 mb-8">
        {item.source_name} · {item.published_at ? new Date(item.published_at).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB') : '—'}
      </p>

      {/* Original scraped content — read only */}
      <div className="bg-clay border rounded p-4 mb-8 space-y-3" style={{ borderColor: '#E4DCC9', backgroundColor: '#F6F3EC' }}>
        <p className="text-xs font-bold text-navy/50 uppercase tracking-wide">
          {isAr ? 'المحتوى الأصلي' : 'Original Content'}
        </p>
        {item.title_ar && (
          <p className="text-sm text-navy font-arabic" dir="rtl">{item.title_ar}</p>
        )}
        {item.title_en && (
          <p className="text-sm text-navy italic">{item.title_en}</p>
        )}
        {item.summary_ar && (
          <p className="text-xs text-navy/70 font-arabic" dir="rtl">{item.summary_ar}</p>
        )}
        {item.summary_en && (
          <p className="text-xs text-navy/70">{item.summary_en}</p>
        )}
        <a href={item.source_url} target="_blank" rel="noopener noreferrer"
          className="text-xs text-gold hover:underline block truncate">
          {item.source_url}
        </a>
        {item.tags?.length > 0 && (
          <p className="text-xs text-navy/40">{item.tags.join(', ')}</p>
        )}
      </div>

      {/* Publish form */}
      <form action={publishScrapedItem} className="space-y-5">
        <input type="hidden" name="id" value={item.id} />

        <div>
          <label className={`block text-xs text-navy/60 mb-1 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'ربط بمسؤول (اختياري)' : 'Link to Official (optional)'}
          </label>
          <select name="official_id" className="w-full border rounded px-3 py-2 text-sm text-navy" style={{ borderColor: '#E4DCC9' }}>
            <option value="">{isAr ? 'لا يوجد' : 'None'}</option>
            {(officials ?? []).map(o => (
              <option key={o.id} value={o.id} selected={item.official_id === o.id}>
                {isAr ? o.name_ar : o.name_en}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-xs text-navy/60 mb-1 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'التصنيف *' : 'Category *'}
          </label>
          <select name="category" required className="w-full border rounded px-3 py-2 text-sm text-navy" style={{ borderColor: '#E4DCC9' }}>
            {categories.map(([v, ar, en]) => (
              <option key={v} value={v} selected={item.category === v}>
                {isAr ? ar : en}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-navy/60 mb-1">
            {isAr ? 'عنوان بالإنجليزية (اختياري)' : 'English Title (optional)'}
          </label>
          <input type="text" name="title_en" defaultValue={item.title_en ?? ''}
            className="w-full border rounded px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold"
            style={{ borderColor: '#E4DCC9' }} />
        </div>

        <div>
          <label className="block text-xs text-navy/60 mb-1">
            {isAr ? 'ملخص بالإنجليزية (اختياري)' : 'English Summary (optional)'}
          </label>
          <textarea name="summary_en" rows={3} defaultValue={item.summary_en ?? ''}
            className="w-full border rounded px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold resize-none"
            style={{ borderColor: '#E4DCC9' }} />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="is_verified" className="w-4 h-4" />
          <span className={`text-sm text-navy ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'تحقق يدوي من المصدر' : 'Manually verified source'}
          </span>
        </label>

        <div className="flex gap-3 pt-2">
          <button type="submit"
            className="px-6 py-2 bg-navy text-white text-sm rounded hover:bg-navy/90 transition-colors">
            {isAr ? 'نشر' : 'Publish'}
          </button>
          <Link href={`/${locale}/admin/government`}
            className="px-6 py-2 border text-sm rounded text-navy/60 hover:bg-navy/5 transition-colors"
            style={{ borderColor: '#E4DCC9' }}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Link>
        </div>
      </form>

      {/* Discard — separate form */}
      <div className="mt-8 pt-6 border-t" style={{ borderColor: '#E4DCC9' }}>
        <p className={`text-xs text-navy/40 mb-3 ${isAr ? 'font-arabic' : ''}`}>
          {isAr ? 'إذا كان الخبر غير ذي صلة أو مكرر:' : 'If the item is irrelevant or a duplicate:'}
        </p>
        <form action={discardScrapedItem}>
          <input type="hidden" name="id" value={item.id} />
          <button type="submit"
            className="px-4 py-2 border border-red-300 text-red-600 text-sm rounded hover:bg-red-50 transition-colors">
            {isAr ? 'حذف الخبر' : 'Discard Item'}
          </button>
        </form>
      </div>
    </div>
  )
}
