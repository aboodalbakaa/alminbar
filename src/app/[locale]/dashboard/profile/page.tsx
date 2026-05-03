import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { createClient } from '@/lib/supabase/server'
import ProfileEditForm from '@/components/ProfileEditForm'

export const metadata: Metadata = { title: 'Edit Profile' }

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: { locale: string }
  searchParams: { saved?: string; error?: string }
}) {
  if (!isValidLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const isAr = locale === 'ar'

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/auth/login`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, bio_ar, bio_en, avatar_url, twitter_url, linkedin_url, youtube_url, instagram_url, website_url')
    .eq('id', user.id)
    .single()

  if (!profile) redirect(`/${locale}/auth/login`)

  return (
    <div className="py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-gold/20">
          <h1 className={`text-navy ${isAr ? 'font-arabic text-3xl' : 'font-heading text-2xl'}`}>
            {isAr ? 'الملف الشخصي' : 'Your Profile'}
          </h1>
          <Link
            href={`/${locale}/dashboard`}
            className="text-navy/50 hover:text-navy text-sm transition-colors"
          >
            {isAr ? '← لوحة التحكم' : '← Dashboard'}
          </Link>
        </div>

        {searchParams.error && (
          <p className="text-red-700 text-sm px-4 py-3 bg-red-50 border border-red-200 mb-6">
            {searchParams.error}
          </p>
        )}

        <ProfileEditForm
          profile={profile}
          locale={locale}
          saved={searchParams.saved === '1'}
        />
      </div>
    </div>
  )
}
