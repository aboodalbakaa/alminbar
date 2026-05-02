import Link from 'next/link'
import type { Locale } from '@/i18n.config'
import type { Dictionary } from '@/lib/dictionary'

interface Props {
  locale: Locale
  dict: Dictionary
}

export default function Footer({ locale, dict }: Props) {
  const isAr = locale === 'ar'
  const year = new Date().getFullYear()

  return (
    <footer className="bg-navy text-white mt-auto">
      <div className="border-t border-gold/20">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="text-center mb-10">
            <p
              className={`text-gold mb-2 ${isAr ? 'font-arabic text-2xl' : 'font-heading text-xl'}`}
            >
              {dict.footer.tagline}
            </p>
            <p className="text-white/50 text-sm">{dict.footer.tagline_sub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/10 pt-8">
            <div>
              <p
                className={`text-gold/80 text-xs uppercase tracking-widest mb-3 ${isAr ? 'font-arabic' : 'font-body'}`}
              >
                {dict.about.editor_title}
              </p>
              <p className="text-white/60 text-sm leading-relaxed">
                {dict.about.tariq_bio}
              </p>
            </div>

            <div className={isAr ? 'md:text-center' : 'md:text-center'}>
              <p className="text-gold/80 text-xs uppercase tracking-widest mb-3">
                {isAr ? 'المنبر' : 'Al-Minbar'}
              </p>
              <nav className="flex flex-col gap-2">
                {[
                  { href: `/${locale}`, label: dict.nav.home },
                  { href: `/${locale}/articles`, label: dict.nav.articles },
                  { href: `/${locale}/about`, label: dict.nav.about },
                  { href: `/${locale}/submit`, label: dict.nav.submit },
                ].map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-white/50 hover:text-white/80 text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className={isAr ? '' : 'md:text-end'}>
              <p className="text-gold/80 text-xs uppercase tracking-widest mb-3">
                {isAr ? 'المجلس الثقافي العراقي' : 'Iraqi Cultural Council'}
              </p>
              <p className="text-white/50 text-sm leading-relaxed">
                {isAr
                  ? 'المنبر جزء من المنظومة الفكرية للمجلس الثقافي العراقي'
                  : 'Al-Minbar is part of the intellectual network of the Iraqi Cultural Council'}
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-6 text-center">
            <p className="text-white/30 text-xs">
              © {year} {dict.footer.copyright} — {dict.footer.rights}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
