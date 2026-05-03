// Home page — masthead-driven layout, lead article + TL;DR, archive grid, manifesto strip
const { useState: useStateHome } = React;

function Home({ locale, t, articles, onOpen, hero }) {
  const isAr = locale === 'ar';
  const lead = articles.find(a => a.featured) || articles[0];
  const rest = articles.filter(a => a.slug !== lead.slug);

  const fmtDate = (d) => new Date(d).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      {/* HERO — varies by tweak */}
      {hero === 'lead' && <HeroLead locale={locale} t={t} article={lead} onOpen={onOpen} />}
      {hero === 'manifesto' && <HeroManifesto locale={locale} t={t} onCta={() => onOpen(lead.slug)} />}
      {hero === 'masthead' && <HeroMasthead locale={locale} t={t} articles={articles.slice(0, 4)} onOpen={onOpen} />}

      {/* LATEST */}
      <section className="section-band">
        <div className="section-head">
          <h3>{t('articles.latest')}</h3>
          <span className="meta">{isAr ? `${articles.length} مقالة منشورة` : `${articles.length} published essays`}</span>
        </div>
        <div className="article-grid">
          {(hero === 'lead' ? rest : articles).slice(0, 3).map(a => (
            <ArticleCard key={a.slug} article={a} locale={locale} t={t} onOpen={onOpen} fmtDate={fmtDate} />
          ))}
        </div>
      </section>

      {/* MANIFESTO STRIP */}
      <section className="manifesto">
        <div className="manifesto-inner">
          <ZigDivider />
          <blockquote style={{marginTop: '2rem'}}>
            {isAr
              ? '"نقد البنية لا يعني مهاجمة أصحابها. العراق يحتاج إلى من يرى المشكلة بوضوح قبل أن يدّعي معرفة الحل."'
              : '"Critiquing the structure does not mean attacking those within it. Iraq needs people who see the problem clearly before claiming to know the solution."'}
          </blockquote>
          <cite>— {isAr ? 'طارق الراشد، المحرر المؤسس' : 'Tariq Al-Rashid, Founding Editor'}</cite>
        </div>
      </section>

      {/* ARCHIVE — print-feel listing */}
      <section className="section-band alt">
        <div className="section-head">
          <h3>{isAr ? 'من الأرشيف' : 'From the Archive'}</h3>
          <span className="meta">{isAr ? 'كل المقالات' : 'All essays →'}</span>
        </div>
        <div className="archive-strip">
          {articles.slice(0, 6).map(a => (
            <button className="archive-row" key={a.slug} onClick={() => onOpen(a.slug)}>
              <span className="date">{fmtDate(a.date)}</span>
              <span className="title">{isAr ? a.title_ar : a.title_en}</span>
              <span className="topic">{isAr ? a.topic_ar : a.topic_en}</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function HeroLead({ locale, t, article, onOpen }) {
  const isAr = locale === 'ar';
  const tldr = isAr ? article.tldr_ar : article.tldr_en;
  return (
    <section className="hero">
      <div className="tessellation" />
      <div className="hero-grid">
        <div className="hero-lead">
          <div className="topic-line">
            <span className="pellet" />
            <span className="label">{t('hero.lead-stamp')} · {isAr ? article.topic_ar : article.topic_en}</span>
          </div>
          <h2 onClick={() => onOpen(article.slug)} style={{cursor: 'pointer'}}>
            {isAr ? article.title_ar : article.title_en}
          </h2>
          <p className="lede">{isAr ? article.excerpt_ar : article.excerpt_en}</p>
          <div className="byline">
            <span className="author">{isAr ? article.author_ar : article.author_en}</span>
            <span className="dot" />
            <span>{new Date(article.date).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="dot" />
            <span className="reading-time">{article.minutes} {isAr ? 'دقائق للقراءة' : 'min read'}</span>
          </div>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => onOpen(article.slug)}>
              {isAr ? 'اقرأ المقالة كاملة' : 'Read the full essay'}
            </button>
            <button className="btn btn-outline" onClick={() => onOpen(article.slug, 'tldr')}>
              {isAr ? 'اقرأ خلاصة الكسالى' : 'Just the TL;DR'}
            </button>
          </div>
        </div>

        <aside className="tldr-card">
          <div className="head">
            <div className="stamp">
              <span>🛋️</span>
              <span>{t('lazy.stamp')}</span>
            </div>
            <h3>{t('lazy.title')}</h3>
            <p className="sub">{t('lazy.sub')}</p>
          </div>
          <ol>
            {tldr.map((p, i) => <li key={i}>{p}</li>)}
          </ol>
        </aside>
      </div>
    </section>
  );
}

function HeroManifesto({ locale, t, onCta }) {
  const isAr = locale === 'ar';
  return (
    <section className="hero" style={{padding: '6rem 2rem 7rem', background: 'var(--clay-deep)'}}>
      <div className="tessellation" />
      <div style={{maxWidth: '880px', margin: '0 auto', textAlign: 'center', position: 'relative'}}>
        <div style={{display: 'flex', justifyContent: 'center', marginBottom: '2rem', color: 'var(--gold)'}}>
          <ZigInline size={20} />
        </div>
        <p className="eyebrow" style={{marginBottom: '1.4rem'}}>{t('hero.eyebrow')}</p>
        <h2 style={{
          fontFamily: isAr ? 'var(--font-ar-display)' : 'var(--font-en-display)',
          fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
          fontWeight: isAr ? 700 : 500,
          lineHeight: 1.1,
          margin: '0 0 1.6rem',
          letterSpacing: '-0.01em',
          fontStyle: isAr ? 'normal' : 'italic',
        }}>
          {isAr ? 'نقد البنية،\nمن أجل عراق مزدهر.' : 'Critique the structure.\nFor a prosperous Iraq.'}
        </h2>
        <p style={{fontSize: '1.2rem', color: 'var(--ink-soft)', maxWidth: '36rem', margin: '0 auto 2rem', lineHeight: 1.65}}>
          {t('hero.desc')}
        </p>
        <div style={{display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap'}}>
          <button className="btn btn-primary" onClick={onCta}>{isAr ? 'ابدأ القراءة' : 'Start reading'}</button>
          <button className="btn btn-outline">{isAr ? 'عن المنبر' : 'About Al-Minbar'}</button>
        </div>
      </div>
    </section>
  );
}

function HeroMasthead({ locale, t, articles, onOpen }) {
  const isAr = locale === 'ar';
  return (
    <section className="hero" style={{padding: '3rem 2rem 4rem'}}>
      <div style={{maxWidth: '1280px', margin: '0 auto'}}>
        <div style={{textAlign: 'center', marginBottom: '2.5rem'}}>
          <p className="eyebrow">{isAr ? 'محتويات هذا العدد' : 'In this issue'}</p>
          <div style={{color: 'var(--gold)', display: 'flex', justifyContent: 'center', marginTop: '0.8rem'}}>
            <ZigInline size={14} />
          </div>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0',
          borderTop: '1px solid var(--clay-line)',
          borderBottom: '1px solid var(--clay-line)',
        }}>
          {articles.map((a, i) => (
            <button key={a.slug}
              onClick={() => onOpen(a.slug)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '2rem 1.5rem',
                borderInlineEnd: i < articles.length - 1 ? '1px solid var(--clay-line)' : 'none',
                textAlign: 'start',
                fontFamily: 'inherit',
                color: 'inherit',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--clay-deep)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: 'var(--gold)', display: 'block', marginBottom: '0.8rem',
              }}>{String(i + 1).padStart(2, '0')} · {isAr ? a.topic_ar : a.topic_en}</span>
              <h3 style={{
                fontFamily: isAr ? 'var(--font-ar-display)' : 'var(--font-en-display)',
                fontSize: '1.15rem',
                fontWeight: isAr ? 700 : 600,
                margin: 0,
                lineHeight: 1.3,
                color: 'var(--ink)',
                fontStyle: isAr ? 'normal' : 'italic',
              }}>{isAr ? a.title_ar : a.title_en}</h3>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArticleCard({ article, locale, t, onOpen, fmtDate }) {
  const isAr = locale === 'ar';
  const tldr = isAr ? article.tldr_ar : article.tldr_en;
  const peek = tldr && tldr[0];
  return (
    <button className="article-card" onClick={() => onOpen(article.slug)}>
      <div className="topic">{isAr ? article.topic_ar : article.topic_en}</div>
      <h4>{isAr ? article.title_ar : article.title_en}</h4>
      <p className="excerpt">{isAr ? article.excerpt_ar : article.excerpt_en}</p>
      {peek && (
        <div className="tldr-peek">
          <span className="label">{t('lazy.peek')}</span>
          {peek}
        </div>
      )}
      <div className="meta">
        <span className="author">{isAr ? article.author_ar : article.author_en}</span>
        <span className="reading-time">{article.minutes} {isAr ? 'د' : 'min'}</span>
      </div>
    </button>
  );
}

Object.assign(window, { Home });
