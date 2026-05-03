'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = createClient()
  const locale = formData.get('locale') as string

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    redirect(`/${locale}/auth/login?error=1`)
  }

  redirect(`/${locale}/dashboard`)
}

export async function signup(formData: FormData) {
  const supabase = createClient()
  const locale = formData.get('locale') as string

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: { display_name: formData.get('display_name') as string },
    },
  })

  if (error) {
    redirect(`/${locale}/auth/signup?error=${encodeURIComponent(error.message)}`)
  }

  redirect(`/${locale}/dashboard?message=check-email`)
}

export async function signout(formData: FormData) {
  const supabase = createClient()
  const locale = formData.get('locale') as string
  await supabase.auth.signOut()
  redirect(`/${locale}`)
}
