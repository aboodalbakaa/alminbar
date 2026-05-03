import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Locale } from '@/i18n.config'
import type { Dictionary } from '@/lib/dictionary'
import type { Comment } from '@/types/comment'
import CommentForm from './CommentForm'

interface Props {
  locale: Locale
  dict: Dictionary
  articleSlug: string
}

function formatDate(dateStr: string, locale: Locale) {
  return new Date(dateStr).toLocaleDateString(locale === 'ar' ? 'ar-IQ' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function CommentsSection({ locale, dict, articleSlug }: Props) {
  const supabase = createClient()

  const [{ data: { user } }, { data: comments }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('comments')
      .select('*, profiles(display_name)')
      .eq('article_slug', articleSlug)
      .eq('status', 'approved')
      .order('created_at', { ascending: true }),
  ])

  const isAr = locale === 'ar'
  const list = (comments ?? []) as Comment[]

  return (
    <section className="mt-14 pt-10 border-t border-gold/20">
      <h2
        className={`text-navy mb-8 ${isAr ? 'font-arabic text-2xl' : 'font-heading text-xl'}`}
      >
        {dict.comments.title}
        {list.length > 0 && (
          <span className="text-navy/30 text-base font-normal ms-2">({list.length})</span>
        )}
      </h2>

      {list.length === 0 ? (
        <p className={`text-navy/40 text-sm ${isAr ? 'font-arabic' : ''}`}>
          {dict.comments.no_comments}
        </p>
      ) : (
        <div className="space-y-6">
          {list.map(comment => (
            <div key={comment.id} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-navy/40 text-xs font-semibold">
                  {comment.profiles?.display_name?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-navy text-sm font-medium">
                    {comment.profiles?.display_name}
                  </span>
                  <time className="text-navy/35 text-xs">
                    {formatDate(comment.created_at, locale)}
                  </time>
                </div>
                <p className={`text-navy/70 text-sm leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
                  {comment.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 pt-8 border-t border-navy/10">
        {user ? (
          <CommentForm locale={locale} dict={dict} articleSlug={articleSlug} />
        ) : (
          <p className={`text-navy/50 text-sm ${isAr ? 'font-arabic' : ''}`}>
            {dict.comments.login_to_comment}{' '}
            <Link href={`/${locale}/auth/login`} className="text-gold hover:underline">
              {dict.auth.login}
            </Link>
          </p>
        )}
      </div>
    </section>
  )
}
