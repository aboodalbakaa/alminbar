import Link from 'next/link'
import type { Locale } from '@/i18n.config'
import type { Article } from '@/types/article'
import type { Dictionary } from '@/lib/dictionary'

interface Props {
  article: Article
  locale: Locale
  dict: Dictionary
}

function formatDate(dateStr: string, locale: Locale): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(locale === 'ar' ? 'ar-IQ' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function ArticleCard({ article, locale, dict }: Props) {
  const isAr = locale === 'ar'
  const title = isAr ? article.title_ar : article.title_en
  const excerpt = isAr ? article.excerpt_ar : article.excerpt_en
  const topic = isAr ? article.topic_ar : article.topic_en

  return (
    <article className="bg-white border border-gray-100 hover:border-gold/30 hover:shadow-md transition-all duration-200 group flex flex-col">
      {/* Gold top accent */}
      <div className="h-0.5 bg-gold w-full" />

      <div className="p-6 flex flex-col flex-1">
        {/* Topic badge */}
        <div className="mb-3">
          <span className="text-gold text-xs uppercase tracking-widest font-semibold">
            {topic}
          </span>
        </div>

        {/* Title */}
        <h2
          className={`text-navy font-bold mb-3 leading-snug group-hover:text-navy-light transition-colors ${
            isAr ? 'font-arabic text-xl' : 'font-heading text-lg'
          }`}
        >
          <Link href={`/${locale}/articles/${article.slug}`} className="hover:underline decoration-gold/40 underline-offset-2">
            {title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p className="text-navy/65 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
          {excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-navy/45">
          <span>
            {dict.articles.by}{' '}
            <span className="text-navy/70 font-medium">{article.author}</span>
          </span>
          <div className="flex items-center gap-3">
            <time dateTime={article.date}>{formatDate(article.date, locale)}</time>
            <span>·</span>
            <span>
              {article.readingTimeMinutes}{' '}
              {article.readingTimeMinutes === 1
                ? dict.articles.minute_read
                : dict.articles.minutes_read}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
