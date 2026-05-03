import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Locale } from '@/i18n.config'
import type { Dictionary } from '@/lib/dictionary'
import SignoutButton from './SignoutButton'

interface Props {
  locale: Locale
  dict: Dictionary
}

export default async function AuthNav({ locale, dict }: Props) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/auth/login`}
          className="text-white/55 hover:text-white text-xs transition-colors duration-200"
        >
          {dict.auth.login}
        </Link>
        <Link
          href={`/${locale}/auth/signup`}
          className="text-xs border border-gold/40 hover:border-gold text-gold px-3 py-1 transition-colors duration-200"
        >
          {dict.auth.signup}
        </Link>
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex items-center gap-4">
      <Link
        href={`/${locale}/dashboard`}
        className="text-white/60 hover:text-white text-xs transition-colors duration-200"
      >
        {profile?.display_name ?? user.email}
      </Link>
      {profile?.role === 'admin' && (
        <Link
          href={`/${locale}/admin`}
          className="text-gold/60 hover:text-gold text-xs transition-colors duration-200"
        >
          {dict.auth.admin_panel}
        </Link>
      )}
      <SignoutButton locale={locale} label={dict.auth.logout} />
    </div>
  )
}
