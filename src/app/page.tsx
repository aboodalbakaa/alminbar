import { redirect } from 'next/navigation'

// Fallback redirect in case middleware doesn't catch root
export default function RootPage() {
  redirect('/ar')
}
