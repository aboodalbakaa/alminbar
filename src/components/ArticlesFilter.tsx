'use client'

import { useState, useMemo } from 'react'
import type { Locale } from '@/i18n.config'
import type { Article } from '@/types/article'
import type { Dictionary } from '@/lib/dictionary'
import ArticleCard from '@/components/ArticleCard'

interface Props {
  articles: Article[]
  locale: Locale
  dict: Dictionary
}

export default function ArticlesFilter({ articles, locale, dict }: Props) {
  const isAr = locale === 'ar'
  const [search, setSearch] = useState('')
  const [activeTopic, setActiveTopic] = useState<string | null>(null)

  const topics = useMemo(() => {
    const seen = new Set<string>()
    const result: string[] = []
    for (const a of articles) {
      const t = isAr ? a.topic_ar : a.topic_en
      if (t && !seen.has(t)) {
        seen.add(t)
        result.push(t)
      }
    }
    return result
  }, [articles, isAr])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return articles.filter(a => {
      const title = isAr ? a.title_ar : a.title_en
      const excerpt = isAr ? a.excerpt_ar : a.excerpt_en
      const topic = isAr ? a.topic_ar : a.topic_en
      if (activeTopic && topic !== activeTopic) return false
      if (q && !title.toLowerCase().includes(q) && !(excerpt ?? '').toLowerCase().includes(q)) return false
      return true
    })
  }, [articles, search, activeTopic, isAr])

  return (
    <div>
      <div className="mb-8 space-y-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={dict.articles.search_placeholder}
          dir={isAr ? 'rtl' : 'ltr'}
          className={`w-full border border-navy/15 bg-white px-4 py-2.5 text-sm text-navy placeholder-navy/35 focus:outline-none focus:border-gold/60 transition-colors ${isAr ? 'font-arabic' : ''}`}
        />

        {topics.length > 0 && (
          <div className={`flex flex-wrap gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={() => setActiveTopic(null)}
              className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
                activeTopic === null
                  ? 'bg-navy text-white'
                  : 'bg-navy/5 text-navy/60 hover:bg-navy/10'
              }`}
            >
              {dict.articles.filter_all}
            </button>
            {topics.map(t => (
              <button
                key={t}
                onClick={() => setActiveTopic(activeTopic === t ? null : t)}
                className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  activeTopic === t
                    ? 'bg-gold text-white'
                    : 'bg-navy/5 text-navy/60 hover:bg-navy/10'
                } ${isAr ? 'font-arabic normal-case tracking-normal' : ''}`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 text-navy/40">
          <p className={`text-xl ${isAr ? 'font-arabic' : ''}`}>{dict.articles.no_results}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(article => (
            <ArticleCard key={article.slug} article={article} locale={locale} dict={dict} />
          ))}
        </div>
      )}
    </div>
  )
}
