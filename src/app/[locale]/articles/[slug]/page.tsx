import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { isValidLocale, locales } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import { getAllArticles, getArticleBySlug, getArticleSlugs } from '@/lib/articles'
import LazySummary from '@/components/LazySummary'

export function generateStaticParams() {
  const slugs = getArticleSlugs()
  return locales.flatMap(locale =>
    slugs.map(slug => ({ locale, slug })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string }
}): Promise<Metadata> {
  if (!isValidLocale(params.locale)) return {}
  const locale = params.locale as Locale
  const article = getArticleBySlug(params.slug)
  const isAr = locale === 'ar'

  return {
    title: isAr ? article.title_ar : article.title_en,
    description: isAr ? article.excerpt_ar : article.excerpt_en,
    openGraph: {
      title: isAr ? article.title_ar : article.title_en,
      description: isAr ? article.excerpt_ar : article.excerpt_en,
      type: 'article',
      publishedTime: article.date,
      authors: [article.author],
    },
  }
}

function formatDate(dateStr: string, locale: Locale): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(locale === 'ar' ? 'ar-IQ' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function ArticlePage({
  params,
}: {
  params: { locale: string; slug: string }
}) {
  if (!isValidLocale(params.locale)) notFound()

  const locale = params.locale as Locale
  const isAr = locale === 'ar'

  let article
  try {
    article = getArticleBySlug(params.slug)
  } catch {
    notFound()
  }

  const dict = await getDictionary(locale)
  const title = isAr ? article.title_ar : article.title_en
  const topic = isAr ? article.topic_ar : article.topic_en

  return (
    <div className="py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href={`/${locale}/articles`}
          className="inline-flex items-center gap-2 text-gold hover:text-gold-dark text-sm mb-10 transition-colors duration-200"
        >
          {isAr ? '→' : '←'} {dict.articles.back_to_articles}
        </Link>

        {/* Article header */}
        <header className="mb-10 pb-8 border-b border-gold/20">
          <div className="mb-4">
            <span className="text-gold text-xs uppercase tracking-widest font-semibold">
              {topic}
            </span>
          </div>

          <h1
            className={`text-navy leading-snug mb-6 ${
              isAr ? 'font-arabic text-3xl md:text-4xl' : 'font-heading text-2xl md:text-3xl'
            }`}
          >
            {title}
          </h1>

          <div className="flex items-center gap-4 text-navy/50 text-sm flex-wrap">
            <span>
              {dict.articles.by}{' '}
              <span className="text-navy/80 font-medium">{article.author}</span>
            </span>
            <span>·</span>
            <time dateTime={article.date}>{formatDate(article.date, locale)}</time>
            <span>·</span>
            <span>
              {article.readingTimeMinutes}{' '}
              {article.readingTimeMinutes === 1
                ? dict.articles.minute_read
                : dict.articles.minutes_read}
            </span>
          </div>
        </header>

        {/* Lazy summary — shown when article has one */}
        {((isAr && article.lazy_ar?.length) || (!isAr && article.lazy_en?.length)) && (
          <LazySummary
            points={(isAr ? article.lazy_ar : article.lazy_en) ?? []}
            locale={locale}
            labels={dict.lazy}
          />
        )}

        {/* Article body */}
        <div
          className={`prose prose-lg max-w-none ${
            isAr
              ? 'prose-headings:font-arabic prose-headings:text-navy prose-p:font-arabic prose-p:leading-[1.9]'
              : 'prose-headings:font-heading prose-p:font-body'
          }`}
        >
          <MDXRemote source={article.content} />
        </div>

        {/* Author bio */}
        <div className="mt-14 pt-8 border-t border-gold/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
              <span className="text-navy/40 text-lg font-arabic">ط</span>
            </div>
            <div>
              <p className="text-navy font-semibold text-sm mb-1">
                {article.author}
              </p>
              <p className="text-navy/55 text-sm leading-relaxed">
                {dict.about.tariq_bio}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
