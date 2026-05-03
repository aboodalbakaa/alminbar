import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { isValidLocale, locales } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import { getAllArticles, getArticleBySlug, getArticleSlugs } from '@/lib/articles'
import { getDbArticleById, getAllDbArticles } from '@/lib/supabase/articles'
import LazySummary from '@/components/LazySummary'
import YouTubeEmbed from '@/components/YouTubeEmbed'
import LiveComments from '@/components/LiveComments'
import ShareButtons from '@/components/ShareButtons'
import ArticleCard from '@/components/ArticleCard'
import { createClient } from '@/lib/supabase/server'
import type { Comment } from '@/types/comment'

export const dynamic = 'force-dynamic'

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
  const isAr = locale === 'ar'

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  let article
  if (UUID_RE.test(params.slug)) {
    article = await getDbArticleById(params.slug)
  } else {
    try { article = getArticleBySlug(params.slug) } catch { return {} }
  }
  if (!article) return {}

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

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  let article
  if (UUID_RE.test(params.slug)) {
    const dbArticle = await getDbArticleById(params.slug)
    if (!dbArticle) notFound()
    article = dbArticle
  } else {
    try {
      article = getArticleBySlug(params.slug)
    } catch {
      notFound()
    }
  }

  const supabase = createClient()
  const [dict, { data: { user } }, { data: rawComments }, mdxArticles, dbArticles] = await Promise.all([
    getDictionary(locale),
    supabase.auth.getUser(),
    supabase
      .from('comments')
      .select('*, profiles(display_name)')
      .eq('article_slug', params.slug)
      .eq('status', 'approved')
      .order('created_at', { ascending: true }),
    Promise.resolve(getAllArticles()),
    getAllDbArticles(),
  ])

  const currentTopic = article.topic_en || article.topic_ar
  const allArticles = [...dbArticles, ...mdxArticles]
  const relatedArticles = allArticles
    .filter(a => (a.topic_en || a.topic_ar) === currentTopic && a.slug !== article.slug)
    .slice(0, 3)

  const initialComments = (rawComments ?? []) as Comment[]
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
          <MDXRemote source={article.content} components={{ YouTubeEmbed }} />
        </div>

        {/* YouTube embed for DB articles */}
        {article.youtube_url && (
          <div className="mt-8">
            <YouTubeEmbed url={article.youtube_url} />
          </div>
        )}

        {/* English translation for DB articles */}
        {article.content_en && (
          <div className="mt-12 pt-8 border-t border-gold/20">
            <p className="text-gold text-xs uppercase tracking-widest font-semibold mb-6">
              {dict.articles.english_translation}
            </p>
            <div className="prose prose-lg max-w-none prose-headings:font-heading prose-p:font-body">
              <MDXRemote source={article.content_en} components={{ YouTubeEmbed }} />
            </div>
          </div>
        )}

        {/* Share buttons */}
        <div className="mt-10 pt-8 border-t border-gold/20">
          <ShareButtons title={title} locale={locale} dict={dict} />
        </div>

        {/* Author bio */}
        <div className="mt-10 pt-8 border-t border-gold/20">
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

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-14 pt-8 border-t border-gold/20">
            <h2
              className={`text-navy font-bold mb-6 ${isAr ? 'font-arabic text-xl' : 'font-heading text-lg'}`}
            >
              {dict.articles.related_title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map(a => (
                <ArticleCard key={a.slug} article={a} locale={locale} dict={dict} />
              ))}
            </div>
          </div>
        )}

        <LiveComments
          locale={locale}
          dict={dict}
          articleSlug={params.slug}
          initialComments={initialComments}
          userId={user?.id ?? null}
        />
      </div>
    </div>
  )
}
