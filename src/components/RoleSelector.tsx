'use client'
import { updateUserRole } from '@/app/actions/admin'

interface Props {
  userId: string
  currentRole: string
}

const roles = ['reader', 'contributor', 'editor', 'admin']

export default function RoleSelector({ userId, currentRole }: Props) {
  return (
    <form action={updateUserRole}>
      <input type="hidden" name="id" value={userId} />
      <select
        name="role"
        defaultValue={currentRole}
        onChange={e => (e.target.form as HTMLFormElement).requestSubmit()}
        className="text-xs border border-navy/15 px-2 py-1.5 text-navy focus:outline-none focus:border-gold bg-white"
      >
        {roles.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
    </form>
  )
}
