interface Props { size?: number; className?: string }

export default function ZigInline({ size = 14, className = '' }: Props) {
  return (
    <svg viewBox="0 0 40 14" width={size * 2.4} height={size} className={className} aria-hidden="true">
      <rect x="14" y="0" width="12" height="3" fill="currentColor" />
      <rect x="9" y="3" width="22" height="3" fill="currentColor" />
      <rect x="4" y="6" width="32" height="3" fill="currentColor" />
      <rect x="0" y="9" width="40" height="5" fill="currentColor" />
    </svg>
  )
}
