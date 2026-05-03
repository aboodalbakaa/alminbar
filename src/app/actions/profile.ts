'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function updateProfile(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/ar/auth/login')

  const locale = (formData.get('locale') as string) || 'ar'

  const updates: Record<string, string | null> = {
    display_name: (formData.get('display_name') as string).trim(),
    bio_ar: (formData.get('bio_ar') as string)?.trim() || null,
    bio_en: (formData.get('bio_en') as string)?.trim() || null,
    twitter_url: (formData.get('twitter_url') as string)?.trim() || null,
    linkedin_url: (formData.get('linkedin_url') as string)?.trim() || null,
    youtube_url: (formData.get('youtube_url') as string)?.trim() || null,
    instagram_url: (formData.get('instagram_url') as string)?.trim() || null,
    website_url: (formData.get('website_url') as string)?.trim() || null,
    updated_at: new Date().toISOString(),
  }

  const avatarUrl = formData.get('avatar_url') as string
  if (avatarUrl) updates.avatar_url = avatarUrl

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) redirect(`/${locale}/dashboard/profile?error=${encodeURIComponent(error.message)}`)
  redirect(`/${locale}/dashboard/profile?saved=1`)
}

export async function uploadAvatar(formData: FormData): Promise<{ url: string } | { error: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const file = formData.get('avatar') as File
  if (!file || file.size === 0) return { error: 'No file' }

  const ext = file.name.split('.').pop()
  const path = `${user.id}/avatar.${ext}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })

  if (error) return { error: error.message }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(path)

  return { url: publicUrl }
}
