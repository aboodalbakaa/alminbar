import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import { createClient } from '@/lib/supabase/server'
import SubmitForm from '@/components/SubmitForm'
import type { Submission } from '@/types/submission'

export default async function EditSubmissionPage({
  params,
}: {
  params: { locale: string; id: string }
}) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const dict = await getDictionary(locale)
  const isAr = locale === 'ar'

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/auth/login`)

  const { data: submission } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', params.id)
    .eq('author_id', user.id)
    .single()

  if (!submission) notFound()
  if (!['draft', 'rejected'].includes(submission.status)) {
    redirect(`/${locale}/dashboard`)
  }

  return (
    <div className="py-14 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 pb-8 border-b border-gold/20">
          <h1 className={`text-navy mb-2 ${isAr ? 'font-arabic text-4xl' : 'font-heading text-3xl'}`}>
            {dict.submit.edit_title}
          </h1>
          {submission.rejection_reason && (
            <p className="mt-3 text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-3">
              {dict.submit.rejected_reason}: {submission.rejection_reason}
            </p>
          )}
        </div>
        <Suspense>
          <SubmitForm locale={locale} dict={dict} draft={submission as Submission} />
        </Suspense>
      </div>
    </div>
  )
}
