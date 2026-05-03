'use server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function assertAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (data?.role !== 'admin') throw new Error('Forbidden')
  return { supabase, userId: user.id }
}

export async function approveSubmission(formData: FormData) {
  const { supabase, userId } = await assertAdmin()
  const id = formData.get('id') as string
  await supabase
    .from('submissions')
    .update({ status: 'approved', reviewed_by: userId, reviewed_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath('/ar/admin')
  revalidatePath('/en/admin')
}

export async function rejectSubmission(formData: FormData) {
  const { supabase, userId } = await assertAdmin()
  const id = formData.get('id') as string
  const reason = formData.get('reason') as string
  await supabase
    .from('submissions')
    .update({
      status: 'rejected',
      rejection_reason: reason,
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
  revalidatePath('/ar/admin')
  revalidatePath('/en/admin')
}

export async function approveComment(formData: FormData) {
  const { supabase } = await assertAdmin()
  await supabase.from('comments').update({ status: 'approved' }).eq('id', formData.get('id'))
  revalidatePath('/ar/admin')
  revalidatePath('/en/admin')
}

export async function rejectComment(formData: FormData) {
  const { supabase } = await assertAdmin()
  await supabase.from('comments').update({ status: 'rejected' }).eq('id', formData.get('id'))
  revalidatePath('/ar/admin')
  revalidatePath('/en/admin')
}

export async function updateUserRole(formData: FormData) {
  const { supabase } = await assertAdmin()
  await supabase
    .from('profiles')
    .update({ role: formData.get('role') as string })
    .eq('id', formData.get('id'))
  revalidatePath('/ar/admin')
  revalidatePath('/en/admin')
}

export async function deleteSubmission(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const id = formData.get('id') as string
  const locale = (formData.get('locale') as string) || 'ar'
  const redirectTo = (formData.get('redirect_to') as string) || `/${locale}/dashboard`

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  if (isAdmin) {
    // admin client bypasses RLS — can delete anything
    const adminClient = createAdminClient()
    await adminClient.from('submissions').delete().eq('id', id)
  } else {
    // regular client — DELETE RLS policy ensures author can only delete their own
    const { error } = await supabase.from('submissions').delete().eq('id', id).eq('author_id', user.id)
    if (error) throw new Error(error.message)
  }

  redirect(redirectTo)
}
