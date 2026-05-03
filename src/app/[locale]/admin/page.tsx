import { notFound, redirect } from 'next/navigation'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import { createClient } from '@/lib/supabase/server'
import { approveSubmission, rejectSubmission, approveComment, rejectComment } from '@/app/actions/admin'
import type { Submission } from '@/types/submission'
import type { Comment } from '@/types/comment'

export default async function AdminPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const dict = await getDictionary(locale)
  const isAr = locale === 'ar'

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/auth/login`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') notFound()

  const [{ data: pendingSubmissions }, { data: pendingComments }] = await Promise.all([
    supabase
      .from('submissions')
      .select('*, profiles(display_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),
    supabase
      .from('comments')
      .select('*, profiles(display_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),
  ])

  const subs = (pendingSubmissions ?? []) as Submission[]
  const comments = (pendingComments ?? []) as Comment[]

  const btnBase = 'text-xs px-4 py-2 transition-colors duration-200'

  return (
    <div className="py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className={`text-navy mb-10 pb-6 border-b border-gold/20 ${isAr ? 'font-arabic text-3xl' : 'font-heading text-2xl'}`}>
          {dict.admin.title}
        </h1>

        {/* Pending Submissions */}
        <section className="mb-14">
          <h2 className="text-gold text-xs uppercase tracking-widest mb-6">
            {dict.admin.pending_submissions} ({subs.length})
          </h2>

          {subs.length === 0 ? (
            <p className="text-navy/35 text-sm">{dict.admin.no_pending}</p>
          ) : (
            <div className="space-y-6">
              {subs.map(sub => (
                <div key={sub.id} className="border border-navy/10 p-6">
                  <div className="mb-1">
                    <span className="text-gold text-xs uppercase tracking-widest">{sub.topic_ar}</span>
                  </div>
                  <p className="font-arabic text-navy font-semibold text-lg leading-snug mb-1">{sub.title_ar}</p>
                  {sub.title_en && <p className="font-heading text-navy/60 text-sm mb-3">{sub.title_en}</p>}
                  <p className="text-navy/45 text-xs mb-4">
                    {sub.profiles?.display_name} ·{' '}
                    {new Date(sub.created_at).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB')}
                  </p>
                  {sub.excerpt_ar && (
                    <p className="font-arabic text-navy/60 text-sm leading-relaxed mb-4 border-s-2 border-gold/30 ps-3">
                      {sub.excerpt_ar}
                    </p>
                  )}
                  <div className="flex gap-3 pt-4 border-t border-navy/10">
                    <form action={approveSubmission}>
                      <input type="hidden" name="id" value={sub.id} />
                      <button type="submit" className={`${btnBase} bg-emerald-700 text-white hover:bg-emerald-800`}>
                        {dict.admin.approve}
                      </button>
                    </form>
                    <form action={rejectSubmission} className="flex gap-2 flex-1">
                      <input type="hidden" name="id" value={sub.id} />
                      <input
                        type="text"
                        name="reason"
                        placeholder={dict.admin.rejection_reason}
                        className="flex-1 border border-navy/20 px-3 py-1.5 text-xs text-navy focus:outline-none focus:border-gold"
                      />
                      <button type="submit" className={`${btnBase} border border-red-300 text-red-700 hover:bg-red-50`}>
                        {dict.admin.reject}
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pending Comments */}
        <section>
          <h2 className="text-gold text-xs uppercase tracking-widest mb-6">
            {dict.admin.pending_comments} ({comments.length})
          </h2>

          {comments.length === 0 ? (
            <p className="text-navy/35 text-sm">{dict.admin.no_pending}</p>
          ) : (
            <div className="space-y-4">
              {comments.map(c => (
                <div key={c.id} className="border border-navy/10 p-5">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-navy text-sm font-medium">{c.profiles?.display_name}</span>
                    <span className="text-navy/35 text-xs">
                      {new Date(c.created_at).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB')}
                    </span>
                    <span className="text-navy/30 text-xs">→ {c.article_slug}</span>
                  </div>
                  <p className="text-navy/70 text-sm leading-relaxed mb-4">{c.body}</p>
                  <div className="flex gap-3">
                    <form action={approveComment}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className={`${btnBase} bg-emerald-700 text-white hover:bg-emerald-800`}>
                        {dict.admin.approve}
                      </button>
                    </form>
                    <form action={rejectComment}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className={`${btnBase} border border-red-300 text-red-700 hover:bg-red-50`}>
                        {dict.admin.reject}
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
