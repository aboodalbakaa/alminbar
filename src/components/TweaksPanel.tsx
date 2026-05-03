'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'

type HeroVariant = 'lead' | 'manifesto' | 'masthead'
type Density = 'editorial' | 'compact'
type Accent = 'gold' | 'brass' | 'copper'
type Tessellation = 'on' | 'off'

interface Tweaks {
  heroVariant: HeroVariant
  density: Density
  accent: Accent
  tessellation: Tessellation
}

const DEFAULTS: Tweaks = {
  heroVariant: 'masthead',
  density: 'editorial',
  accent: 'gold',
  tessellation: 'on',
}

export function useTweaks() {
  const [tweaks, setTweaksState] = useState<Tweaks>(DEFAULTS)

  useEffect(() => {
    const heroVariant = (localStorage.getItem('alminbar-hero') as HeroVariant) || DEFAULTS.heroVariant
    const density = (localStorage.getItem('alminbar-density') as Density) || DEFAULTS.density
    const accent = (localStorage.getItem('alminbar-accent') as Accent) || DEFAULTS.accent
    const tessellation = (localStorage.getItem('alminbar-tessellation') as Tessellation) || DEFAULTS.tessellation
    setTweaksState({ heroVariant, density, accent, tessellation })
  }, [])

  const setTweaks = useCallback((updates: Partial<Tweaks>) => {
    setTweaksState(prev => {
      const next = { ...prev, ...updates }
      if (updates.heroVariant !== undefined) localStorage.setItem('alminbar-hero', updates.heroVariant)
      if (updates.density !== undefined) localStorage.setItem('alminbar-density', updates.density)
      if (updates.accent !== undefined) localStorage.setItem('alminbar-accent', updates.accent)
      if (updates.tessellation !== undefined) localStorage.setItem('alminbar-tessellation', updates.tessellation)
      return next
    })
  }, [])

  return { tweaks, setTweaks }
}

export default function TweaksPanel() {
  const [open, setOpen] = useState(false)
  const { tweaks, setTweaks } = useTweaks()
  const pathname = usePathname()
  const router = useRouter()

  // Apply body data attributes whenever tweaks change
  useEffect(() => {
    document.body.dataset.accent = tweaks.accent
    document.body.dataset.density = tweaks.density
    document.body.dataset.tessellation = tweaks.tessellation
  }, [tweaks.accent, tweaks.density, tweaks.tessellation])

  const switchLocale = (locale: 'ar' | 'en') => {
    const segments = pathname.split('/')
    segments[1] = locale
    router.push(segments.join('/') || `/${locale}`)
  }

  const currentLocale = pathname.split('/')[1] === 'en' ? 'en' : 'ar'

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '1rem',
    insetInlineEnd: '1rem',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.5rem',
    fontFamily: 'ui-monospace, monospace',
    fontSize: '0.75rem',
  }

  const btnStyle: React.CSSProperties = {
    width: '2.25rem',
    height: '2.25rem',
    background: '#1B2A4A',
    color: '#B8923A',
    border: '1px solid rgba(184,146,58,0.4)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
  }

  const cardStyle: React.CSSProperties = {
    background: '#1B2A4A',
    border: '1px solid rgba(184,146,58,0.3)',
    padding: '1rem',
    minWidth: '200px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
    color: '#FAFAF6',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: 'rgba(184,146,58,0.7)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontSize: '0.6rem',
    marginBottom: '0.35rem',
    marginTop: '0.75rem',
  }

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.35rem',
    flexWrap: 'wrap',
  }

  const chipBase: React.CSSProperties = {
    padding: '0.2rem 0.5rem',
    border: '1px solid rgba(184,146,58,0.25)',
    cursor: 'pointer',
    background: 'transparent',
    color: 'rgba(250,250,246,0.55)',
    fontSize: '0.7rem',
    letterSpacing: '0.08em',
    fontFamily: 'ui-monospace, monospace',
  }

  const chipActive: React.CSSProperties = {
    ...chipBase,
    background: 'rgba(184,146,58,0.15)',
    borderColor: '#B8923A',
    color: '#B8923A',
  }

  return (
    <div style={panelStyle}>
      {open && (
        <div style={cardStyle}>
          <div style={{ borderBottom: '1px solid rgba(184,146,58,0.2)', paddingBottom: '0.6rem', marginBottom: '0.2rem' }}>
            <span style={{ color: '#B8923A', letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: '0.6rem', fontWeight: 600 }}>
              Al-Minbar Tweaks
            </span>
          </div>

          {/* Locale switcher */}
          <span style={labelStyle}>Locale</span>
          <div style={rowStyle}>
            {(['ar', 'en'] as const).map(loc => (
              <button
                key={loc}
                style={currentLocale === loc ? chipActive : chipBase}
                onClick={() => switchLocale(loc)}
              >
                {loc === 'ar' ? 'عربي' : 'EN'}
              </button>
            ))}
          </div>

          {/* Density */}
          <span style={labelStyle}>Density</span>
          <div style={rowStyle}>
            {(['editorial', 'compact'] as const).map(d => (
              <button
                key={d}
                style={tweaks.density === d ? chipActive : chipBase}
                onClick={() => setTweaks({ density: d })}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Accent metal */}
          <span style={labelStyle}>Accent</span>
          <div style={rowStyle}>
            {(['gold', 'brass', 'copper'] as const).map(a => (
              <button
                key={a}
                style={tweaks.accent === a ? chipActive : chipBase}
                onClick={() => setTweaks({ accent: a })}
              >
                {a}
              </button>
            ))}
          </div>

          {/* Tessellation */}
          <span style={labelStyle}>Tessellation</span>
          <div style={rowStyle}>
            {(['on', 'off'] as const).map(t => (
              <button
                key={t}
                style={tweaks.tessellation === t ? chipActive : chipBase}
                onClick={() => setTweaks({ tessellation: t })}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        style={btnStyle}
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle tweaks panel"
        title="Design tweaks"
      >
        ⚙
      </button>
    </div>
  )
}
