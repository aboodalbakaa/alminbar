import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import { createClient } from '@/lib/supabase/server'
import SubmitForm from '@/components/SubmitForm'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isValidLocale(params.locale)) return {}
  const dict = await getDictionary(params.locale as Locale)
  return { title: dict.nav.submit }
}

export default async function SubmitPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const dict = await getDictionary(locale)
  const isAr = locale === 'ar'

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="py-14 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 pb-8 border-b border-gold/20">
          <h1 className={`text-navy mb-2 ${isAr ? 'font-arabic text-4xl' : 'font-heading text-3xl'}`}>
            {dict.submit.title}
          </h1>
          <p className={`text-gold ${isAr ? 'font-arabic' : 'font-heading italic'}`}>
            {dict.submit.subtitle}
          </p>
        </div>

        {user ? (
          <Suspense>
            <SubmitForm locale={locale} dict={dict} />
          </Suspense>
        ) : (
          <div className="space-y-8">
            {/* Guidelines */}
            <p className={`text-navy/70 leading-relaxed ${isAr ? 'font-arabic text-lg' : 'text-base'}`}>
              {dict.submit.body}
            </p>

            <div>
              <h2 className={`text-gold text-xs uppercase tracking-widest mb-5 ${isAr ? 'font-arabic' : ''}`}>
                {dict.submit.guidelines_title}
              </h2>
              <ul className="space-y-3">
                {dict.submit.guidelines.map((g, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-gold mt-1 flex-shrink-0">◆</span>
                    <span className={`text-navy/70 leading-relaxed ${isAr ? 'font-arabic' : 'text-sm'}`}>{g}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Login prompt */}
            <div className="bg-navy p-8 text-center">
              <p className={`text-white/70 mb-6 ${isAr ? 'font-arabic' : 'text-sm'}`}>
                {dict.submit.login_prompt}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href={`/${locale}/auth/signup`} className="btn-primary">
                  {dict.auth.signup}
                </Link>
                <Link
                  href={`/${locale}/auth/login`}
                  className="inline-block px-6 py-2.5 border border-white/30 text-white/70 hover:text-white hover:border-white/60 transition-colors duration-200 text-sm"
                >
                  {dict.auth.login}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
