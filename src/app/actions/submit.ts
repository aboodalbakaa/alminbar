'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createSubmission(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const locale = formData.get('locale') as string

  if (!user) redirect(`/${locale}/auth/login`)

  const action = formData.get('intent') as string
  const status = action === 'submit' ? 'pending' : 'draft'

  const { error } = await supabase.from('submissions').insert({
    author_id: user.id,
    title_ar: formData.get('title_ar') as string,
    title_en: (formData.get('title_en') as string) || '',
    excerpt_ar: formData.get('excerpt_ar') as string,
    excerpt_en: formData.get('excerpt_en') as string,
    content_ar: formData.get('content_ar') as string,
    content_en: formData.get('content_en') as string,
    topic_ar: (formData.get('topic_ar') as string) || 'سياسة',
    topic_en: (formData.get('topic_en') as string) || 'Politics',
    status,
  })

  if (error) {
    redirect(`/${locale}/submit?error=${encodeURIComponent(error.message)}`)
  }

  redirect(`/${locale}/dashboard`)
}

export async function updateSubmission(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const locale = formData.get('locale') as string

  if (!user) redirect(`/${locale}/auth/login`)

  const id = formData.get('id') as string
  const action = formData.get('intent') as string
  const status = action === 'submit' ? 'pending' : 'draft'

  await supabase
    .from('submissions')
    .update({
      title_ar: formData.get('title_ar') as string,
      title_en: formData.get('title_en') as string,
      excerpt_ar: formData.get('excerpt_ar') as string,
      excerpt_en: formData.get('excerpt_en') as string,
      content_ar: formData.get('content_ar') as string,
      content_en: formData.get('content_en') as string,
      topic_ar: formData.get('topic_ar') as string,
      topic_en: formData.get('topic_en') as string,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('author_id', user.id)

  redirect(`/${locale}/dashboard`)
}
