import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import { getAllArticles } from '@/lib/articles'
import { getAllDbArticles } from '@/lib/supabase/articles'
import ArticleCard from '@/components/ArticleCard'
import ZigDivider from '@/components/ZigDivider'
import ZigInline from '@/components/ZigInline'

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
      {/* Masthead Hero — "In this issue" contents index */}
      <section
        className="relative border-b py-10 px-6 overflow-hidden"
        style={{ borderColor: 'var(--clay-line, #E4DCC9)', background: 'var(--clay, #FAFAF6)' }}
      >
        <div className="tessellation" />
        <div className="max-w-5xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
          <div className="text-center mb-8">
            <p className="eyebrow">{isAr ? 'محتويات هذا العدد' : 'In this issue'}</p>
            <div className="flex justify-center mt-2 text-gold">
              <ZigInline size={14} />
            </div>
          </div>

          {latestArticles.length > 0 && (
            <div
              className="grid border-t border-b"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                borderColor: 'var(--clay-line, #E4DCC9)',
              }}
            >
              {latestArticles.map((article, i) => (
                <Link
                  key={article.slug}
                  href={`/${locale}/articles/${article.slug}`}
                  className="block p-6 hover:bg-[#F1ECDF] transition-colors border-r last:border-r-0"
                  style={{ borderColor: 'var(--clay-line, #E4DCC9)' }}
                >
                  <span
                    className="block text-xs mb-2"
                    style={{
                      fontFamily: 'var(--font-mono-stack)',
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: 'var(--gold)',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')} · {isAr ? article.topic_ar : article.topic_en}
                  </span>
                  <h3
                    className={`text-navy leading-snug font-bold ${isAr ? 'font-arabic text-base' : 'font-heading text-base italic'}`}
                  >
                    {isAr ? article.title_ar : article.title_en}
                  </h3>
                </Link>
              ))}
            </div>
          )}

          {latestArticles.length === 0 && (
            <div className="text-center py-16 text-navy/40">
              <p className="text-lg">{dict.articles.no_articles}</p>
            </div>
          )}
        </div>
      </section>

      {/* ZigDivider between hero and articles */}
      <div className="px-6 py-4 max-w-5xl mx-auto w-full text-gold">
        <ZigDivider />
      </div>

      {/* Latest Articles */}
      <section className="py-12 px-6">
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

      {/* Archive strip */}
      <section className="py-12 px-6" style={{ background: '#F1ECDF', borderTop: '1px solid #E4DCC9' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-end mb-6">
            <h2
              className={`text-navy font-bold relative ${isAr ? 'font-arabic text-2xl' : 'font-heading text-xl italic'}`}
              style={{ paddingBottom: '0.75rem', borderBottom: '2px solid var(--gold)' }}
            >
              {isAr ? 'من الأرشيف' : 'From the Archive'}
            </h2>
            <Link
              href={`/${locale}/articles`}
              className="text-sm"
              style={{ color: 'var(--gold)' }}
            >
              {isAr ? 'كل المقالات ←' : 'All essays →'}
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: '#E4DCC9' }}>
            {articles.map(a => (
              <Link
                key={a.slug}
                href={`/${locale}/articles/${a.slug}`}
                className="flex items-center justify-between gap-4 py-3 hover:text-[#B8923A] transition-colors group"
              >
                <time
                  className="text-xs flex-shrink-0"
                  style={{ fontFamily: 'var(--font-mono-stack)', color: '#8794AB', letterSpacing: '0.1em' }}
                >
                  {new Date(a.date).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', { year: 'numeric', month: 'short' })}
                </time>
                <span className={`flex-1 text-navy font-medium group-hover:text-[#B8923A] transition-colors ${isAr ? 'font-arabic' : ''}`}>
                  {isAr ? a.title_ar : a.title_en}
                </span>
                <span
                  className="text-xs flex-shrink-0"
                  style={{
                    fontFamily: 'var(--font-mono-stack)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                  }}
                >
                  {isAr ? a.topic_ar : a.topic_en}
                </span>
              </Link>
            ))}
          </div>
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
