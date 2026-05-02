import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import type { Article, ArticleFrontmatter } from '@/types/article'

const articlesDirectory = path.join(process.cwd(), 'content/articles')

export function getArticleSlugs(): string[] {
  if (!fs.existsSync(articlesDirectory)) return []
  return fs
    .readdirSync(articlesDirectory)
    .filter(file => /\.mdx?$/.test(file))
    .map(file => file.replace(/\.mdx?$/, ''))
}

export function getArticleBySlug(slug: string): Article {
  const mdxPath = path.join(articlesDirectory, `${slug}.mdx`)
  const mdPath = path.join(articlesDirectory, `${slug}.md`)
  const fullPath = fs.existsSync(mdxPath) ? mdxPath : mdPath

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  const stats = readingTime(content)

  return {
    ...(data as ArticleFrontmatter),
    slug,
    content,
    readingTimeMinutes: Math.max(1, Math.ceil(stats.minutes)),
  }
}

export function getAllArticles(): Article[] {
  return getArticleSlugs()
    .map(slug => getArticleBySlug(slug))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
