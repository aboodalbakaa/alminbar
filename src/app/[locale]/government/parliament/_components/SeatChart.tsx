'use client'

import { useState, useMemo } from 'react'

interface Party {
  name: string
  nameAr: string
  seats: number
  color: string
  coalition: string
  coalitionAr: string
  leader: string
  leaderAr: string
  status: 'governing' | 'opposition' | 'withdrawn' | 'kurdish' | 'independent'
}

const PARTIES: Party[] = [
  { name: 'Sairoon', nameAr: 'سائرون', seats: 73, color: '#10B981', coalition: 'Sadrist', coalitionAr: 'التيار الصدري', leader: 'Muqtada al-Sadr', leaderAr: 'مقتدى الصدر', status: 'withdrawn' },
  { name: 'Taqadum', nameAr: 'التقدم', seats: 37, color: '#3B82F6', coalition: 'Sunni Bloc', coalitionAr: 'الكتلة السنية', leader: 'Mohammed al-Halbousi', leaderAr: 'محمد الحلبوسي', status: 'governing' },
  { name: 'State of Law', nameAr: 'دولة القانون', seats: 33, color: '#EF4444', coalition: 'Coord. Framework', coalitionAr: 'الإطار التنسيقي', leader: 'Nouri al-Maliki', leaderAr: 'نوري المالكي', status: 'governing' },
  { name: 'KDP', nameAr: 'الديمقراطي الكردستاني', seats: 32, color: '#8B5CF6', coalition: 'Kurdish Alliance', coalitionAr: 'التحالف الكردي', leader: 'Masoud Barzani', leaderAr: 'مسعود بارزاني', status: 'kurdish' },
  { name: 'Fatah Alliance', nameAr: 'تحالف الفتح', seats: 17, color: '#F59E0B', coalition: 'Coord. Framework', coalitionAr: 'الإطار التنسيقي', leader: 'Hadi al-Amiri', leaderAr: 'هادي العامري', status: 'governing' },
  { name: 'PUK', nameAr: 'الاتحاد الوطني الكردستاني', seats: 17, color: '#06B6D4', coalition: 'Kurdish Alliance', coalitionAr: 'التحالف الكردي', leader: 'Bafel Talabani', leaderAr: 'بافل طالباني', status: 'kurdish' },
  { name: 'Azm Alliance', nameAr: 'تحالف عزم', seats: 14, color: '#6366F1', coalition: 'Sunni Bloc', coalitionAr: 'الكتلة السنية', leader: 'Khamis al-Khanjar', leaderAr: 'خميس الخنجر', status: 'governing' },
  { name: 'New Generation', nameAr: 'الجيل الجديد', seats: 9, color: '#EC4899', coalition: 'Reform', coalitionAr: 'كتلة الإصلاح', leader: 'Shaswar Abdulwahid', leaderAr: 'شاسوار عبدالواحد', status: 'opposition' },
  { name: 'Imtidad', nameAr: 'امتداد', seats: 9, color: '#14B8A6', coalition: 'Reform', coalitionAr: 'كتلة الإصلاح', leader: 'Mohammed al-Rashid', leaderAr: 'محمد الراشد', status: 'opposition' },
  { name: 'Kurdistan Islamic Union', nameAr: 'الاتحاد الإسلامي الكردستاني', seats: 5, color: '#F97316', coalition: 'Kurdish Alliance', coalitionAr: 'التحالف الكردي', leader: 'Mohammed Faraj', leaderAr: 'محمد فرج', status: 'kurdish' },
  { name: 'National Iraqi Forces', nameAr: 'القوى الوطنية', seats: 4, color: '#84CC16', coalition: 'Coord. Framework', coalitionAr: 'الإطار التنسيقي', leader: 'Ammar al-Hakim', leaderAr: 'عمار الحكيم', status: 'governing' },
  { name: 'Others & Independents', nameAr: 'أخرى ومستقلون', seats: 79, color: '#94A3B8', coalition: 'Mixed', coalitionAr: 'متنوع', leader: 'Various', leaderAr: 'متنوع', status: 'independent' },
]

const COALITION_COLORS: Record<string, string> = {
  'Coord. Framework': '#EF4444',
  'Sadrist': '#10B981',
  'Kurdish Alliance': '#8B5CF6',
  'Sunni Bloc': '#3B82F6',
  'Reform': '#14B8A6',
  'Mixed': '#94A3B8',
}

const STATUS_LABEL: Record<string, { en: string; ar: string; color: string }> = {
  governing:   { en: 'Governing',   ar: 'حاكم',     color: '#10B981' },
  opposition:  { en: 'Opposition',  ar: 'معارضة',   color: '#F59E0B' },
  withdrawn:   { en: 'Withdrawn',   ar: 'انسحب',    color: '#94A3B8' },
  kurdish:     { en: 'Kurdish',     ar: 'كردي',      color: '#8B5CF6' },
  independent: { en: 'Independent', ar: 'مستقل',    color: '#6B7280' },
}

function generateSeats(parties: Party[]): { x: number; y: number; party: string; color: string; coalition: string }[] {
  const cx = 400, cy = 430
  const innerR = 80, rowGap = 30, seatSpacing = 15
  const partySeats = parties.flatMap(p => Array(p.seats).fill({ party: p.name, color: p.color, coalition: p.coalition }))

  const positions: { x: number; y: number }[] = []
  let placed = 0, row = 0

  while (placed < 329) {
    const r = innerR + row * rowGap
    const n = Math.min(Math.floor(Math.PI * r / seatSpacing), 329 - placed)
    const actualN = Math.max(n, 1)
    for (let i = 0; i < actualN; i++) {
      const angle = actualN > 1 ? (Math.PI * i) / (actualN - 1) : Math.PI / 2
      positions.push({ x: cx - r * Math.cos(angle), y: cy - r * Math.sin(angle) })
    }
    placed += actualN
    row++
  }

  return positions.map((pos, i) => ({ ...pos, ...partySeats[Math.min(i, partySeats.length - 1)] }))
}

export function SeatChart({ isAr }: { isAr: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  const seats = useMemo(() => generateSeats(PARTIES), [])

  const activeFilter = selected ?? hovered

  const coalitionTotals = PARTIES.reduce<Record<string, number>>((acc, p) => {
    acc[p.coalition] = (acc[p.coalition] ?? 0) + p.seats
    return acc
  }, {})

  return (
    <div>
      {/* SVG Seat Map */}
      <div className="relative rounded-2xl bg-[#0F172A] overflow-hidden" style={{ boxShadow: '0 20px 60px -20px rgba(15,23,42,0.4)' }}>
        <div className={`absolute top-4 ${isAr ? 'right-4' : 'left-4'} text-white/30 text-[10px] uppercase tracking-widest`}>
          {isAr ? '329 مقعد · المجلس الخامس · 2021' : '329 Seats · 5th Council · 2021'}
        </div>
        <svg viewBox="0 0 800 460" className="w-full max-w-3xl mx-auto block">
          {seats.map((s, i) => (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={5.5}
              fill={activeFilter && s.coalition !== activeFilter ? s.color + '33' : s.color}
              className="cursor-pointer transition-all duration-200"
              style={{ filter: activeFilter === s.coalition ? 'brightness(1.2)' : 'none' }}
              onClick={() => setSelected(selected === s.coalition ? null : s.coalition)}
              onMouseEnter={() => setHovered(s.coalition)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
          {/* Center label */}
          <text x="400" y="432" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="11" fontFamily="monospace">
            329
          </text>
        </svg>
        {/* Tooltip */}
        {hovered && (() => {
          const party = PARTIES.find(p => p.coalition === hovered || p.name === hovered)
          const totalSeats = PARTIES.filter(p => p.coalition === hovered).reduce((a, p) => a + p.seats, 0)
          return (
            <div className={`absolute bottom-4 ${isAr ? 'left-4' : 'right-4'} bg-white rounded-xl px-4 py-3 text-xs shadow-lg`}
              style={{ border: '1px solid rgba(226,232,240,0.8)' }}>
              <div className="font-bold text-[#18181B] text-sm">{isAr ? party?.coalitionAr : hovered}</div>
              <div className="text-[#71717A] font-mono mt-0.5">{totalSeats} seats · {Math.round(totalSeats / 3.29)}%</div>
            </div>
          )
        })()}
      </div>

      {/* Party breakdown */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        {PARTIES.map(p => (
          <button
            key={p.name}
            onClick={() => setSelected(selected === p.coalition ? null : p.coalition)}
            className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-150 ${isAr ? 'flex-row-reverse text-right' : ''} ${selected === p.coalition ? 'bg-navy/5 ring-1 ring-navy/20' : 'hover:bg-slate-50'}`}>
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
            <div className="flex-1 min-w-0">
              <div className={`font-medium text-[#18181B] text-sm truncate ${isAr ? 'font-arabic' : ''}`}>
                {isAr ? p.nameAr : p.name}
              </div>
              <div className={`text-[#94A3B8] text-xs ${isAr ? 'font-arabic' : ''}`}>
                {isAr ? p.leaderAr : p.leader} · {isAr ? p.coalitionAr : p.coalition}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="font-mono font-bold text-sm text-[#18181B]">{p.seats}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: STATUS_LABEL[p.status].color + '20', color: STATUS_LABEL[p.status].color }}>
                {isAr ? STATUS_LABEL[p.status].ar : STATUS_LABEL[p.status].en}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Coalition summary bar */}
      <div className="mt-6">
        <div className={`text-[10px] uppercase tracking-widest text-[#94A3B8] mb-3 ${isAr ? 'text-right font-arabic text-xs normal-case tracking-normal' : ''}`}>
          {isAr ? 'التوزيع الائتلافي' : 'Coalition distribution'}
        </div>
        <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
          {Object.entries(coalitionTotals).map(([coalition, seats]) => (
            <div key={coalition}
              className="transition-all duration-300 cursor-pointer"
              style={{
                width: `${(seats / 329) * 100}%`,
                backgroundColor: COALITION_COLORS[coalition] ?? '#94A3B8',
                opacity: activeFilter && coalition !== activeFilter ? 0.25 : 1,
              }}
              title={`${coalition}: ${seats} seats`}
              onMouseEnter={() => setHovered(coalition)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </div>
        <div className={`flex flex-wrap gap-4 mt-3 ${isAr ? 'flex-row-reverse justify-end' : ''}`}>
          {Object.entries(coalitionTotals).map(([coalition, seats]) => (
            <div key={coalition} className={`flex items-center gap-1.5 ${isAr ? 'flex-row-reverse' : ''}`}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COALITION_COLORS[coalition] ?? '#94A3B8' }} />
              <span className="text-xs text-[#71717A]">{coalition}</span>
              <span className="font-mono text-xs font-bold text-[#18181B]">{seats}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
