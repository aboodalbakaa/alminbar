import 'server-only'
import { createAdminClient } from './admin'
import type { Article } from '@/types/article'
import readingTime from 'reading-time'

function rowToArticle(sub: Record<string, any>): Article {
  const content = sub.content_ar || ''
  const stats = readingTime(content)
  return {
    slug: sub.id,
    source: 'db',
    title_ar: sub.title_ar,
    title_en: sub.title_en || sub.title_ar,
    author: sub.profiles?.display_name || 'Unknown',
    author_id: sub.author_id || undefined,
    date: sub.reviewed_at || sub.created_at,
    topic_ar: sub.topic_ar,
    topic_en: sub.topic_en || sub.topic_ar,
    excerpt_ar: sub.excerpt_ar || '',
    excerpt_en: sub.excerpt_en || '',
    content,
    content_en: sub.content_en || undefined,
    youtube_url: sub.youtube_url || null,
    readingTimeMinutes: Math.max(1, Math.ceil(stats.minutes)),
  }
}

export async function getAllDbArticles(): Promise<Article[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('submissions')
    .select('*, profiles!submissions_author_id_fkey(display_name)')
    .neq('status', 'rejected')
    .order('created_at', { ascending: false })
  return (data ?? []).map(rowToArticle)
}

export async function getDbArticlesByAuthor(authorId: string): Promise<Article[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('submissions')
    .select('*, profiles!submissions_author_id_fkey(display_name)')
    .eq('author_id', authorId)
    .neq('status', 'rejected')
    .order('created_at', { ascending: false })
  return (data ?? []).map(rowToArticle)
}

export async function getDbArticleById(id: string): Promise<Article | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('submissions')
    .select('*, profiles!submissions_author_id_fkey(display_name)')
    .eq('id', id)
    .neq('status', 'rejected')
    .maybeSingle()
  return data ? rowToArticle(data) : null
}
