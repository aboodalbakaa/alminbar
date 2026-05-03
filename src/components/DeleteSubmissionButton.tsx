'use client'
import { useState } from 'react'
import { deleteSubmission } from '@/app/actions/admin'

interface Props {
  id: string
  locale: string
  label?: { delete: string; confirm: string; cancel: string }
}

export default function DeleteSubmissionButton({ id, locale, label }: Props) {
  const [confirming, setConfirming] = useState(false)

  const l = label ?? {
    delete: locale === 'ar' ? 'حذف' : 'Delete',
    confirm: locale === 'ar' ? 'تأكيد الحذف' : 'Confirm delete',
    cancel: locale === 'ar' ? 'إلغاء' : 'Cancel',
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-red-500 hover:text-red-700 text-xs transition-colors"
      >
        {l.delete}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-red-600 font-medium">{l.confirm}?</span>
      <form action={deleteSubmission}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="locale" value={locale} />
        <button
          type="submit"
          className="bg-red-600 text-white text-xs px-3 py-1 hover:bg-red-700 transition-colors"
        >
          {l.delete}
        </button>
      </form>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-navy/40 hover:text-navy text-xs transition-colors"
      >
        {l.cancel}
      </button>
    </div>
  )
}
