import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isValidLocale } from '@/i18n.config'
import type { Locale } from '@/i18n.config'
import { getAllArticles } from '@/lib/articles'
import { getAllDbArticles } from '@/lib/supabase/articles'
import ZigguratLogo from '@/components/ZigguratLogo'
import ZigInline from '@/components/ZigInline'

export const dynamic = 'force-dynamic'

const TESS_SVG_1 = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160' width='160' height='160'><g fill='none' stroke='%23B8923A' stroke-width='0.7' opacity='0.85'><g transform='translate(80 80)'><circle r='3'/><circle r='9'/><circle r='22'/><g><ellipse cx='0' cy='-15' rx='4.5' ry='13'/><ellipse cx='0' cy='-15' rx='4.5' ry='13' transform='rotate(45)'/><ellipse cx='0' cy='-15' rx='4.5' ry='13' transform='rotate(90)'/><ellipse cx='0' cy='-15' rx='4.5' ry='13' transform='rotate(135)'/><ellipse cx='0' cy='-15' rx='4.5' ry='13' transform='rotate(180)'/><ellipse cx='0' cy='-15' rx='4.5' ry='13' transform='rotate(225)'/><ellipse cx='0' cy='-15' rx='4.5' ry='13' transform='rotate(270)'/><ellipse cx='0' cy='-15' rx='4.5' ry='13' transform='rotate(315)'/></g><g stroke-width='0.4' opacity='0.7'><line x1='0' y1='-22' x2='0' y2='-32'/><line x1='0' y1='22' x2='0' y2='32'/><line x1='-22' y1='0' x2='-32' y2='0'/><line x1='22' y1='0' x2='32' y2='0'/><line x1='-15.5' y1='-15.5' x2='-22.6' y2='-22.6'/><line x1='15.5' y1='-15.5' x2='22.6' y2='-22.6'/><line x1='-15.5' y1='15.5' x2='-22.6' y2='22.6'/><line x1='15.5' y1='15.5' x2='22.6' y2='22.6'/></g></g></g></svg>")`
const TESS_SVG_2 = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80' width='80' height='80'><g fill='%23B8923A' opacity='0.32'><path d='M8 12 L14 14 L8 16 Z'/><path d='M16 12 L22 14 L16 16 Z'/><path d='M8 20 L14 22 L8 24 Z'/><path d='M58 56 L64 58 L58 60 Z'/><path d='M66 56 L72 58 L66 60 Z'/><path d='M58 64 L64 66 L58 68 Z'/></g><g fill='none' stroke='%23B8923A' stroke-width='0.55' opacity='0.5'><path d='M40 36 L40 30 L46 30 L46 24 L52 24'/><path d='M40 44 L40 50 L34 50 L34 56 L28 56'/></g></svg>")`

export default async function CoverPage({
  params,
}: {
  params: { locale: string }
}) {
  if (!isValidLocale(params.locale)) notFound()

  const locale = params.locale as Locale
  const isAr = locale === 'ar'

  const [mdxArticles, dbArticles] = await Promise.all([
    Promise.resolve(getAllArticles()),
    getAllDbArticles(),
  ])
  const articles = [...dbArticles, ...mdxArticles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  const featured = articles[0] ?? null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#1B2A4A',
      color: '#FAFAF6',
      overflow: 'auto',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Tessellation watermark */}
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: `${TESS_SVG_1}, ${TESS_SVG_2}`,
        backgroundSize: '160px 160px, 80px 80px',
        backgroundPosition: '0 0, 40px 40px',
        mixBlendMode: 'screen',
        opacity: 0.5,
        zIndex: 0,
      }} />

      {/* Left vertical rail */}
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
      }}>
        <span style={{
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          fontFamily: 'ui-monospace, monospace',
          fontSize: '0.55rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'rgba(184,146,58,0.45)',
          userSelect: 'none',
        }}>
          AL-MINBAR · VOL · I
        </span>
      </div>

      {/* Right vertical rail */}
      <div style={{
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        width: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
      }}>
        <span style={{
          writingMode: 'vertical-rl',
          fontFamily: 'var(--font-arabic), serif',
          fontSize: '0.65rem',
          letterSpacing: '0.12em',
          color: 'rgba(184,146,58,0.45)',
          userSelect: 'none',
        }}>
          المنبر · المجلد الأول
        </span>
      </div>

      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 4rem',
        textAlign: 'center',
        gap: '1.5rem',
      }}>
        {/* Ziggurat crest */}
        <ZigguratLogo
          width={96}
          bg="#1B2A4A"
          className="text-gold"
        />

        {/* Wordmark */}
        <div>
          <h1 style={{
            color: '#B8923A',
            lineHeight: 1,
            fontFamily: isAr ? 'var(--font-arabic), serif' : 'var(--font-heading), Georgia, serif',
            fontSize: isAr ? '4rem' : '3.5rem',
            fontWeight: 700,
            fontStyle: isAr ? 'normal' : 'italic',
            letterSpacing: isAr ? '0.02em' : '0.01em',
          }}>
            {isAr ? 'المنبر' : 'Al-Minbar'}
          </h1>
          {!isAr && (
            <p style={{
              color: 'rgba(184,146,58,0.5)',
              fontFamily: 'var(--font-arabic), serif',
              fontSize: '1.5rem',
              marginTop: '0.25rem',
            }}>
              المنبر
            </p>
          )}
          {isAr && (
            <p style={{
              color: 'rgba(184,146,58,0.5)',
              fontFamily: 'var(--font-heading), Georgia, serif',
              fontSize: '1.2rem',
              fontStyle: 'italic',
              marginTop: '0.25rem',
            }}>
              Al-Minbar
            </p>
          )}
        </div>

        {/* ZigInline divider */}
        <div style={{ color: '#B8923A' }}>
          <ZigInline size={16} />
        </div>

        {/* Tagline */}
        <p style={{
          color: 'rgba(250,250,246,0.55)',
          fontFamily: isAr ? 'var(--font-arabic), serif' : 'var(--font-body), system-ui, sans-serif',
          fontSize: isAr ? '0.95rem' : '0.85rem',
          letterSpacing: isAr ? '0.02em' : '0.14em',
          textTransform: isAr ? 'none' : 'uppercase',
          maxWidth: '28rem',
          lineHeight: 1.7,
        }}>
          {isAr
            ? 'منبر للتحليل السياسي العراقي — تحليل رصين ونقد بنّاء'
            : 'Iraqi Political Analysis · Rigorous, Evidence-Based'}
        </p>

        {/* Divider rule */}
        <div style={{
          width: '8rem',
          height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(184,146,58,0.5), transparent)',
        }} />

        {/* Featured article callout */}
        {featured && (
          <div style={{
            border: '1px solid rgba(184,146,58,0.25)',
            padding: '1.5rem 2rem',
            maxWidth: '28rem',
            background: 'rgba(184,146,58,0.05)',
          }}>
            <p style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#B8923A',
              marginBottom: '0.6rem',
            }}>
              {isAr ? 'المقال الرئيسي' : 'Featured Essay'}
            </p>
            <Link href={`/${locale}/articles/${featured.slug}`} style={{
              display: 'block',
              color: '#FAFAF6',
              fontFamily: isAr ? 'var(--font-arabic), serif' : 'var(--font-heading), Georgia, serif',
              fontSize: isAr ? '1.1rem' : '1rem',
              fontStyle: isAr ? 'normal' : 'italic',
              lineHeight: 1.4,
              textDecoration: 'none',
            }}>
              {isAr ? featured.title_ar : featured.title_en}
            </Link>
            <p style={{
              marginTop: '0.5rem',
              color: 'rgba(250,250,246,0.4)',
              fontSize: '0.75rem',
              fontFamily: 'ui-monospace, monospace',
              letterSpacing: '0.1em',
            }}>
              {featured.author}
            </p>
          </div>
        )}

        {/* Open the issue CTA */}
        <Link
          href={`/${locale}`}
          style={{
            marginTop: '0.5rem',
            display: 'inline-block',
            background: '#B8923A',
            color: '#1B2A4A',
            padding: '0.65rem 2rem',
            fontFamily: isAr ? 'var(--font-arabic), serif' : 'ui-monospace, monospace',
            fontSize: isAr ? '0.95rem' : '0.72rem',
            fontWeight: 700,
            letterSpacing: isAr ? '0.02em' : '0.14em',
            textTransform: isAr ? 'none' : 'uppercase',
            textDecoration: 'none',
          }}
        >
          {isAr ? 'افتح العدد ←' : 'Open the Issue →'}
        </Link>
      </div>
    </div>
  )
}
