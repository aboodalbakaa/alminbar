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
    <div className="tldr-block">
      {/* Header row — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="tldr-head"
        aria-expanded={open}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <span style={{ fontSize: '1.2rem', flexShrink: 0 }} aria-hidden="true">
            🛋️
          </span>
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontFamily: 'var(--font-mono-stack)',
              fontSize: '0.6rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--terracotta, #8B3A2F)',
              fontWeight: 700,
              marginBottom: '0.2rem',
            }}>
              {isAr ? 'خلاصة القراءة' : 'TL;DR'}
            </p>
            <p style={{
              color: 'var(--ink, #1B2A4A)',
              fontWeight: 700,
              lineHeight: 1.3,
              fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-heading)',
              fontSize: isAr ? '0.95rem' : '0.85rem',
            }}>
              {labels.title}
            </p>
            <p style={{ color: 'var(--ink-faint, #8794AB)', fontSize: '0.75rem', marginTop: '0.15rem' }}>
              {labels.subtitle}
            </p>
          </div>
        </div>

        <span style={{
          color: 'var(--gold, #B8923A)',
          fontSize: '0.72rem',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontFamily: 'var(--font-mono-stack)',
          letterSpacing: '0.1em',
        }}>
          {open ? labels.hide : labels.show}
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
            aria-hidden="true"
          >
            <path d="M1 3 L5 7 L9 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {/* Expandable body */}
      {open && (
        <ol>
          {points.map((point, i) => (
            <li key={i}>
              <span style={{ display: 'none' }}>{i + 1}</span>
              <span className={isAr ? 'font-arabic' : ''}>
                {point}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
