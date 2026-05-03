'use client'
import { signout } from '@/app/actions/auth'

interface Props {
  locale: string
  label: string
}

export default function SignoutButton({ locale, label }: Props) {
  return (
    <form action={signout}>
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        className="text-white/40 hover:text-white/70 text-xs transition-colors duration-200"
      >
        {label}
      </button>
    </form>
  )
}
