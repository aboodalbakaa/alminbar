// Shared components — Header, Footer, Ziggurat, dividers, marks
const { useState } = React;

// Ziggurat of Ur — same architecture as the original repo's ZigguratLogo,
// preserving the meaning (crescent of Nanna + four tiers + triple staircase).
function Ziggurat({ width = 88, bg = '#1B2A4A', className = '' }) {
  const height = Math.round((width * 60) / 80);
  return (
    <svg viewBox="0 0 80 60" width={width} height={height} className={className} aria-hidden="true">
      <circle cx="40" cy="7" r="6" fill="currentColor" />
      <circle cx="43" cy="7" r="4.5" fill={bg} />
      <rect x="28" y="14" width="24" height="12" fill="currentColor" />
      <rect x="18" y="26" width="44" height="10" fill="currentColor" />
      <rect x="8" y="36" width="64" height="10" fill="currentColor" />
      <rect x="0" y="46" width="80" height="10" fill="currentColor" />
      <rect x="36" y="26" width="8" height="30" fill={bg} />
      <rect x="15" y="46" width="8" height="10" fill={bg} />
      <rect x="57" y="46" width="8" height="10" fill={bg} />
    </svg>
  );
}

// Tiny ziggurat silhouette for inline section dividers
function ZigInline({ size = 14 }) {
  return (
    <svg viewBox="0 0 40 14" width={size * 2.4} height={size} aria-hidden="true">
      <rect x="14" y="0" width="12" height="3" fill="currentColor" />
      <rect x="9"  y="3" width="22" height="3" fill="currentColor" />
      <rect x="4"  y="6" width="32" height="3" fill="currentColor" />
      <rect x="0"  y="9" width="40" height="5" fill="currentColor" />
    </svg>
  );
}

function ZigDivider() {
  return (
    <div className="zig-divider">
      <span className="rule" />
      <ZigInline size={12} />
      <span className="rule" />
    </div>
  );
}

function Colophon() {
  return (
    <div className="colophon" aria-hidden="true">
      <span className="rule" />
      <span className="diamond" />
      <ZigInline size={10} />
      <span className="diamond" />
      <span className="rule" />
    </div>
  );
}

function Header({ locale, route, onNavigate, t }) {
  const isAr = locale === 'ar';
  const today = new Date('2026-04-15');
  const dateStr = today.toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const issueLabel = isAr ? `العدد ١٤ • ${dateStr}` : `Issue 14 · ${dateStr}`;

  const nav = [
    { id: 'home',     label: t('nav.home') },
    { id: 'articles', label: t('nav.articles') },
    { id: 'about',    label: t('nav.about') },
    { id: 'submit',   label: t('nav.submit') },
  ];

  return (
    <header className="masthead">
      <div className="util-bar">
        <div className="util-inner">
          <span>{isAr ? 'منبر للفكر السياسي العراقي' : 'A Forum for Iraqi Political Thought'}</span>
          <span>{isAr ? 'بغداد · المهجر · ٢٠٢٦' : 'Baghdad · Diaspora · 2026'}</span>
        </div>
      </div>

      <div className="crest">
        <span className="issue-stamp">{issueLabel}</span>
        <Ziggurat width={72} bg="#1B2A4A" className="text-gold" />
        <h1 style={{color: 'var(--gold)'}} onClick={() => onNavigate('home')}>
          {isAr ? 'المنبر' : 'Al-Minbar'}
        </h1>
        <div className="tagline">{t('site.tagline')}</div>
      </div>

      <nav className="nav">
        <ul>
          {nav.map(n => (
            <li key={n.id}>
              <a
                onClick={() => onNavigate(n.id)}
                className={route === n.id ? 'active' : ''}
              >{n.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function Footer({ locale, t }) {
  const isAr = locale === 'ar';
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="credo">
          <p className="mark">{t('footer.tagline')}</p>
          <p className="sub">{t('footer.sub')}</p>
        </div>

        <div className="cols">
          <div>
            <h5>{isAr ? 'المحرر المؤسس' : 'Founding Editor'}</h5>
            <p>{isAr
              ? 'طارق الراشد — مفكر عراقي يكتب من المهجر. ناقد للأنظمة، لا الأشخاص.'
              : 'Tariq Al-Rashid — Iraqi thinker writing from the diaspora. Critical of systems, not persons.'}</p>
          </div>
          <div>
            <h5>{isAr ? 'الأقسام' : 'Sections'}</h5>
            <a>{t('nav.home')}</a>
            <a>{t('nav.articles')}</a>
            <a>{t('nav.about')}</a>
            <a>{t('nav.submit')}</a>
          </div>
          <div>
            <h5>{isAr ? 'المجلس الثقافي العراقي' : 'Iraqi Cultural Council'}</h5>
            <p>{isAr
              ? 'المنبر جزء من المنظومة الفكرية للمجلس الثقافي العراقي — أرشيف الحوارات والفكر النقدي.'
              : 'Al-Minbar is part of the intellectual network of the Iraqi Cultural Council — an archive of dialogue and critical thought.'}</p>
          </div>
        </div>

        <div className="colophon-line">
          {isAr
            ? '© ٢٠٢٦ المنبر — جميع الحقوق محفوظة • صُمم بعناية في بغداد والمهجر'
            : '© 2026 Al-Minbar — All rights reserved • Set in Baghdad and the diaspora'}
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Header, Footer, Ziggurat, ZigInline, ZigDivider, Colophon });
