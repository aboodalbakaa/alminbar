import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: { locale: string }
}): Promise<Metadata> {
  return {
    title: params.locale === 'ar' ? 'الكتّاب' : 'Writers',
  }
}

export default async function WritersPage({
  params,
}: {
  params: { locale: string }
}) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const isAr = locale === 'ar'

  const admin = createAdminClient()
  // Show all profiles that have at least one non-rejected article
  const { data: authorIds } = await admin
    .from('submissions')
    .select('author_id')
    .neq('status', 'rejected')
  const uniqueIds = [...new Set((authorIds ?? []).map((r: { author_id: string }) => r.author_id))]
  const { data: writers } = uniqueIds.length > 0
    ? await admin
        .from('profiles')
        .select('id, display_name, bio_ar, bio_en, avatar_url, role, twitter_url, linkedin_url, youtube_url, instagram_url, website_url')
        .in('id', uniqueIds)
        .order('display_name')
    : { data: [] }

  const list = writers ?? []

  return (
    <div className="py-14 px-6" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 pb-8 border-b border-gold/20">
          <h1 className={`text-navy mb-2 ${isAr ? 'font-arabic text-4xl' : 'font-heading text-3xl'}`}>
            {isAr ? 'الكتّاب' : 'Writers'}
          </h1>
          <p className="text-navy/50 text-sm">
            {isAr ? 'أصوات تكتب من أجل عراق أفضل' : 'Voices writing for a better Iraq'}
          </p>
        </div>

        {list.length === 0 ? (
          <div className="text-center py-24 text-navy/40">
            <p className={`text-xl ${isAr ? 'font-arabic' : ''}`}>
              {isAr ? 'لا يوجد كتّاب بعد' : 'No writers yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map(writer => {
              const bio = isAr ? writer.bio_ar : writer.bio_en
              return (
                <Link
                  key={writer.id}
                  href={`/${locale}/writers/${writer.id}`}
                  className="group border border-navy/10 hover:border-gold/40 hover:shadow-md transition-all duration-200 p-6 flex flex-col bg-white"
                >
                  <div className="h-0.5 w-full mb-5" style={{ background: 'var(--terracotta, #8B3A2F)' }} />

                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-navy/10 flex-shrink-0">
                      {writer.avatar_url ? (
                        <Image
                          src={writer.avatar_url}
                          alt={writer.display_name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-navy/40 text-xl font-bold select-none">
                          {writer.display_name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-navy font-semibold leading-snug group-hover:text-gold transition-colors ${isAr ? 'font-arabic text-lg' : 'font-heading'}`}>
                        {writer.display_name}
                      </p>
                      <p className="text-gold text-xs uppercase tracking-widest mt-0.5">
                        {writer.role === 'admin' ? (isAr ? 'محرر رئيسي' : 'Editor in Chief') :
                         writer.role === 'editor' ? (isAr ? 'محرر' : 'Editor') :
                         (isAr ? 'كاتب' : 'Contributor')}
                      </p>
                    </div>
                  </div>

                  {bio && (
                    <p className={`text-navy/60 text-sm leading-relaxed line-clamp-3 flex-1 ${isAr ? 'font-arabic' : ''}`}>
                      {bio}
                    </p>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
