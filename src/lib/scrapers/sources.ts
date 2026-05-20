export type RssSource = {
  name: string
  name_ar: string
  url: string
  category: 'news' | 'parliament' | 'official_statement' | 'corruption'
  official_slug?: string
}

export type SocialSource = {
  official_slug: string
  twitter_handle: string
}

// Iraqi news RSS feeds
export const RSS_SOURCES: RssSource[] = [
  {
    name: 'Shafaq News',
    name_ar: 'شفق نيوز',
    url: 'https://shafaq.com/ar/rss.xml',
    category: 'news',
  },
  {
    name: 'Baghdad Today',
    name_ar: 'بغداد اليوم',
    url: 'https://www.baghdadtoday.news/rss.xml',
    category: 'news',
  },
  {
    name: 'NAS News',
    name_ar: 'ناس نيوز',
    url: 'https://www.nasnews.com/rss',
    category: 'news',
  },
  {
    name: 'Rudaw Arabic',
    name_ar: 'رووداو عربي',
    url: 'https://www.rudaw.net/arabic/rss',
    category: 'news',
  },
  {
    name: 'Kurdistan 24',
    name_ar: 'كردستان 24',
    url: 'https://www.kurdistan24.net/ar/rss',
    category: 'news',
  },
  {
    name: "Iraqi News Agency",
    name_ar: 'وكالة الأنباء العراقية',
    url: 'https://www.ina.iq/rss.xml',
    category: 'official_statement',
  },
  {
    name: 'Iraqi Parliament',
    name_ar: 'مجلس النواب العراقي',
    url: 'https://www.parliament.iq/feed/',
    category: 'parliament',
  },
  {
    name: 'Al-Mada',
    name_ar: 'المدى',
    url: 'https://almadapaper.net/feed/',
    category: 'news',
  },
]

// Government keywords for relevance filtering
export const GOVERNMENT_KEYWORDS_AR = [
  'الحكومة', 'البرلمان', 'الوزير', 'رئيس الوزراء', 'السوداني',
  'مجلس النواب', 'مجلس الوزراء', 'الميزانية', 'الفساد',
  'المالية', 'النفط', 'الكهرباء', 'الخدمات', 'البنية التحتية',
  'قانون', 'قرار', 'مرسوم', 'تعيين', 'إقالة', 'استجواب',
]

export const GOVERNMENT_KEYWORDS_EN = [
  'government', 'parliament', 'minister', 'prime minister', 'sudani',
  'council of representatives', 'cabinet', 'budget', 'corruption',
  'finance', 'oil', 'electricity', 'services', 'infrastructure',
  'law', 'decree', 'appointment', 'dismissal', 'interpellation',
]

// World Bank indicators for Iraq
export const WORLD_BANK_INDICATORS = [
  { code: 'NY.GDP.MKTP.CD',   name_en: 'GDP (current USD)',              name_ar: 'الناتج المحلي الإجمالي',               unit: 'USD', category: 'economy' },
  { code: 'NY.GDP.PCAP.CD',   name_en: 'GDP per capita (current USD)',   name_ar: 'نصيب الفرد من الناتج المحلي',          unit: 'USD', category: 'economy' },
  { code: 'NY.GDP.MKTP.KD.ZG',name_en: 'GDP growth rate (%)',            name_ar: 'معدل نمو الناتج المحلي',               unit: '%',   category: 'economy' },
  { code: 'FP.CPI.TOTL.ZG',   name_en: 'Inflation rate (%)',             name_ar: 'معدل التضخم',                          unit: '%',   category: 'economy' },
  { code: 'SL.UEM.TOTL.ZS',   name_en: 'Unemployment rate (%)',          name_ar: 'معدل البطالة',                         unit: '%',   category: 'social'  },
  { code: 'SP.POP.TOTL',       name_en: 'Population',                    name_ar: 'عدد السكان',                           unit: '',    category: 'social'  },
  { code: 'SI.POV.NAHC',       name_en: 'Poverty headcount ratio (%)',   name_ar: 'نسبة الفقر',                           unit: '%',   category: 'social'  },
  { code: 'SE.ADT.LITR.ZS',    name_en: 'Literacy rate (%)',              name_ar: 'معدل الإلمام بالقراءة والكتابة',       unit: '%',   category: 'social'  },
  { code: 'SP.DYN.LE00.IN',    name_en: 'Life expectancy (years)',        name_ar: 'متوسط العمر المتوقع',                  unit: 'yrs', category: 'social'  },
  { code: 'IT.NET.USER.ZS',    name_en: 'Internet users (% of pop.)',     name_ar: 'مستخدمو الإنترنت',                     unit: '%',   category: 'social'  },
  { code: 'GC.BAL.CASH.GD.ZS', name_en: 'Budget balance (% of GDP)',     name_ar: 'الميزانية العامة (% من الناتج)',        unit: '%',   category: 'economy' },
  { code: 'FI.RES.TOTL.CD',    name_en: 'Foreign reserves (USD)',         name_ar: 'الاحتياطيات الأجنبية',                 unit: 'USD', category: 'economy' },
]

// Manual/static international rankings (updated periodically)
// These come from orgs with no public API — admin updates manually or we scrape HTML
export const STATIC_RANKINGS = [
  {
    slug: 'cpi',
    name_en: 'Corruption Perceptions Index',
    name_ar: 'مؤشر مدركات الفساد',
    source_name: 'Transparency International',
    source_url: 'https://www.transparency.org/en/cpi',
    category: 'governance',
    unit: 'score/180',
    description_en: 'Ranks countries by perceived public sector corruption. Lower rank = more corrupt.',
    description_ar: 'يُصنِّف الدول بحسب مستوى الفساد المُدرَك في القطاع العام. الترتيب الأدنى يعني فساداً أعلى.',
  },
  {
    slug: 'hdi',
    name_en: 'Human Development Index',
    name_ar: 'مؤشر التنمية البشرية',
    source_name: 'UNDP',
    source_url: 'https://hdr.undp.org',
    category: 'social',
    unit: 'score/191',
    description_en: 'Measures life expectancy, education, and income. Higher rank = better development.',
    description_ar: 'يقيس العمر المتوقع والتعليم والدخل. الترتيب الأعلى يعني تنمية بشرية أفضل.',
  },
  {
    slug: 'press-freedom',
    name_en: 'Press Freedom Index',
    name_ar: 'مؤشر حرية الصحافة',
    source_name: 'Reporters Without Borders (RSF)',
    source_url: 'https://rsf.org/en/index',
    category: 'governance',
    unit: 'score/180',
    description_en: 'Ranks freedom of the press globally. Lower rank = less press freedom.',
    description_ar: 'يُصنِّف حرية الصحافة عالمياً. الترتيب الأدنى يعني حرية صحافة أقل.',
  },
  {
    slug: 'global-peace',
    name_en: 'Global Peace Index',
    name_ar: 'مؤشر السلام العالمي',
    source_name: 'Institute for Economics & Peace',
    source_url: 'https://www.visionofhumanity.org/maps/',
    category: 'security',
    unit: 'score/163',
    description_en: 'Measures societal safety, conflict, and militarisation. Higher rank = more peaceful.',
    description_ar: 'يقيس الأمن الاجتماعي والنزاعات والتسليح. الترتيب الأعلى يعني سلاماً أكبر.',
  },
  {
    slug: 'democracy-index',
    name_en: 'Democracy Index',
    name_ar: 'مؤشر الديمقراطية',
    source_name: 'Economist Intelligence Unit',
    source_url: 'https://www.eiu.com/n/campaigns/democracy-index/',
    category: 'governance',
    unit: 'score/167',
    description_en: 'Measures state of democracy across five categories.',
    description_ar: 'يقيس حالة الديمقراطية عبر خمسة محاور.',
  },
  {
    slug: 'doing-business',
    name_en: 'Ease of Doing Business',
    name_ar: 'سهولة ممارسة الأعمال',
    source_name: 'World Bank',
    source_url: 'https://www.doingbusiness.org',
    category: 'economy',
    unit: 'score/190',
    description_en: 'Measures business regulation environment.',
    description_ar: 'يقيس بيئة تنظيم الأعمال.',
  },
  {
    slug: 'fragile-states',
    name_en: 'Fragile States Index',
    name_ar: 'مؤشر الدول الهشة',
    source_name: 'Fund for Peace',
    source_url: 'https://fragilestatesindex.org',
    category: 'governance',
    unit: 'score/179',
    description_en: 'Measures state vulnerability to conflict and collapse.',
    description_ar: 'يقيس هشاشة الدولة وقابليتها للانهيار.',
  },
]
