'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function postComment(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const slug = formData.get('article_slug') as string
  const locale = formData.get('locale') as string
  const body = (formData.get('body') as string).trim()
  if (!body) return

  await supabase.from('comments').insert({
    article_slug: slug,
    author_id: user.id,
    body,
    status: 'pending',
  })

  revalidatePath(`/${locale}/articles/${slug}`)
}
