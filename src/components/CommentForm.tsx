'use client'
import { postComment } from '@/app/actions/comments'
import type { Locale } from '@/i18n.config'
import type { Dictionary } from '@/lib/dictionary'

interface Props {
  locale: Locale
  dict: Dictionary
  articleSlug: string
}

export default function CommentForm({ locale, dict, articleSlug }: Props) {
  const isAr = locale === 'ar'

  return (
    <form action={postComment} className="mt-6">
      <input type="hidden" name="article_slug" value={articleSlug} />
      <input type="hidden" name="locale" value={locale} />
      <label className="block text-navy/60 text-xs uppercase tracking-widest mb-2">
        {dict.comments.write_comment}
      </label>
      <textarea
        name="body"
        required
        rows={4}
        dir={isAr ? 'rtl' : 'ltr'}
        className={`w-full border border-navy/20 px-4 py-3 text-navy focus:outline-none focus:border-gold transition-colors text-sm resize-y ${isAr ? 'font-arabic' : ''}`}
        placeholder={isAr ? 'اكتب تعليقك هنا…' : 'Write your comment here…'}
      />
      <div className="flex items-center justify-between mt-3">
        <p className="text-navy/35 text-xs">{dict.comments.pending_notice}</p>
        <button
          type="submit"
          className="bg-navy text-white text-sm px-6 py-2 hover:bg-navy/90 transition-colors duration-200"
        >
          {dict.comments.submit}
        </button>
      </div>
    </form>
  )
}
