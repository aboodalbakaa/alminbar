import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDbArticlesByAuthor } from '@/lib/supabase/articles'
import ArticleCard from '@/components/ArticleCard'
import { getDictionary } from '@/lib/dictionary'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: { locale: string; id: string }
}): Promise<Metadata> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('display_name')
    .eq('id', params.id)
    .single()
  return { title: data?.display_name ?? 'Writer' }
}

const socialIcons: Record<string, string> = {
  twitter_url:   'X',
  linkedin_url:  'in',
  youtube_url:   'YT',
  instagram_url: 'IG',
  website_url:   '↗',
}

const socialLabels: Record<string, { ar: string; en: string }> = {
  twitter_url:   { ar: 'تويتر', en: 'Twitter / X' },
  linkedin_url:  { ar: 'لينكدإن', en: 'LinkedIn' },
  youtube_url:   { ar: 'يوتيوب', en: 'YouTube' },
  instagram_url: { ar: 'إنستغرام', en: 'Instagram' },
  website_url:   { ar: 'الموقع', en: 'Website' },
}

export default async function WriterProfilePage({
  params,
}: {
  params: { locale: string; id: string }
}) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const isAr = locale === 'ar'

  const admin = createAdminClient()
  const [{ data: writer }, articles, dict] = await Promise.all([
    admin
      .from('profiles')
      .select('id, display_name, bio_ar, bio_en, avatar_url, role, twitter_url, linkedin_url, youtube_url, instagram_url, website_url')
      .eq('id', params.id)
      .single(),
    getDbArticlesByAuthor(params.id),
    getDictionary(locale),
  ])

  if (!writer) notFound()

  const bio = isAr ? writer.bio_ar : writer.bio_en
  const socialFields = ['twitter_url', 'linkedin_url', 'youtube_url', 'instagram_url', 'website_url'] as const

  return (
    <div className="py-14 px-6" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto">

        {/* Back link */}
        <Link
          href={`/${locale}/writers`}
          className="text-navy/50 hover:text-navy text-sm transition-colors mb-10 inline-block"
        >
          {isAr ? '← الكتّاب' : '← Writers'}
        </Link>

        {/* Profile header */}
        <div className="flex flex-col sm:flex-row gap-8 mb-14 pb-10 border-b border-gold/20">
          {/* Avatar */}
          <div className="relative w-28 h-28 rounded-full overflow-hidden bg-navy/10 flex-shrink-0">
            {writer.avatar_url ? (
              <Image
                src={writer.avatar_url}
                alt={writer.display_name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-navy/30 text-4xl font-bold select-none">
                {writer.display_name?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-gold text-xs uppercase tracking-widest mb-2">
              {writer.role === 'admin'   ? (isAr ? 'محرر رئيسي' : 'Editor in Chief') :
               writer.role === 'editor' ? (isAr ? 'محرر'       : 'Editor') :
               (isAr ? 'كاتب' : 'Contributor')}
            </p>
            <h1 className={`text-navy mb-4 ${isAr ? 'font-arabic text-4xl' : 'font-heading text-3xl'}`}>
              {writer.display_name}
            </h1>

            {bio && (
              <p className={`text-navy/65 leading-relaxed mb-5 ${isAr ? 'font-arabic text-base' : 'text-sm'}`}>
                {bio}
              </p>
            )}

            {/* Social links */}
            <div className="flex flex-wrap gap-3">
              {socialFields.map(key => {
                const url = writer[key]
                if (!url) return null
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs border border-navy/20 px-3 py-1.5 text-navy/60 hover:border-gold hover:text-gold transition-colors"
                  >
                    <span className="font-mono text-xs font-bold">{socialIcons[key]}</span>
                    <span>{isAr ? socialLabels[key].ar : socialLabels[key].en}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Articles */}
        <div>
          <h2 className={`text-gold text-xs uppercase tracking-widest mb-8 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? `مقالات ${writer.display_name}` : `Articles by ${writer.display_name}`}
          </h2>

          {articles.length === 0 ? (
            <p className={`text-navy/40 text-center py-16 ${isAr ? 'font-arabic' : ''}`}>
              {isAr ? 'لا توجد مقالات منشورة بعد' : 'No published articles yet'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  )
}
