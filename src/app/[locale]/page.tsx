import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import { getAllArticles } from '@/lib/articles'
import { getAllDbArticles } from '@/lib/supabase/articles'
import ArticleCard from '@/components/ArticleCard'

export const dynamic = 'force-dynamic'

export default async function HomePage({
  params,
}: {
  params: { locale: string }
}) {
  if (!isValidLocale(params.locale)) notFound()

  const locale = params.locale as Locale
  const [dict, mdxArticles, dbArticles] = await Promise.all([
    getDictionary(locale),
    Promise.resolve(getAllArticles()),
    getAllDbArticles(),
  ])
  const articles = [...dbArticles, ...mdxArticles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  const isAr = locale === 'ar'
  const latestArticles = articles.slice(0, 6)

  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gold/70 text-sm uppercase tracking-widest mb-6">
            {dict.hero.eyebrow}
          </p>

          <h2
            className={`text-white leading-tight mb-6 whitespace-pre-line ${
              isAr
                ? 'font-arabic text-4xl md:text-5xl'
                : 'font-heading text-3xl md:text-4xl'
            }`}
          >
            {dict.hero.title}
          </h2>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gold/20 max-w-16" />
            <div className="w-1.5 h-1.5 bg-gold/60 rotate-45" />
            <div className="h-px flex-1 bg-gold/20 max-w-16" />
          </div>

          <p className="text-white/65 text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            {dict.hero.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={`/${locale}/articles`} className="btn-primary">
              {dict.hero.cta_read}
            </Link>
            <Link href={`/${locale}/about`} className="btn-outline">
              {dict.hero.cta_about}
            </Link>
          </div>
        </div>
      </section>

      {/* Decorative rule */}
      <div className="h-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* Latest Articles */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="section-heading">{dict.articles.latest_title}</h2>
            {latestArticles.length > 0 && (
              <Link
                href={`/${locale}/articles`}
                className="text-gold hover:text-gold-dark text-sm transition-colors duration-200"
              >
                {dict.articles.all_articles} ←
              </Link>
            )}
          </div>

          {latestArticles.length === 0 ? (
            <div className="text-center py-20 text-navy/40">
              <p className="text-lg">{dict.articles.no_articles}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestArticles.map(article => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  locale={locale}
                  dict={dict}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Platform mission strip */}
      <section className="bg-navy/5 border-t border-navy/10 py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p
            className={`text-navy/70 leading-relaxed ${isAr ? 'font-arabic text-lg' : 'text-base'}`}
          >
            {isAr
              ? 'نحن لا نهاجم الأشخاص — نحلّل الأنظمة. النقد الذي يستحق الاسم يبدأ من التشخيص الدقيق.'
              : 'We do not attack people — we analyse systems. Critique worthy of the name begins with accurate diagnosis.'}
          </p>
          <p className="text-gold text-sm mt-3 font-medium">
            — {isAr ? 'طارق الراشد، المحرر المؤسس' : 'Tariq Al-Rashid, Founding Editor'}
          </p>
        </div>
      </section>
    </>
  )
}
