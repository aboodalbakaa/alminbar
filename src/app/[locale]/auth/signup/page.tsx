import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import SignupForm from '@/components/SignupForm'

export default async function SignupPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const dict = await getDictionary(locale)
  const isAr = locale === 'ar'

  return (
    <div className="py-16 px-6">
      <div className="max-w-md mx-auto">
        <div className="mb-10 pb-8 border-b border-gold/20">
          <h1 className={`text-navy mb-1 ${isAr ? 'font-arabic text-3xl' : 'font-heading text-2xl'}`}>
            {dict.auth.signup_title}
          </h1>
          <p className="text-navy/45 text-sm">{dict.auth.signup_subtitle}</p>
        </div>
        <Suspense>
          <SignupForm locale={locale} dict={dict} />
        </Suspense>
      </div>
    </div>
  )
}
