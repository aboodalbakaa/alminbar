'use client'
import { useState } from 'react'

interface Tab {
  id: string
  label: string
  count?: number
}

interface Props {
  tabs: Tab[]
  children: React.ReactNode[]
}

export default function AdminTabs({ tabs, children }: Props) {
  const [active, setActive] = useState(0)

  return (
    <div>
      <div className="flex border-b border-navy/10 mb-8 gap-1">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => setActive(i)}
            className={`px-5 py-3 text-sm transition-colors duration-200 relative ${
              active === i
                ? 'text-navy font-medium'
                : 'text-navy/40 hover:text-navy/70'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`ms-2 text-xs px-1.5 py-0.5 rounded-full ${
                  active === i ? 'bg-gold text-white' : 'bg-navy/10 text-navy/50'
                }`}
              >
                {tab.count}
              </span>
            )}
            {active === i && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
            )}
          </button>
        ))}
      </div>
      {children[active]}
    </div>
  )
}
