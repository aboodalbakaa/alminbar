'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { postComment } from '@/app/actions/comments'
import type { Locale } from '@/i18n.config'
import type { Dictionary } from '@/lib/dictionary'
import type { Comment } from '@/types/comment'

interface Props {
  locale: Locale
  dict: Dictionary
  articleSlug: string
  initialComments: Comment[]
  userId: string | null
}

function formatDate(dateStr: string, locale: Locale) {
  return new Date(dateStr).toLocaleDateString(locale === 'ar' ? 'ar-IQ' : 'en-GB', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export default function LiveComments({ locale, dict, articleSlug, initialComments, userId }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const isAr = locale === 'ar'

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`comments:${articleSlug}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments',
          filter: `article_slug=eq.${articleSlug}`,
        },
        async (payload) => {
          if (payload.new.status === 'approved') {
            const { data } = await supabase
              .from('comments')
              .select('*, profiles(display_name)')
              .eq('id', payload.new.id)
              .single()
            if (data) {
              setComments(prev => {
                if (prev.find(c => c.id === data.id)) return prev
                return [...prev, data as Comment]
              })
            }
          }
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [articleSlug])

  async function handleSubmit(formData: FormData) {
    setSubmitting(true)
    await postComment(formData)
    formRef.current?.reset()
    setSubmitting(false)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <section className="mt-14 pt-10 border-t border-gold/20">
      <h2 className={`text-navy mb-8 ${isAr ? 'font-arabic text-2xl' : 'font-heading text-xl'}`}>
        {dict.comments.title}
        {comments.length > 0 && (
          <span className="text-navy/30 text-base font-normal ms-2">({comments.length})</span>
        )}
      </h2>

      {/* Comment list */}
      {comments.length === 0 ? (
        <p className={`text-navy/40 text-sm ${isAr ? 'font-arabic' : ''}`}>
          {dict.comments.no_comments}
        </p>
      ) : (
        <div className="space-y-6">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-navy/40 text-xs font-semibold">
                  {comment.profiles?.display_name?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-navy text-sm font-medium">{comment.profiles?.display_name}</span>
                  <time className="text-navy/35 text-xs">{formatDate(comment.created_at, locale)}</time>
                </div>
                <p className={`text-navy/70 text-sm leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
                  {comment.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      <div className="mt-10 pt-8 border-t border-navy/10">
        {userId ? (
          <form ref={formRef} action={handleSubmit}>
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
              <p className={`text-xs ${submitted ? 'text-emerald-600' : 'text-navy/35'}`}>
                {submitted ? (isAr ? 'تم إرسال تعليقك، سيظهر بعد المراجعة.' : 'Submitted — will appear after review.') : dict.comments.pending_notice}
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="bg-navy text-white text-sm px-6 py-2 hover:bg-navy/90 transition-colors duration-200 disabled:opacity-50"
              >
                {submitting ? (isAr ? 'جارٍ الإرسال…' : 'Posting…') : dict.comments.submit}
              </button>
            </div>
          </form>
        ) : (
          <p className={`text-navy/50 text-sm ${isAr ? 'font-arabic' : ''}`}>
            {dict.comments.login_to_comment}{' '}
            <a href={`/${locale}/auth/login`} className="text-gold hover:underline">
              {dict.auth.login}
            </a>
          </p>
        )}
      </div>
    </section>
  )
}
