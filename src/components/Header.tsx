import Link from 'next/link'
import type { Locale } from '@/i18n.config'
import type { Dictionary } from '@/lib/dictionary'
import LanguageSwitcher from './LanguageSwitcher'
import ZigguratLogo from './ZigguratLogo'
import ZigDivider from './ZigDivider'
import AuthNav from './AuthNav'

interface Props {
  locale: Locale
  dict: Dictionary
}

export default function Header({ locale, dict }: Props) {
  const isAr = locale === 'ar'

  const navLinks = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/articles`, label: dict.nav.articles },
    { href: `/${locale}/writers`, label: isAr ? 'الكتّاب' : 'Writers' },
    { href: `/${locale}/about`, label: dict.nav.about },
    { href: `/${locale}/submit`, label: dict.nav.submit },
  ]

  return (
    <header className="bg-navy text-white">
      {/* Top utility bar */}
      <div className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-2 flex items-center justify-between">
          <span className="text-white/40 text-xs tracking-widest uppercase select-none">
            {isAr ? 'منبر للفكر السياسي العراقي' : 'Iraqi Political Thought'}
          </span>
          <div className="flex items-center gap-4">
            <AuthNav locale={locale} dict={dict} />
            <LanguageSwitcher
              currentLocale={locale}
              label={dict.language.switch_to}
            />
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div className="max-w-5xl mx-auto px-6 py-8 text-center">
        <Link
          href={`/${locale}`}
          className="inline-flex flex-col items-center group"
          aria-label={dict.site.name}
        >
          {/* Ziggurat of Ur — زقورة أور، ذي قار */}
          <ZigguratLogo
            width={88}
            bg="#1B2A4A"
            className="text-gold group-hover:text-gold-light transition-colors duration-200 mb-5"
          />

          <h1
            className={`text-gold leading-none tracking-tight group-hover:text-gold-light transition-colors duration-200 ${
              isAr
                ? 'font-arabic text-5xl md:text-6xl'
                : 'font-heading text-4xl md:text-5xl italic'
            }`}
          >
            {dict.site.name}
          </h1>
        </Link>

        <div className="mt-4 max-w-sm mx-auto text-gold">
          <ZigDivider />
        </div>

        <p className="text-white/50 text-xs tracking-widest uppercase mt-3">
          {dict.site.tagline}
        </p>
      </div>

      {/* Navigation */}
      <nav
        className="border-t border-white/10"
        aria-label={isAr ? 'القائمة الرئيسية' : 'Main navigation'}
      >
        <div className="max-w-5xl mx-auto px-6">
          <ul className="flex items-center justify-center gap-1">
            {navLinks.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-block px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  )
}
