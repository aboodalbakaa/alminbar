'use client'
import { login } from '@/app/actions/auth'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { Locale } from '@/i18n.config'
import type { Dictionary } from '@/lib/dictionary'

interface Props {
  locale: Locale
  dict: Dictionary
}

export default function LoginForm({ locale, dict }: Props) {
  const searchParams = useSearchParams()
  const hasError = searchParams.get('error')
  const isAr = locale === 'ar'

  return (
    <form action={login} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />

      {hasError && (
        <p className="text-red-700 text-sm p-3 bg-red-50 border border-red-200">
          {dict.auth.error_invalid}
        </p>
      )}

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
          autoComplete="current-password"
          className="w-full border border-navy/20 px-4 py-3 text-navy focus:outline-none focus:border-gold transition-colors"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-navy text-white py-3 hover:bg-navy/90 transition-colors duration-200 text-sm tracking-wide"
      >
        {dict.auth.login_submit}
      </button>

      <p className={`text-center text-navy/50 text-sm ${isAr ? 'font-arabic' : ''}`}>
        {dict.auth.no_account}{' '}
        <Link
          href={`/${locale}/auth/signup`}
          className="text-gold hover:text-gold-dark underline transition-colors"
        >
          {dict.auth.signup}
        </Link>
      </p>
    </form>
  )
}
