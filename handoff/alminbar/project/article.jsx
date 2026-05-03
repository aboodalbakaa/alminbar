// Article reading page — manuscript margins, drop cap, margin stats, stat breaks, pull quotes, TL;DR, comments
const { useState: useStateArt } = React;

function Article({ slug, locale, t, onBack, openTldr }) {
  const isAr = locale === 'ar';
  const article = window.ARTICLES.find(a => a.slug === slug);
  if (!article) return null;
  const body = isAr ? article.body_ar : article.body_en;
  const tldr = isAr ? article.tldr_ar : article.tldr_en;
  const fmtDate = new Date(article.date).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const [tldrOpen, setTldrOpen] = useStateArt(true);
  const [comments, setComments] = useStateArt(window.SAMPLE_COMMENTS[slug] || []);
  const [draft, setDraft] = useStateArt('');
  const [posted, setPosted] = useStateArt(false);

  // Render body — text + interleaved margin notes/stats/pulls
  const renderBody = () => {
    if (!body) {
      return (
        <p style={{color: 'var(--ink-faint)', fontStyle: 'italic'}}>
          {isAr ? 'هذه المقالة قيد النشر — استخدم الزر للعودة إلى القائمة.' : 'This essay is being prepared — use the button to return to the index.'}
        </p>
      );
    }
    let pIndex = 0;
    return body.map((block, i) => {
      if (block.type === 'lede') {
        return <p key={i} className="lede">{block.text}</p>;
      }
      if (block.type === 'h2') {
        return (
          <React.Fragment key={i}>
            <div style={{margin: '2.5rem 0 1.5rem', color: 'var(--gold)'}}><ZigDivider /></div>
            <h2>{block.text}</h2>
          </React.Fragment>
        );
      }
      if (block.type === 'stat') {
        return (
          <div className="stat-break" key={i}>
            <span className="label">{block.label}</span>
            <div className="figure">{block.figure}</div>
            <p className="desc">{block.desc}</p>
          </div>
        );
      }
      if (block.type === 'pull') {
        return (
          <div className="pull-quote" key={i}>
            <q>{block.text}</q>
          </div>
        );
      }
      if (block.type === 'p') {
        const isFirstP = pIndex === 0;
        pIndex++;
        const para = (
          <p key={`p-${i}`} className={isFirstP && !body.some(b => b.type === 'lede') ? 'drop-cap' : ''}>
            {block.text}
          </p>
        );
        // If margin note present, render it in adjacent margin column via grid placement
        if (block.margin) {
          return (
            <React.Fragment key={i}>
              <MarginNote note={block.margin} isAr={isAr} />
              {para}
            </React.Fragment>
          );
        }
        return para;
      }
      return null;
    });
  };

  function postComment(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    setPosted(true);
    setDraft('');
    setTimeout(() => setPosted(false), 4000);
  }

  return (
    <div className="article-page">
      <div style={{maxWidth: '1180px', margin: '0 auto', padding: '1.5rem 2rem 0'}}>
        <button onClick={onBack} className="btn btn-ghost" style={{padding: 0}}>
          {isAr ? '→ العودة إلى المقالات' : '← Back to articles'}
        </button>
      </div>

      <div className="article-bandeau">
        <div className="article-bandeau-inner">
          <div className="topic">{isAr ? article.topic_ar : article.topic_en}</div>
          <h1>{isAr ? article.title_ar : article.title_en}</h1>
          <div style={{margin: '1.5rem auto', maxWidth: '24rem', color: 'var(--gold)'}}><ZigDivider /></div>
          <div className="byline">
            <span className="author">{isAr ? article.author_ar : article.author_en}</span>
            <span className="dot" />
            <time>{fmtDate}</time>
            <span className="dot" />
            <span className="reading-time">{article.minutes} {isAr ? 'دقائق للقراءة' : 'min read'}</span>
          </div>
        </div>
      </div>

      <div className="article-body-wrap">
        <div className="article-body">
          {/* TL;DR block — full width inside body column */}
          <div className={`tldr-block ${tldrOpen ? '' : 'collapsed'}`}>
            <button className="tldr-head" onClick={() => setTldrOpen(o => !o)}>
              <div className="left">
                <span style={{fontSize: '1.4rem'}}>🛋️</span>
                <div>
                  <div className="stamp">{t('lazy.stamp')}</div>
                  <h3>{t('lazy.title')}</h3>
                  <div className="sub">{t('lazy.sub')}</div>
                </div>
              </div>
              <div className="toggle">
                <span>{tldrOpen ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'إظهار' : 'Show')}</span>
                <svg className="arrow" width="10" height="10" viewBox="0 0 10 10">
                  <path d="M1 3 L5 7 L9 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>
            <ol>
              {tldr.map((p, i) => <li key={i}>{p}</li>)}
            </ol>
          </div>

          {renderBody()}

          <Colophon />
        </div>

        <AuthorBlock article={article} isAr={isAr} t={t} />

        <div className="comments">
          <h3>{t('comments.title')}<span className="count">({comments.length})</span></h3>
          {comments.length === 0 && <p style={{color: 'var(--ink-faint)', fontSize: '0.92rem'}}>{t('comments.none')}</p>}
          {comments.map(c => (
            <div className="comment" key={c.id}>
              <div className="avatar">{c.initial}</div>
              <div>
                <div className="head">
                  <span className="name">{isAr ? c.name_ar : c.name_en}</span>
                  <time>{new Date(c.date).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                </div>
                <p className="body">{isAr ? c.body_ar : c.body_en}</p>
              </div>
            </div>
          ))}

          <form className="comment-form" onSubmit={postComment}>
            <label>{t('comments.write')}</label>
            <textarea
              dir={isAr ? 'rtl' : 'ltr'}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={isAr ? 'اكتب تعليقك هنا…' : 'Write your comment here…'}
            />
            <div className="footer">
              <span className={posted ? 'toast' : ''}>
                {posted ? (isAr ? '✓ تم الإرسال — سيظهر بعد المراجعة' : '✓ Submitted — will appear after review')
                        : (isAr ? 'تعليقك سيظهر بعد المراجعة' : 'Your comment will appear after review.')}
              </span>
              <button type="submit" className="btn btn-primary" style={{padding: '0.6rem 1.4rem'}}>
                {t('comments.post')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function MarginNote({ note, isAr }) {
  const cls = note.side === 'left' ? 'margin-left' : 'margin-right';
  // RTL: side 'right' should appear on the right of the reader's RTL text column,
  // which in document flow is the start side. Just keep grid-column logic.
  return (
    <aside className={`margin-note ${cls}`}>
      <span className="label">{note.label}</span>
      <span className="number">{note.number}<span className="unit"> {note.unit}</span></span>
      <span style={{fontSize: '0.78rem', color: 'var(--ink-faint)', display: 'block', lineHeight: 1.5}}>
        {note.note}
      </span>
    </aside>
  );
}

function AuthorBlock({ article, isAr, t }) {
  return (
    <div className="author-block">
      <div className="avatar">
        <Ziggurat width={32} bg="#1B2A4A" />
      </div>
      <div>
        <p className="name">{isAr ? article.author_ar : article.author_en}</p>
        <p className="bio">{t('about.bio')}</p>
      </div>
    </div>
  );
}

Object.assign(window, { Article });
