// Root app — locale, routing, tweaks, dictionary
const { useState, useEffect } = React;

const DICT = {
  ar: {
    'site.name': 'المنبر',
    'site.tagline': 'تحليل رصين للشأن العراقي',
    'nav.home': 'الرئيسية',
    'nav.articles': 'المقالات',
    'nav.about': 'عن المنبر',
    'nav.submit': 'أرسل مقالاً',
    'hero.eyebrow': 'منبر للفكر السياسي العراقي',
    'hero.lead-stamp': 'مقالة العدد',
    'hero.desc': 'تحليل رصين ونقد بنّاء للشأن العراقي — حوكمة، سياسة اقتصادية، فساد، إصلاح مؤسسي. هدفنا: عراق عادل ومزدهر.',
    'articles.latest': 'أحدث المقالات',
    'lazy.stamp': 'خلاصة للكسالى',
    'lazy.title': 'النقاط في خمس جمل',
    'lazy.sub': 'لمن لا يريد إضاعة خلاياه الدماغية',
    'lazy.peek': 'الخلاصة',
    'comments.title': 'التعليقات',
    'comments.none': 'لا توجد تعليقات بعد. كن أول من يعلّق.',
    'comments.write': 'أضف تعليقاً',
    'comments.post': 'نشر التعليق',
    'footer.tagline': 'نقد البنية، لا الأشخاص',
    'footer.sub': 'من أجل عراق تحكمه المؤسسات والعدالة',
    'about.bio': 'مفكر عراقي يكتب من المهجر. ناقد للأنظمة، لا الأشخاص. هدف واحد: عراق مزدهر.',
  },
  en: {
    'site.name': 'Al-Minbar',
    'site.tagline': 'Rigorous Analysis of Iraqi Affairs',
    'nav.home': 'Home',
    'nav.articles': 'Essays',
    'nav.about': 'About',
    'nav.submit': 'Submit',
    'hero.eyebrow': 'A Forum for Iraqi Political Thought',
    'hero.lead-stamp': 'Lead essay',
    'hero.desc': 'Rigorous analysis and constructive critique of Iraqi affairs — governance, economic policy, corruption, institutional reform. One goal: a just and prosperous Iraq.',
    'articles.latest': 'Latest Essays',
    'lazy.stamp': 'TL;DR for the Lazy',
    'lazy.title': 'The argument in five lines',
    'lazy.sub': 'For those with better things to do',
    'lazy.peek': 'In short',
    'comments.title': 'Comments',
    'comments.none': 'No comments yet. Be the first.',
    'comments.write': 'Add a comment',
    'comments.post': 'Post Comment',
    'footer.tagline': 'Critique the structure, not the person',
    'footer.sub': 'For an Iraq governed by institutions and justice',
    'about.bio': 'Iraqi thinker writing from the diaspora. Critical of systems, never persons. One goal: a prosperous Iraq.',
  },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "locale": "ar",
  "density": "editorial",
  "accent": "brass",
  "hero": "masthead",
  "tessellation": true
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useState({ name: 'cover', slug: null });

  const locale = tweaks.locale;
  const isAr = locale === 'ar';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.body.dataset.density = tweaks.density;
    document.body.dataset.accent = tweaks.accent;
    document.body.dataset.tessellation = tweaks.tessellation ? 'on' : 'off';
  }, [locale, tweaks.density, tweaks.accent, tweaks.tessellation, isAr]);

  const t = (key) => DICT[locale][key] ?? key;

  const onNavigate = (id) => {
    if (id === 'home' || id === 'articles' || id === 'about' || id === 'submit') {
      setRoute({ name: id, slug: null });
      window.scrollTo(0, 0);
    }
  };
  const onOpen = (slug) => {
    if (slug === '__home__') {
      setRoute({ name: 'home', slug: null });
    } else {
      setRoute({ name: 'article', slug });
    }
    window.scrollTo(0, 0);
  };
  const onBack = () => {
    setRoute({ name: 'home', slug: null });
    window.scrollTo(0, 0);
  };

  const isCover = route.name === 'cover';
  const lead = window.ARTICLES.find(a => a.featured) || window.ARTICLES[0];

  return (
    <>
      {!isCover && <Header locale={locale} route={route.name} onNavigate={onNavigate} t={t} />}
      <main>
        {isCover && (
          <Cover locale={locale} t={t} onOpen={onOpen} lead={lead} />
        )}
        {route.name === 'article' && (
          <Article slug={route.slug} locale={locale} t={t} onBack={onBack} />
        )}
        {route.name !== 'article' && route.name !== 'cover' && (
          <Home
            locale={locale}
            t={t}
            articles={window.ARTICLES}
            onOpen={onOpen}
            hero={tweaks.hero}
          />
        )}
      </main>
      {!isCover && <Footer locale={locale} t={t} />}

      <TweaksPanel title="Tweaks">
        <TweakSection title={isAr ? 'اللغة والاتجاه' : 'Locale & direction'}>
          <TweakRadio
            label={isAr ? 'اللغة' : 'Locale'}
            value={tweaks.locale}
            onChange={v => setTweak('locale', v)}
            options={[{value: 'ar', label: 'العربية'}, {value: 'en', label: 'English'}]}
          />
        </TweakSection>

        <TweakSection title={isAr ? 'تخطيط الصفحة الرئيسية' : 'Homepage hero'}>
          <TweakRadio
            label={isAr ? 'نوع الصدر' : 'Hero treatment'}
            value={tweaks.hero}
            onChange={v => setTweak('hero', v)}
            options={[
              {value: 'lead', label: isAr ? 'مقالة العدد' : 'Lead essay'},
              {value: 'manifesto', label: isAr ? 'بيان' : 'Manifesto'},
              {value: 'masthead', label: isAr ? 'فهرس العدد' : 'Issue index'},
            ]}
          />
        </TweakSection>

        <TweakSection title={isAr ? 'العرض' : 'Presentation'}>
          <TweakRadio
            label={isAr ? 'الكثافة' : 'Density'}
            value={tweaks.density}
            onChange={v => setTweak('density', v)}
            options={[
              {value: 'editorial', label: isAr ? 'تحريري' : 'Editorial'},
              {value: 'compact', label: isAr ? 'مكتنز' : 'Compact'},
            ]}
          />
          <TweakRadio
            label={isAr ? 'اللون المعدني' : 'Accent metal'}
            value={tweaks.accent}
            onChange={v => setTweak('accent', v)}
            options={[
              {value: 'gold', label: isAr ? 'ذهب' : 'Gold'},
              {value: 'brass', label: isAr ? 'نحاس أصفر' : 'Brass'},
              {value: 'copper', label: isAr ? 'نحاس مؤكسد' : 'Copper'},
            ]}
          />
          <TweakToggle
            label={isAr ? 'زخرفة هندسية في الخلفية' : 'Tessellation watermark'}
            value={tweaks.tessellation}
            onChange={v => setTweak('tessellation', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
