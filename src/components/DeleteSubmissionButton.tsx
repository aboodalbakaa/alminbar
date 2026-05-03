'use client'
import { useState } from 'react'
import { deleteSubmission } from '@/app/actions/admin'

interface Props {
  id: string
  locale: string
  redirectTo: string
}

export default function DeleteSubmissionButton({ id, locale, redirectTo }: Props) {
  const [confirming, setConfirming] = useState(false)
  const isAr = locale === 'ar'

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-red-500 hover:text-red-700 text-xs transition-colors"
      >
        {isAr ? 'حذف' : 'Delete'}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-red-600 font-medium">
        {isAr ? 'تأكيد الحذف؟' : 'Confirm delete?'}
      </span>
      <form action={deleteSubmission} className="inline">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="redirect_to" value={redirectTo} />
        <button
          type="submit"
          className="bg-red-600 text-white text-xs px-3 py-1 hover:bg-red-700 transition-colors"
        >
          {isAr ? 'احذف' : 'Delete'}
        </button>
      </form>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-navy/40 hover:text-navy text-xs transition-colors"
      >
        {isAr ? 'إلغاء' : 'Cancel'}
      </button>
    </div>
  )
}
