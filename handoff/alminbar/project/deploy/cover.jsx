// Cover splash — full-bleed opening screen, like the cover of a print issue.
// Sits BEFORE the masthead. The reader "opens" the issue to enter the site.

function Cover({ locale, t, onOpen, lead }) {
  const isAr = locale === 'ar';
  const issueNo = isAr ? 'العدد ١٤' : 'Issue 14';
  const seasonal = isAr ? 'ربيع ٢٠٢٦' : 'Spring 2026';
  const dateStr = new Date('2026-04-15').toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <section className="cover">
      <div className="cover-tessellation" />

      {/* Top register — issue stamp */}
      <div className="cover-register top">
        <span className="rule" />
        <span className="stamp">{issueNo} · {seasonal}</span>
        <span className="rule" />
      </div>

      {/* Left rail — vertical metadata (latin) */}
      <div className="cover-rail left">
        <span>AL-MINBAR</span>
        <span className="diamond">◆</span>
        <span>VOL · I</span>
        <span className="diamond">◆</span>
        <span>{dateStr}</span>
      </div>

      {/* Right rail — vertical metadata (arabic) */}
      <div className="cover-rail right">
        <span>المنبر</span>
        <span className="diamond">◆</span>
        <span>المجلد الأول</span>
        <span className="diamond">◆</span>
        <span>بغداد · المهجر</span>
      </div>

      {/* Center stack */}
      <div className="cover-center">
        <div className="cover-crest">
          <Ziggurat width={120} bg="transparent" className="text-gold" />
        </div>

        <h1 className="cover-wordmark">
          {isAr ? 'المنبر' : 'Al-Minbar'}
        </h1>
        <div className="cover-translit">
          {isAr ? 'AL · MINBAR' : 'ا ل م ن ب ر'}
        </div>

        <div className="cover-divider">
          <ZigInline size={14} />
        </div>

        <p className="cover-tagline">
          {isAr
            ? 'تحليلٌ رصينٌ للشأنِ العراقي — حوكمةٌ، اقتصاد، إصلاحٌ مؤسسي.'
            : 'Rigorous analysis of Iraqi affairs — governance, economy, institutional reform.'}
        </p>

        {/* Featured article callout */}
        <div className="cover-feature">
          <span className="kicker">{isAr ? 'في هذا العدد · مقالة الافتتاح' : 'In this issue · Lead essay'}</span>
          <h2 onClick={() => onOpen(lead.slug)}>
            {isAr ? lead.title_ar : lead.title_en}
          </h2>
          <span className="byline">
            {isAr ? lead.author_ar : lead.author_en} · {lead.minutes} {isAr ? 'دقائق' : 'min'}
          </span>
        </div>
      </div>

      {/* Bottom register — open-the-issue CTA */}
      <div className="cover-register bottom">
        <button className="cover-open" onClick={() => onOpen('__home__')}>
          <span className="line" />
          <span className="text">{isAr ? 'افتح العدد' : 'Open the Issue'}</span>
          <span className="arrow">{isAr ? '↓' : '↓'}</span>
          <span className="line" />
        </button>
      </div>
    </section>
  );
}

Object.assign(window, { Cover });
