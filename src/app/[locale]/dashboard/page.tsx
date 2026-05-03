import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import { createClient } from '@/lib/supabase/server'
import type { Submission } from '@/types/submission'
import DeleteSubmissionButton from '@/components/DeleteSubmissionButton'

const statusColour: Record<string, string> = {
  draft: 'text-navy/40 bg-navy/5',
  pending: 'text-amber-700 bg-amber-50',
  approved: 'text-emerald-700 bg-emerald-50',
  rejected: 'text-red-700 bg-red-50',
  published: 'text-gold bg-gold/10',
}

export default async function DashboardPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const dict = await getDictionary(locale)
  const isAr = locale === 'ar'

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/auth/login`)

  const { data: submissions } = await supabase
    .from('submissions')
    .select('*')
    .eq('author_id', user.id)
    .order('updated_at', { ascending: false })

  const list = (submissions ?? []) as Submission[]

  return (
    <div className="py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-gold/20">
          <h1 className={`text-navy ${isAr ? 'font-arabic text-3xl' : 'font-heading text-2xl'}`}>
            {dict.dashboard.title}
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/dashboard/profile`}
              className="btn-secondary text-sm"
            >
              {isAr ? 'الملف الشخصي' : 'Profile'}
            </Link>
            <Link href={`/${locale}/submit`} className="btn-primary text-sm">
              {dict.dashboard.new_submission}
            </Link>
          </div>
        </div>

        <h2 className="text-gold text-xs uppercase tracking-widest mb-5">
          {dict.dashboard.my_submissions}
        </h2>

        {list.length === 0 ? (
          <div className="text-center py-16 text-navy/30">
            <p className={isAr ? 'font-arabic' : ''}>{dict.dashboard.no_submissions}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map(sub => {
              const title = isAr ? sub.title_ar : sub.title_en
              return (
                <div
                  key={sub.id}
                  className="border border-navy/10 p-5 hover:border-gold/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className={`text-navy font-medium leading-snug truncate ${isAr ? 'font-arabic' : 'font-heading'}`}>
                        {title || sub.title_ar}
                      </p>
                      <p className="text-navy/40 text-xs mt-1">
                        {new Date(sub.updated_at).toLocaleDateString(
                          locale === 'ar' ? 'ar-IQ' : 'en-GB',
                        )}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 flex-shrink-0 ${statusColour[sub.status] ?? 'text-navy/40 bg-navy/5'}`}
                    >
                      {dict.dashboard[`status_${sub.status}` as keyof typeof dict.dashboard] ?? sub.status}
                    </span>
                  </div>

                  {sub.rejection_reason && (
                    <p className="text-red-600 text-xs mt-3 border-t border-red-100 pt-3">
                      {sub.rejection_reason}
                    </p>
                  )}

                  <div className="mt-3 pt-3 border-t border-navy/10 flex items-center justify-between gap-4">
                    <div>
                      {['draft', 'rejected'].includes(sub.status) && (
                        <Link
                          href={`/${locale}/submit/edit/${sub.id}`}
                          className="text-gold hover:text-gold-dark text-xs transition-colors duration-200"
                        >
                          {dict.dashboard.edit} →
                        </Link>
                      )}
                    </div>
                    <DeleteSubmissionButton id={sub.id} locale={locale} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
