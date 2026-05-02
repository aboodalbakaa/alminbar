'use client'

import { useState } from 'react'
import type { Locale } from '@/i18n.config'

interface Props {
  points: string[]
  locale: Locale
  labels: {
    title: string
    subtitle: string
    hide: string
    show: string
  }
}

export default function LazySummary({ points, locale, labels }: Props) {
  const [open, setOpen] = useState(true)
  const isAr = locale === 'ar'

  return (
    <div className="mb-10 border border-gold/30 bg-gold/5 overflow-hidden">
      {/* Header row — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-gold/10 transition-colors duration-150 text-start"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl select-none" aria-hidden="true">
            🛋️
          </span>
          <div className="min-w-0">
            <p
              className={`text-navy font-bold leading-tight ${isAr ? 'font-arabic text-base' : 'font-heading text-sm'}`}
            >
              {labels.title}
            </p>
            <p className="text-navy/45 text-xs mt-0.5 leading-tight">
              {labels.subtitle}
            </p>
          </div>
        </div>

        <span
          className={`text-gold text-xs flex-shrink-0 flex items-center gap-1 transition-transform duration-200 ${open ? '' : (isAr ? '-rotate-90' : 'rotate-90')}`}
        >
          {open ? labels.hide : labels.show}
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            <path d="M1 3 L5 7 L9 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {/* Expandable body */}
      {open && (
        <div className="border-t border-gold/20 px-5 py-4">
          <ul className="space-y-2.5">
            {points.map((point, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="text-gold font-bold text-sm flex-shrink-0 mt-0.5 select-none"
                  aria-hidden="true"
                >
                  {i + 1}.
                </span>
                <span
                  className={`text-navy/75 leading-relaxed ${isAr ? 'font-arabic text-sm' : 'text-sm'}`}
                >
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
