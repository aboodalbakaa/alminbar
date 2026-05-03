'use client'
import { useState } from 'react'
import { approveSubmission, rejectSubmission } from '@/app/actions/admin'
import type { Submission } from '@/types/submission'

interface Props {
  sub: Submission
  isAr: boolean
  labels: {
    approve: string
    reject: string
    rejection_reason: string
    read_more: string
    collapse: string
  }
}

export default function SubmissionReview({ sub, isAr, labels }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-navy/10 hover:border-gold/20 transition-colors duration-200">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <span className="text-gold text-xs uppercase tracking-widest">{sub.topic_ar}</span>
          <span className="text-navy/30 text-xs flex-shrink-0">
            {new Date(sub.created_at).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </span>
        </div>

        <p className="font-arabic text-navy font-semibold text-xl leading-snug mb-1">{sub.title_ar}</p>
        {sub.title_en && <p className="font-heading text-navy/50 text-sm mb-3">{sub.title_en}</p>}

        <div className="flex items-center gap-2 text-navy/40 text-xs mb-4">
          <span className="w-6 h-6 rounded-full bg-navy/10 flex items-center justify-center text-navy/40 font-semibold">
            {sub.profiles?.display_name?.[0]?.toUpperCase()}
          </span>
          <span>{sub.profiles?.display_name}</span>
        </div>

        {sub.excerpt_ar && (
          <p className="font-arabic text-navy/60 text-sm leading-relaxed border-s-2 border-gold/30 ps-4 mb-4">
            {sub.excerpt_ar}
          </p>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gold hover:text-gold-dark text-xs transition-colors duration-200"
        >
          {expanded ? labels.collapse : labels.read_more} {expanded ? '↑' : '↓'}
        </button>
      </div>

      {/* Full content */}
      {expanded && (
        <div className="px-6 pb-6 border-t border-navy/5">
          <div className="pt-6 max-h-96 overflow-y-auto">
            <p className="font-arabic text-navy/70 text-sm leading-[2] whitespace-pre-wrap">
              {sub.content_ar}
            </p>
            {sub.content_en && (
              <div className="mt-6 pt-6 border-t border-navy/10">
                <p className="text-navy/70 text-sm leading-relaxed whitespace-pre-wrap">
                  {sub.content_en}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 bg-navy/2 border-t border-navy/10 flex gap-3 flex-wrap">
        <form action={approveSubmission}>
          <input type="hidden" name="id" value={sub.id} />
          <button
            type="submit"
            className="bg-emerald-700 text-white text-xs px-5 py-2 hover:bg-emerald-800 transition-colors"
          >
            ✓ {labels.approve}
          </button>
        </form>
        <form action={rejectSubmission} className="flex gap-2 flex-1 min-w-0">
          <input type="hidden" name="id" value={sub.id} />
          <input
            type="text"
            name="reason"
            placeholder={labels.rejection_reason}
            className="flex-1 min-w-0 border border-navy/15 px-3 py-1.5 text-xs text-navy focus:outline-none focus:border-gold"
          />
          <button
            type="submit"
            className="border border-red-300 text-red-600 text-xs px-4 py-2 hover:bg-red-50 transition-colors flex-shrink-0"
          >
            ✕ {labels.reject}
          </button>
        </form>
      </div>
    </div>
  )
}
