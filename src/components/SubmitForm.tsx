'use client'
import { createSubmission, updateSubmission } from '@/app/actions/submit'
import { useSearchParams } from 'next/navigation'
import type { Locale } from '@/i18n.config'
import type { Dictionary } from '@/lib/dictionary'
import type { Submission } from '@/types/submission'

interface Props {
  locale: Locale
  dict: Dictionary
  draft?: Submission
}

const topics = [
  { ar: 'سياسة', en: 'Politics' },
  { ar: 'اقتصاد', en: 'Economics' },
  { ar: 'فساد', en: 'Corruption' },
  { ar: 'بنية تحتية', en: 'Infrastructure' },
  { ar: 'إصلاح مؤسسي', en: 'Institutional Reform' },
  { ar: 'اجتماع', en: 'Society' },
]

const inputClass =
  'w-full border border-navy/20 px-4 py-3 text-navy focus:outline-none focus:border-gold transition-colors text-sm'
const labelClass = 'block text-navy/60 text-xs uppercase tracking-widest mb-2'
const textareaClass =
  'w-full border border-navy/20 px-4 py-3 text-navy focus:outline-none focus:border-gold transition-colors text-sm resize-y'

export default function SubmitForm({ locale, dict, draft }: Props) {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const isAr = locale === 'ar'

  return (
    <form action={draft ? updateSubmission : createSubmission} className="space-y-8">
      <input type="hidden" name="locale" value={locale} />
      {draft && <input type="hidden" name="id" value={draft.id} />}

      {error && (
        <p className="text-red-700 text-sm p-3 bg-red-50 border border-red-200">{error}</p>
      )}

      {/* Topic */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{dict.submit.form_topic_ar}</label>
          <select name="topic_ar" defaultValue={draft?.topic_ar ?? 'سياسة'} className={inputClass}>
            {topics.map(t => (
              <option key={t.ar} value={t.ar}>{t.ar}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>{dict.submit.form_topic_en}</label>
          <select name="topic_en" defaultValue={draft?.topic_en ?? 'Politics'} className={inputClass}>
            {topics.map(t => (
              <option key={t.en} value={t.en}>{t.en}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Titles */}
      <div>
        <label className={`${labelClass} ${isAr ? 'font-arabic' : ''}`}>
          {dict.submit.form_title_ar} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title_ar"
          required
          defaultValue={draft?.title_ar}
          dir="rtl"
          className={`${inputClass} font-arabic`}
          placeholder="عنوان المقالة بالعربية"
        />
      </div>

      <div>
        <label className={labelClass}>{dict.submit.form_title_en}</label>
        <input
          type="text"
          name="title_en"
          defaultValue={draft?.title_en}
          dir="ltr"
          className={inputClass}
          placeholder="Article title in English"
        />
      </div>

      {/* Excerpts */}
      <div>
        <label className={`${labelClass} ${isAr ? 'font-arabic' : ''}`}>
          {dict.submit.form_excerpt_ar}
        </label>
        <textarea
          name="excerpt_ar"
          rows={3}
          defaultValue={draft?.excerpt_ar ?? ''}
          dir="rtl"
          className={`${textareaClass} font-arabic`}
          placeholder="ملخص قصير بالعربية (اختياري)"
        />
      </div>

      <div>
        <label className={labelClass}>{dict.submit.form_excerpt_en}</label>
        <textarea
          name="excerpt_en"
          rows={3}
          defaultValue={draft?.excerpt_en ?? ''}
          dir="ltr"
          className={textareaClass}
          placeholder="Short English summary (optional)"
        />
      </div>

      {/* Content */}
      <div>
        <label className={`${labelClass} ${isAr ? 'font-arabic' : ''}`}>
          {dict.submit.form_content_ar} <span className="text-red-500">*</span>
        </label>
        <textarea
          name="content_ar"
          rows={16}
          required
          defaultValue={draft?.content_ar}
          dir="rtl"
          className={`${textareaClass} font-arabic leading-[1.9]`}
          placeholder="نص المقالة كاملاً بالعربية"
        />
      </div>

      <div>
        <label className={labelClass}>{dict.submit.form_content_en}</label>
        <textarea
          name="content_en"
          rows={16}
          defaultValue={draft?.content_en ?? ''}
          dir="ltr"
          className={textareaClass}
          placeholder="Full article text in English (optional)"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          name="intent"
          value="draft"
          className="flex-1 border border-navy/30 text-navy py-3 hover:bg-navy/5 transition-colors duration-200 text-sm"
        >
          {dict.submit.form_save_draft}
        </button>
        <button
          type="submit"
          name="intent"
          value="submit"
          className="flex-1 bg-navy text-white py-3 hover:bg-navy/90 transition-colors duration-200 text-sm"
        >
          {dict.submit.form_submit}
        </button>
      </div>
    </form>
  )
}
