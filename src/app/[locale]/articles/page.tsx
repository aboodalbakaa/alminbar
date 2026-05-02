import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import { getAllArticles } from '@/lib/articles'
import ArticleCard from '@/components/ArticleCard'

export async function generateMetadata({
  params,
}: {
  params: { locale: string }
}): Promise<Metadata> {
  if (!isValidLocale(params.locale)) return {}
  const dict = await getDictionary(params.locale as Locale)
  return { title: dict.nav.articles }
}

export default async function ArticlesPage({
  params,
}: {
  params: { locale: string }
}) {
  if (!isValidLocale(params.locale)) notFound()

  const locale = params.locale as Locale
  const [dict, articles] = await Promise.all([
    getDictionary(locale),
    Promise.resolve(getAllArticles()),
  ])

  const isAr = locale === 'ar'

  return (
    <div className="py-14 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 pb-8 border-b border-gold/20">
          <h1
            className={`text-navy mb-2 ${isAr ? 'font-arabic text-4xl' : 'font-heading text-3xl'}`}
          >
            {dict.nav.articles}
          </h1>
          <p className="text-navy/50 text-sm">{dict.site.tagline}</p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-24 text-navy/40">
            <p className="text-xl">{dict.articles.no_articles}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
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
    </div>
  )
}
