import ZigInline from './ZigInline'

export default function ZigDivider() {
  return (
    <div className="zig-divider">
      <span className="rule" />
      <ZigInline size={12} />
      <span className="rule" />
    </div>
  )
}
