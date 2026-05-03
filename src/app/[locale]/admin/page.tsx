import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { approveComment, rejectComment } from '@/app/actions/admin'
import AdminTabs from '@/components/AdminTabs'
import SubmissionReview from '@/components/SubmissionReview'
import RoleSelector from '@/components/RoleSelector'
import DeleteSubmissionButton from '@/components/DeleteSubmissionButton'
import type { Submission } from '@/types/submission'
import type { Comment } from '@/types/comment'
import type { Profile } from '@/types/profile'

export const dynamic = 'force-dynamic'

export default async function AdminPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const dict = await getDictionary(locale)
  const isAr = locale === 'ar'

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/auth/login`)

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') notFound()

  const admin = createAdminClient()

  const [
    { data: pendingSubs },
    { data: pendingComments },
    { data: allUsers },
    { data: allArticles },
    { count: totalUsers },
    { count: totalPublished },
    { count: totalComments },
  ] = await Promise.all([
    admin.from('submissions').select('*, profiles!submissions_author_id_fkey(display_name)')
      .in('status', ['pending', 'draft']).order('created_at', { ascending: true }),
    admin.from('comments').select('*, profiles!comments_author_id_fkey(display_name)')
      .eq('status', 'pending').order('created_at', { ascending: true }),
    admin.from('profiles').select('*').order('created_at', { ascending: false }),
    admin.from('submissions').select('id, title_ar, title_en, status, created_at, profiles!submissions_author_id_fkey(display_name)')
      .neq('status', 'rejected').order('created_at', { ascending: false }),
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('submissions').select('*', { count: 'exact', head: true }).in('status', ['approved', 'published']),
    admin.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
  ])

  const subs = (pendingSubs ?? []) as Submission[]
  const comments = (pendingComments ?? []) as Comment[]
  const users = (allUsers ?? []) as Profile[]

  const reviewLabels = {
    approve: dict.admin.approve,
    reject: dict.admin.reject,
    rejection_reason: dict.admin.rejection_reason,
    read_more: isAr ? 'اقرأ المقالة' : 'Read article',
    collapse: isAr ? 'أخفِ' : 'Collapse',
  }

  const roleColour: Record<string, string> = {
    reader: 'text-navy/40 bg-navy/5',
    contributor: 'text-blue-700 bg-blue-50',
    editor: 'text-amber-700 bg-amber-50',
    admin: 'text-gold bg-gold/10',
  }

  return (
    <div className="py-10 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className={`text-navy mb-1 ${isAr ? 'font-arabic text-3xl' : 'font-heading text-2xl'}`}>
            {dict.admin.title}
          </h1>
          <p className="text-navy/35 text-xs uppercase tracking-widest">
            {isAr ? 'المنبر — لوحة التحكم الداخلية' : 'Al-Minbar — Internal Operations'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: isAr ? 'المستخدمون' : 'Users', value: totalUsers ?? 0, accent: false },
            { label: isAr ? 'مقالات معلقة' : 'Pending', value: subs.length, accent: subs.length > 0 },
            { label: isAr ? 'مقالات منشورة' : 'Approved', value: totalPublished ?? 0, accent: false },
            { label: isAr ? 'تعليقات مقبولة' : 'Comments', value: totalComments ?? 0, accent: false },
          ].map(stat => (
            <div key={stat.label} className={`border p-5 ${stat.accent ? 'border-gold/40 bg-gold/5' : 'border-navy/10'}`}>
              <p className={`text-2xl font-heading font-bold mb-1 ${stat.accent ? 'text-gold' : 'text-navy'}`}>
                {stat.value}
              </p>
              <p className="text-navy/40 text-xs uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <AdminTabs
          tabs={[
            { id: 'articles', label: isAr ? 'كل المقالات' : 'All Articles', count: (allArticles ?? []).length },
            { id: 'submissions', label: isAr ? 'قيد المراجعة' : 'Pending', count: subs.length },
            { id: 'comments', label: isAr ? 'التعليقات' : 'Comments', count: comments.length },
            { id: 'users', label: isAr ? 'المستخدمون' : 'Users', count: users.length },
          ]}
        >
          {/* Tab 1 — All Articles */}
          <div className="space-y-2">
            {(allArticles ?? []).length === 0 ? (
              <div className="text-center py-16 text-navy/25">
                <p className={isAr ? 'font-arabic' : ''}>{isAr ? 'لا توجد مقالات بعد' : 'No articles yet'}</p>
              </div>
            ) : (
              (allArticles ?? []).map((a: any) => {
                const title = isAr ? a.title_ar : (a.title_en || a.title_ar)
                const statusColour: Record<string, string> = {
                  draft: 'text-navy/40 bg-navy/5',
                  pending: 'text-amber-700 bg-amber-50',
                  approved: 'text-emerald-700 bg-emerald-50',
                  published: 'text-gold bg-gold/10',
                }
                return (
                  <div key={a.id} className="border border-navy/10 p-4 flex items-center gap-4 hover:border-gold/20 transition-colors">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/${locale}/articles/${a.id}`}
                        target="_blank"
                        className={`text-navy font-medium text-sm truncate block hover:text-gold transition-colors ${isAr ? 'font-arabic' : ''}`}
                      >
                        {title}
                      </Link>
                      <p className="text-navy/35 text-xs mt-0.5">
                        {a.profiles?.display_name} · {new Date(a.created_at).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB')}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 flex-shrink-0 ${statusColour[a.status] ?? 'text-navy/40 bg-navy/5'}`}>
                      {a.status}
                    </span>
                    <DeleteSubmissionButton id={a.id} locale={locale} redirectTo={`/${locale}/admin`} />
                  </div>
                )
              })
            )}
          </div>

          {/* Tab 2 — Submissions (pending/draft) */}
          <div className="space-y-4">
            {subs.length === 0 ? (
              <div className="text-center py-16 text-navy/25">
                <p className="text-4xl mb-3">✓</p>
                <p className={isAr ? 'font-arabic' : ''}>{dict.admin.no_pending}</p>
              </div>
            ) : (
              subs.map(sub => (
                <SubmissionReview key={sub.id} sub={sub} isAr={isAr} labels={reviewLabels} />
              ))
            )}
          </div>

          {/* Tab 3 — Comments */}
          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="text-center py-16 text-navy/25">
                <p className="text-4xl mb-3">✓</p>
                <p className={isAr ? 'font-arabic' : ''}>{dict.admin.no_pending}</p>
              </div>
            ) : (
              comments.map(c => (
                <div key={c.id} className="border border-navy/10 p-5 hover:border-gold/20 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-full bg-navy/10 flex items-center justify-center text-xs text-navy/40 font-semibold flex-shrink-0">
                      {c.profiles?.display_name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-navy text-sm font-medium">{c.profiles?.display_name}</span>
                    <span className="text-navy/25 text-xs">·</span>
                    <span className="text-navy/35 text-xs font-mono">{c.article_slug}</span>
                    <span className="text-navy/25 ms-auto text-xs">
                      {new Date(c.created_at).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB')}
                    </span>
                  </div>
                  <p className={`text-navy/70 text-sm leading-relaxed mb-4 ${isAr ? 'font-arabic' : ''}`}>
                    {c.body}
                  </p>
                  <div className="flex gap-3">
                    <form action={approveComment}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className="bg-emerald-700 text-white text-xs px-4 py-1.5 hover:bg-emerald-800 transition-colors">
                        ✓ {dict.admin.approve}
                      </button>
                    </form>
                    <form action={rejectComment}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className="border border-red-300 text-red-600 text-xs px-4 py-1.5 hover:bg-red-50 transition-colors">
                        ✕ {dict.admin.reject}
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Tab 4 — Users */}
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="border border-navy/10 p-4 flex items-center gap-4 hover:border-gold/20 transition-colors">
                <div className="w-9 h-9 rounded-full bg-navy/10 flex items-center justify-center text-sm text-navy/40 font-semibold flex-shrink-0">
                  {u.display_name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-navy text-sm font-medium truncate">{u.display_name}</p>
                  <p className="text-navy/35 text-xs">
                    {new Date(u.created_at).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB')}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 flex-shrink-0 ${roleColour[u.role] ?? 'text-navy/40 bg-navy/5'}`}>
                  {u.role}
                </span>
                <RoleSelector userId={u.id} currentRole={u.role} />
              </div>
            ))}
          </div>
        </AdminTabs>

      </div>
    </div>
  )
}
