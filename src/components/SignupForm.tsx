'use client'
import { signup } from '@/app/actions/auth'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { Locale } from '@/i18n.config'
import type { Dictionary } from '@/lib/dictionary'

interface Props {
  locale: Locale
  dict: Dictionary
}

export default function SignupForm({ locale, dict }: Props) {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const isAr = locale === 'ar'

  return (
    <form action={signup} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />

      {error && (
        <p className="text-red-700 text-sm p-3 bg-red-50 border border-red-200">{error}</p>
      )}

      <div>
        <label className="block text-navy/60 text-xs uppercase tracking-widest mb-2">
          {dict.auth.display_name}
        </label>
        <input
          type="text"
          name="display_name"
          required
          autoComplete="name"
          className="w-full border border-navy/20 px-4 py-3 text-navy focus:outline-none focus:border-gold transition-colors"
        />
      </div>

      <div>
        <label className="block text-navy/60 text-xs uppercase tracking-widest mb-2">
          {dict.auth.email}
        </label>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="w-full border border-navy/20 px-4 py-3 text-navy focus:outline-none focus:border-gold transition-colors"
        />
      </div>

      <div>
        <label className="block text-navy/60 text-xs uppercase tracking-widest mb-2">
          {dict.auth.password}
        </label>
        <input
          type="password"
          name="password"
          required
          autoComplete="new-password"
          minLength={8}
          className="w-full border border-navy/20 px-4 py-3 text-navy focus:outline-none focus:border-gold transition-colors"
        />
        <p className="text-navy/35 text-xs mt-1">{dict.auth.password_hint}</p>
      </div>

      <button
        type="submit"
        className="w-full bg-navy text-white py-3 hover:bg-navy/90 transition-colors duration-200 text-sm tracking-wide"
      >
        {dict.auth.signup_submit}
      </button>

      <p className={`text-center text-navy/50 text-sm ${isAr ? 'font-arabic' : ''}`}>
        {dict.auth.have_account}{' '}
        <Link
          href={`/${locale}/auth/login`}
          className="text-gold hover:text-gold-dark underline transition-colors"
        >
          {dict.auth.login}
        </Link>
      </p>
    </form>
  )
}
