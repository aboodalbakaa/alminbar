export interface ArticleFrontmatter {
  title_ar: string
  title_en: string
  author: string
  date: string
  topic_ar: string
  topic_en: string
  excerpt_ar: string
  excerpt_en: string
  lazy_ar?: string[]
  lazy_en?: string[]
}

export interface Article extends ArticleFrontmatter {
  slug: string
  content: string
  readingTimeMinutes: number
  // Supabase-submitted articles only
  content_en?: string
  youtube_url?: string | null
  source?: 'mdx' | 'db'
}
