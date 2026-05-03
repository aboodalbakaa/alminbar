import ZigInline from './ZigInline'

export default function Colophon() {
  return (
    <div className="colophon" aria-hidden="true">
      <span className="rule" />
      <span className="diamond" />
      <ZigInline size={10} />
      <span className="diamond" />
      <span className="rule" />
    </div>
  )
}
