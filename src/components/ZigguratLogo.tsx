/**
 * Ziggurat of Ur (زقورة أور) — Thi Qar, Iraq.
 * Built by Ur-Nammu, Third Dynasty of Ur (~2100 BCE).
 * Temple of Nanna, the Sumerian moon god.
 *
 * Visual elements:
 *   — Crescent of Nanna above (هلال نانا — the moon deity of Ur)
 *   — Four-tier stepped pyramid: sanctuary + three main tiers
 *   — Triple staircase on the south facade: the defining feature
 *     of the Ziggurat of Ur — two flanking stairs meeting the
 *     central stair at the first-tier gate (Woolley's excavation).
 *
 * bg prop: fill colour of the "carved" channels (stairs + crescent cut).
 * Must match the element's background for the cutout illusion.
 */

interface Props {
  className?: string
  width?: number
  bg?: string
}

export default function ZigguratLogo({
  className = '',
  width = 72,
  bg = '#1B2A4A',
}: Props) {
  const height = Math.round((width * 60) / 80)

  return (
    <svg
      viewBox="0 0 80 60"
      width={width}
      height={height}
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Crescent of Nanna ── */}
      {/* Outer disc */}
      <circle cx="40" cy="7" r="6" fill="currentColor" />
      {/* Inner cut — shifts right to open crescent to the left */}
      <circle cx="43" cy="7" r="4.5" fill={bg} />

      {/* ── Ziggurat silhouette ── */}
      {/* Sanctuary / High Temple */}
      <rect x="28" y="14" width="24" height="12" fill="currentColor" />
      {/* Tier 3 */}
      <rect x="18" y="26" width="44" height="10" fill="currentColor" />
      {/* Tier 2 */}
      <rect x="8" y="36" width="64" height="10" fill="currentColor" />
      {/* Tier 1 — Base */}
      <rect x="0" y="46" width="80" height="10" fill="currentColor" />

      {/* ── Triple staircase — South Facade ── */}
      {/* Central stair: ascends from tier-1 base through tier-3 top */}
      <rect x="36" y="26" width="8" height="30" fill={bg} />
      {/* Left flanking stair: tier-1 only, mirrors right */}
      <rect x="15" y="46" width="8" height="10" fill={bg} />
      {/* Right flanking stair: tier-1 only */}
      <rect x="57" y="46" width="8" height="10" fill={bg} />
    </svg>
  )
}
