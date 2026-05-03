# Al-Minbar — Design Implementation Handoff

You are Claude Code working in my live Al-Minbar repository (Next.js / React). I have just designed a Mesopotamian-inflected editorial system in a separate prototyping environment, and I need you to port the entire design into this codebase, adapting it to whatever stack and file conventions are already in place here.

## Your task

1. **Read the existing repo first.** Identify the stack (Next.js App Router? Pages Router? Vite + React?), the styling approach (Tailwind / CSS Modules / global CSS / styled-components), and the existing routing.
2. **Port the design below into idiomatic code for this repo.** Do NOT just dump these files in. Translate them. Convert .jsx component files into the project's component structure, convert CSS into the project's chosen system, set up routes, etc.
3. **Preserve the design intent strictly.** All visual/typographic decisions below are deliberate — don't simplify them. The Mesopotamian watermark, the brass-on-parchment palette, the Arabic-first RTL layout, the TL;DR-as-feature, the margin-stat floats, the cover splash, the tweaks panel — all of it should land.
4. **Two locales: Arabic (default, RTL) and English (LTR).** Whatever i18n system the repo uses, wire both into it. If none exists, set up a minimal one matching what's below.
5. **One commit at a time, in logical chunks.** Cover + masthead, then home, then article reading view, then tweaks panel.

---

## Design system

**Palette**
- Ink (navy): #1B2A4A — primary text, masthead, dark surfaces
- Ink soft: #4A5878 — secondary text
- Ink faint: #8794AB — meta, captions
- Clay (parchment): #FAFAF6 — page background
- Clay deep: #F1ECDF — alternating bands
- Clay line: #E4DCC9 — hairlines
- Gold (brass): #B8923A — accent default
- Gold soft: #D4B76A — hover/lift
- Terracotta: #8B3A2F — used sparingly for emphasis

**Accent metals (Tweaks)** — three palettes user can switch between:
- gold: #B8923A
- brass: #C8A961 (the chosen default)
- copper (oxidized): #8E5A3B

**Type**
- Arabic display: Amiri (serif, traditional naskh)
- Arabic body: Noto Naskh Arabic
- English display: Cormorant Garamond (italic 500 for headlines)
- English body: Inter (300/400/500/600/700)
- Mono: JetBrains Mono (for stamps, eyebrows, datelines)

Load via Google Fonts:
`https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap`

**Voice / editorial tone**
Critical, calm, structurally analytical. The site critiques systems, never persons. Tagline: "Critique the structure, not the person — for an Iraq governed by institutions and justice."

---

## Architecture (4 main views)

### 1. Cover splash (`/` initial state, OR a separate /cover route)
A full-bleed dark navy print-issue cover, BEFORE the masthead. Mesopotamian rosette watermark in brass on ink, screen-blended. Vertical rails on left (Latin: AL-MINBAR · VOL · I · date) and right (Arabic: المنبر · المجلد الأول · بغداد). Centered: ziggurat crest, oversized wordmark "المنبر / Al-Minbar", transliteration line, ZigDivider, tagline, then a featured-essay panel with diamond-pinned border showing the lead article. At the bottom, an animated "افتح العدد / Open the Issue" CTA. Clicking it transitions to the masthead/home (this is one-time entry; the masthead title afterward goes to home, not back to cover).

### 2. Masthead + Home (3 hero variants exposed via Tweaks)
- **Header (masthead)**: util-bar at top, central crest with issue-stamp + ziggurat + wordmark + tagline, then a horizontal nav.
- **Hero variant: "lead"** — featured essay on the left, TL;DR sidebar on the right.
- **Hero variant: "manifesto"** — centered manifesto headline on dark clay-deep with watermark.
- **Hero variant: "masthead"** (the chosen default) — "In this issue" — a horizontal numbered index across all featured articles, like a print contents page.
- **Latest essays** section — 3 article cards with topic mark, headline, excerpt, TL;DR-peek (first bullet), meta.
- **Manifesto strip** — pull-quote band with ZigDivider above and below.
- **Archive** — print-style contents listing of all essays.

### 3. Article reading page
- "Back" ghost button at top.
- **Bandeau**: topic kicker, oversized headline, ZigDivider, byline (author · date · read time).
- **TL;DR block** (the signature feature) — collapsible block at the top of body, "🛋️ TL;DR for the Lazy / خلاصة للكسالى" stamp, "The argument in five lines / النقاط في خمس جمل" headline, sub "For those with better things to do / لمن لا يريد إضاعة خلاياه الدماغية", then the 5 bullets.
- **Body**: lede paragraph, drop-cap on first body paragraph (terracotta capital), serif body type, h2s separated by ZigDivider above.
- **Margin notes**: float into the gutter beside their paragraph (left or right, RTL-aware). Each shows label (caps mono), big mono number with unit, and a small note-source line. CRITICAL: they must NOT stack on top of each other — they float beside their adjacent paragraph using `float` + negative outer margin to push into the article-body-wrap's side gutter, with `clear` to prevent piling. On <1100px viewport, fall back to inline full-width.
- **Stat break**: full-width centered stat block — small label, huge mono figure (e.g. "< 4%"), one-sentence description. Use as section punctuation.
- **Pull quote**: large italic/display centered, no quotation marks, terracotta accent.
- **Colophon**: small ZigInline + diamond end-mark.
- **Author block** with ziggurat avatar.
- **Comments**: seeded sample comments + comment form with toast confirmation.

### 4. Tweaks panel (floating, bottom-right; toggleable)
- Locale: Arabic / English (full RTL/LTR swap, font swap, dictionary swap)
- Hero treatment: lead / manifesto / masthead
- Density: editorial / compact
- Accent metal: gold / brass / copper
- Tessellation watermark: on / off
Defaults: locale=ar, hero=masthead, density=editorial, accent=brass, tessellation=on

The tweaks panel persists state to localStorage.

---

## Mesopotamian watermark (the visual signature)

A repeating SVG background layered onto hero sections, the cover, and any "stamp" surfaces. NOT a generic geometric pattern — it must use authentic motifs:

1. **Inanna's 8-petal rosette** (Sumerian symbol of Ishtar, found on cylinder seals and the Ishtar Gate) — concentric circles + 8 radial ellipse petals + 8 radial tick marks. Tile size 160×160 (or 240×240 on the cover).
2. **Cuneiform wedge clusters** — small triangular fills scattered between rosettes, like marks pressed into clay tablets. Tile size 80×80, offset 40px from the rosette grid.
3. **Stepped ziggurat brackets** — small corner step-pyramid lines connecting motifs.

On parchment (light) backgrounds: `mix-blend-mode: multiply`, opacity 1.
On dark ink (cover): `mix-blend-mode: screen`, opacity 0.5.

Stroke color: brass (#B8923A), stroke-width 0.6–0.7, opacity 0.55–0.85 baked into the SVG.

The exact SVG markup is in styles.css below — port it verbatim into the CSS-equivalent in the new repo.

---

## Sample content (port as seed data)

Author across all articles: **Tariq Al-Rashid / طارق الراشد** — "Iraqi thinker writing from the diaspora. Critical of systems, never persons. One goal: a prosperous Iraq."

5 articles in seed data, 2 with full bodies:
1. **muwazanat-2025** (FULL BODY) — "The Iraqi Budget 2025: The Illusion of Reform" — economic policy, featured/lead. 4 margin stats: 93% oil revenue, $65 break-even, 4M+ public sector, <4% private sector. Pull quote: "The rentier state does not reform itself."
2. **kahraba-baghdad** (FULL BODY) — "Baghdad Electricity: Twenty Years of Promises" — infrastructure. 4 margin stats: $80B+ cumulative spend, 8,000 MW peak gap, 7 layers of intermediaries, 2.5M+ generator subscribers. Pull quote: "Our electricity is not an engineering problem. It is a political problem in an engineer's uniform."
3. **al-fasad-al-mu-assasi** (TL;DR only) — "Institutional Corruption: Not an Exception, A Mechanism of Rule"
4. **al-mu-assasat-al-da-ifa** (TL;DR only) — "Institutions Without Authority"
5. **al-shabab-w-al-hijra** (TL;DR only) — "The Brain Drain: When Leaving Becomes the Rational Choice"

All article copy (Arabic + English, including TL;DRs, body blocks with margin/stat/pull metadata, and seeded comments) is in data.js below.

---

## Source files (port these — adapt to repo conventions)

Below are all the source files from the prototype. Read each one, understand what it does, then port it to the live repo's idioms. The HTML file is just a shell that loads the JSX scripts; in a real Next.js repo, replace it with the App Router's layout + page structure.


---

### `Al-Minbar.html`

```html
<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>المنبر | Al-Minbar — تحليل رصين للشأن العراقي</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
  <template id="__bundler_thumbnail">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#1B2A4A"/>
      <g fill="#B8923A" transform="translate(60 50)">
        <circle cx="40" cy="7" r="6"/><circle cx="43" cy="7" r="4.5" fill="#1B2A4A"/>
        <rect x="28" y="14" width="24" height="12"/>
        <rect x="18" y="26" width="44" height="10"/>
        <rect x="8" y="36" width="64" height="10"/>
        <rect x="0" y="46" width="80" height="10"/>
        <rect x="36" y="26" width="8" height="30" fill="#1B2A4A"/>
        <rect x="15" y="46" width="8" height="10" fill="#1B2A4A"/>
        <rect x="57" y="46" width="8" height="10" fill="#1B2A4A"/>
      </g>
      <text x="100" y="160" text-anchor="middle" fill="#B8923A" font-family="serif" font-size="22" font-weight="700">المنبر</text>
    </svg>
  </template>
</head>
<body>
  <div id="root"></div>

  <script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>

  <script src="data.js"></script>
  <script type="text/babel" src="tweaks-panel.jsx"></script>
  <script type="text/babel" src="components.jsx"></script>
  <script type="text/babel" src="cover.jsx"></script>
  <script type="text/babel" src="home.jsx"></script>
  <script type="text/babel" src="article.jsx"></script>
  <script type="text/babel" src="app.jsx"></script>
</body>
</html>

```

---

### `styles.css`

```css
/* ==========================================================
   Al-Minbar — Mesopotamian editorial system
   ========================================================== */

:root {
  --ink: #1B2A4A;
  --ink-soft: #4A5878;
  --ink-faint: #8794AB;
  --clay: #FAFAF6;
  --clay-deep: #F1ECDF;
  --clay-line: #E4DCC9;
  --gold: #B8923A;
  --gold-soft: #D4B76A;
  --gold-faint: rgba(184, 146, 58, 0.18);
  --terracotta: #8B3A2F;
  --terracotta-soft: #B05544;

  /* Density */
  --col-narrow: 38rem;
  --col-wide: 64rem;
  --col-margin: 14rem;

  /* Type scale */
  --fs-eyebrow: 0.72rem;
  --fs-body: 1.0625rem;
  --fs-lede: 1.2rem;
  --fs-h3: 1.5rem;
  --fs-h2: 2rem;
  --fs-h1: 2.75rem;
  --fs-display: 4.5rem;

  --font-ar-display: 'Amiri', 'Noto Naskh Arabic', serif;
  --font-ar-body: 'Noto Naskh Arabic', 'Amiri', serif;
  --font-en-display: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
  --font-en-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }

html[lang="ar"] body {
  font-family: var(--font-ar-body);
  line-height: 1.95;
}
html[lang="en"] body {
  font-family: var(--font-en-body);
  line-height: 1.65;
}

body {
  background: var(--clay);
  color: var(--ink);
  font-size: var(--fs-body);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

[dir="rtl"] { direction: rtl; }
[dir="ltr"] { direction: ltr; }

/* Density variants */
body[data-density="compact"] {
  --fs-body: 1rem;
  --fs-lede: 1.1rem;
  --fs-h1: 2.25rem;
  --fs-h2: 1.75rem;
  --fs-display: 3.75rem;
}

/* Accent swap */
body[data-accent="brass"] {
  --gold: #9A7C36;
  --gold-soft: #B89858;
  --gold-faint: rgba(154, 124, 54, 0.18);
}
body[data-accent="copper"] {
  --gold: #A35E3F;
  --gold-soft: #C68263;
  --gold-faint: rgba(163, 94, 63, 0.18);
}

/* ====== Type helpers ====== */
.font-ar-display { font-family: var(--font-ar-display); }
.font-ar-body    { font-family: var(--font-ar-body); }
.font-en-display { font-family: var(--font-en-display); font-weight: 500; }
.font-en-body    { font-family: var(--font-en-body); }
.font-mono       { font-family: var(--font-mono); }

.eyebrow {
  font-family: var(--font-mono);
  font-size: var(--fs-eyebrow);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--gold);
  font-weight: 500;
}
html[lang="ar"] .eyebrow { letter-spacing: 0.08em; }

/* ====== Manuscript constructs ====== */

/* Ziggurat divider — a tiny silhouette flanked by gold rules */
.zig-divider {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  width: 100%;
  color: var(--gold);
}
.zig-divider .rule {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--gold-faint) 30%, var(--gold) 50%, var(--gold-faint) 70%, transparent);
}
.zig-divider svg { flex-shrink: 0; opacity: 0.85; }

/* Drop cap — terracotta filled rectangle, 4 lines tall, with cornerstone tick */
.drop-cap::first-letter {
  font-family: var(--font-en-display);
  font-weight: 600;
  float: left;
  font-size: 4.5em;
  line-height: 0.85;
  padding: 0.12em 0.18em 0.05em;
  margin: 0.08em 0.5rem 0 0;
  background: var(--terracotta);
  color: var(--clay);
  shape-outside: margin-box;
}
[dir="rtl"] .drop-cap::first-letter,
html[lang="ar"] .drop-cap::first-letter {
  float: right;
  margin: 0.08em 0 0 0.5rem;
}

/* End-of-article colophon mark */
.colophon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  margin: 3rem auto 0;
  color: var(--gold);
}
.colophon .rule {
  width: 4rem;
  height: 1px;
  background: var(--gold-faint);
}
.colophon .diamond {
  width: 8px;
  height: 8px;
  background: var(--ink);
  transform: rotate(45deg);
}

/* Mesopotamian watermark — Inanna 8-petal rosette + cuneiform wedges + ziggurat steps.
   Two stacked tiles: the rosette layer is the focal motif, the wedge layer adds a cuneiform texture. */
.tessellation {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    /* Layer 1: Rosette of Inanna (8 petals + central boss) on a 160px grid */
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160' width='160' height='160'><g fill='none' stroke='%23B8923A' stroke-width='0.7' opacity='0.85'><g transform='translate(80 80)'><circle r='3'/><circle r='9'/><circle r='22'/><g><ellipse cx='0' cy='-15' rx='4.5' ry='13'/><ellipse cx='0' cy='-15' rx='4.5' ry='13' transform='rotate(45)'/><ellipse cx='0' cy='-15' rx='4.5' ry='13' transform='rotate(90)'/><ellipse cx='0' cy='-15' rx='4.5' ry='13' transform='rotate(135)'/><ellipse cx='0' cy='-15' rx='4.5' ry='13' transform='rotate(180)'/><ellipse cx='0' cy='-15' rx='4.5' ry='13' transform='rotate(225)'/><ellipse cx='0' cy='-15' rx='4.5' ry='13' transform='rotate(270)'/><ellipse cx='0' cy='-15' rx='4.5' ry='13' transform='rotate(315)'/></g><g stroke-width='0.4' opacity='0.7'><line x1='0' y1='-22' x2='0' y2='-32'/><line x1='0' y1='22' x2='0' y2='32'/><line x1='-22' y1='0' x2='-32' y2='0'/><line x1='22' y1='0' x2='32' y2='0'/><line x1='-15.5' y1='-15.5' x2='-22.6' y2='-22.6'/><line x1='15.5' y1='-15.5' x2='22.6' y2='-22.6'/><line x1='-15.5' y1='15.5' x2='-22.6' y2='22.6'/><line x1='15.5' y1='15.5' x2='22.6' y2='22.6'/></g></g></g></svg>"),
    /* Layer 2: cuneiform wedge clusters + stepped ziggurat corners on an 80px grid */
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80' width='80' height='80'><g fill='%23B8923A' opacity='0.32'><path d='M8 12 L14 14 L8 16 Z'/><path d='M16 12 L22 14 L16 16 Z'/><path d='M8 20 L14 22 L8 24 Z'/><path d='M58 56 L64 58 L58 60 Z'/><path d='M66 56 L72 58 L66 60 Z'/><path d='M58 64 L64 66 L58 68 Z'/></g><g fill='none' stroke='%23B8923A' stroke-width='0.55' opacity='0.5'><path d='M40 36 L40 30 L46 30 L46 24 L52 24'/><path d='M40 44 L40 50 L34 50 L34 56 L28 56'/></g></svg>");
  background-size: 160px 160px, 80px 80px;
  background-position: 0 0, 40px 40px;
  opacity: 0;
  transition: opacity 0.4s;
  mix-blend-mode: multiply;
}
body[data-tessellation="on"] .tessellation { opacity: 1; }
/* On dark clay backgrounds (manifesto hero), screen the motif so brass glows out instead of disappearing */
.hero[style*="clay-deep"] .tessellation { mix-blend-mode: screen; }

/* ====== Buttons & links ====== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1.5rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
html[lang="ar"] .btn {
  font-family: var(--font-ar-body);
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  text-transform: none;
  font-weight: 600;
}
.btn-primary {
  background: var(--ink);
  color: var(--clay);
}
.btn-primary:hover { background: var(--terracotta); }
.btn-outline {
  background: transparent;
  color: var(--gold);
  border: 1px solid var(--gold);
}
.btn-outline:hover { background: var(--gold); color: var(--clay); }
.btn-ghost {
  background: transparent;
  color: var(--ink-soft);
}
.btn-ghost:hover { color: var(--ink); }

.link-gold {
  color: var(--gold);
  text-decoration: none;
  border-bottom: 1px solid var(--gold-faint);
  transition: border-color 0.2s, color 0.2s;
}
.link-gold:hover { color: var(--terracotta); border-color: var(--terracotta); }

/* ====== Layout primitives ====== */
.shell {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ====== Masthead / Header ====== */
.masthead {
  background: var(--ink);
  color: var(--clay);
  position: relative;
  overflow: hidden;
}
.masthead .util-bar {
  border-bottom: 1px solid rgba(255,255,255,0.08);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.masthead .util-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.7rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(255,255,255,0.45);
}
html[lang="ar"] .masthead .util-bar { font-family: var(--font-ar-body); font-size: 0.78rem; letter-spacing: 0.04em; text-transform: none; }

.masthead .crest {
  padding: 2.4rem 2rem 1.6rem;
  text-align: center;
  position: relative;
}
.masthead .crest h1 {
  font-family: var(--font-ar-display);
  font-size: var(--fs-display);
  font-weight: 700;
  margin: 0.6rem 0 0.4rem;
  color: var(--gold);
  letter-spacing: -0.02em;
  line-height: 0.9;
}
html[lang="en"] .masthead .crest h1 {
  font-family: var(--font-en-display);
  font-style: italic;
  font-weight: 600;
  letter-spacing: 0.01em;
}
.masthead .crest .tagline {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  margin-top: 0.5rem;
}
html[lang="ar"] .masthead .crest .tagline {
  font-family: var(--font-ar-body);
  font-size: 0.92rem;
  letter-spacing: 0.04em;
  text-transform: none;
}

.masthead .nav {
  border-top: 1px solid rgba(255,255,255,0.08);
}
.masthead .nav ul {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: center;
  list-style: none;
  gap: 0;
}
.masthead .nav a {
  display: block;
  padding: 1rem 1.4rem;
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}
.masthead .nav a:hover { color: var(--clay); }
.masthead .nav a.active {
  color: var(--gold);
  border-bottom-color: var(--gold);
}

.masthead .issue-stamp {
  position: absolute;
  top: 1.2rem;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(184, 146, 58, 0.5);
  border: 1px solid rgba(184, 146, 58, 0.3);
  padding: 0.25rem 0.6rem;
}
[dir="ltr"] .masthead .issue-stamp { right: 2rem; }
[dir="rtl"] .masthead .issue-stamp { left: 2rem; }
html[lang="ar"] .masthead .issue-stamp {
  font-family: var(--font-ar-body); letter-spacing: 0.04em; text-transform: none; font-size: 0.78rem;
}

/* ====== Hero / Lead ====== */
.hero {
  position: relative;
  background: var(--clay);
  border-bottom: 1px solid var(--clay-line);
  padding: 4rem 2rem 5rem;
  overflow: hidden;
}

.hero-grid {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 4rem;
  align-items: start;
}
[dir="rtl"] .hero-grid { grid-template-columns: 360px 1fr; }
@media (max-width: 900px) {
  .hero-grid, [dir="rtl"] .hero-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
}

.hero-lead .topic-line {
  display: flex; align-items: center; gap: 0.8rem;
  margin-bottom: 1.2rem;
  color: var(--gold);
}
.hero-lead .topic-line .pellet {
  width: 6px; height: 6px; background: var(--terracotta); transform: rotate(45deg);
}
.hero-lead .topic-line .label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
html[lang="ar"] .hero-lead .topic-line .label {
  font-family: var(--font-ar-body); letter-spacing: 0.05em; text-transform: none; font-weight: 600;
}

.hero-lead h2 {
  font-family: var(--font-ar-display);
  font-size: clamp(2rem, 4.2vw, 3.5rem);
  font-weight: 700;
  margin: 0 0 1.4rem;
  line-height: 1.15;
  color: var(--ink);
  letter-spacing: -0.005em;
}
html[lang="en"] .hero-lead h2 {
  font-family: var(--font-en-display);
  font-weight: 500;
  font-size: clamp(2rem, 3.8vw, 3.2rem);
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.hero-lead .lede {
  font-size: var(--fs-lede);
  color: var(--ink-soft);
  margin-bottom: 1.8rem;
  max-width: 38rem;
  line-height: 1.7;
}
html[lang="en"] .hero-lead .lede {
  font-family: var(--font-en-display);
  font-style: italic;
  font-weight: 400;
}

.hero-lead .byline {
  display: flex; align-items: center; gap: 1rem;
  color: var(--ink-soft);
  font-size: 0.88rem;
  margin-bottom: 2rem;
}
.hero-lead .byline .author { color: var(--ink); font-weight: 600; }
.hero-lead .byline .dot { width: 3px; height: 3px; background: var(--ink-faint); border-radius: 50%; }
.hero-lead .byline .reading-time {
  font-family: var(--font-mono); font-size: 0.78rem; color: var(--gold);
}
html[lang="ar"] .hero-lead .byline .reading-time { font-family: var(--font-ar-body); font-size: 0.85rem; }

.hero-lead .hero-actions {
  display: flex; gap: 0.8rem; flex-wrap: wrap;
}

/* TL;DR card sits in the side column */
.tldr-card {
  background: var(--clay-deep);
  border: 1px solid var(--clay-line);
  position: relative;
}
.tldr-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--terracotta);
}
.tldr-card .head {
  padding: 1.2rem 1.4rem 0.9rem;
  border-bottom: 1px solid var(--clay-line);
}
.tldr-card .head .stamp {
  display: inline-flex; align-items: center; gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--terracotta);
  margin-bottom: 0.4rem;
}
html[lang="ar"] .tldr-card .head .stamp {
  font-family: var(--font-ar-body); letter-spacing: 0.04em; text-transform: none; font-size: 0.82rem; font-weight: 700;
}
.tldr-card .head h3 {
  font-family: var(--font-ar-display);
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--ink);
}
html[lang="en"] .tldr-card .head h3 {
  font-family: var(--font-en-display); font-weight: 600; font-style: italic; font-size: 1.4rem;
}
.tldr-card .head .sub {
  font-size: 0.82rem;
  color: var(--ink-faint);
  margin-top: 0.2rem;
  font-style: italic;
}
html[lang="ar"] .tldr-card .head .sub { font-style: normal; }

.tldr-card ol {
  list-style: none;
  padding: 1rem 1.4rem 1.4rem;
  margin: 0;
  counter-reset: tldr;
}
.tldr-card li {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.7rem;
  padding: 0.7rem 0;
  border-bottom: 1px dashed var(--clay-line);
  counter-increment: tldr;
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--ink-soft);
}
.tldr-card li:last-child { border-bottom: none; padding-bottom: 0; }
.tldr-card li::before {
  content: counter(tldr, decimal);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--gold);
  min-width: 1.4rem;
  letter-spacing: 0;
  padding-top: 0.15rem;
  border-top: 2px solid var(--gold);
  align-self: start;
}
html[lang="ar"] .tldr-card li {
  font-family: var(--font-ar-body); font-size: 1rem; line-height: 1.85;
}

/* ====== Article grid (homepage) ====== */
.section-band {
  padding: 4.5rem 2rem;
}
.section-band.alt { background: var(--clay-deep); }

.section-head {
  max-width: 1280px;
  margin: 0 auto 2.5rem;
  display: flex; align-items: end; justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}
.section-head h3 {
  font-family: var(--font-ar-display);
  font-size: var(--fs-h2);
  font-weight: 700;
  margin: 0;
  color: var(--ink);
  position: relative;
  padding-bottom: 0.6rem;
}
html[lang="en"] .section-head h3 {
  font-family: var(--font-en-display); font-weight: 500; font-style: italic;
}
.section-head h3::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0;
  width: 3rem; height: 2px;
  background: var(--gold);
}
[dir="rtl"] .section-head h3::after { left: auto; right: 0; }
.section-head .meta {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-faint);
}
html[lang="ar"] .section-head .meta {
  font-family: var(--font-ar-body); letter-spacing: 0.04em; text-transform: none; font-size: 0.85rem;
}

.article-grid {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
@media (max-width: 900px) {
  .article-grid { grid-template-columns: 1fr; }
}

.article-card {
  background: var(--clay);
  border: 1px solid var(--clay-line);
  padding: 1.6rem 1.6rem 1.2rem;
  display: flex; flex-direction: column;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  text-align: start;
}
.article-card:hover {
  border-color: var(--gold);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(27, 42, 74, 0.08);
}
.article-card .topic {
  display: flex; align-items: center; gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 0.9rem;
}
.article-card .topic::before {
  content: ''; width: 5px; height: 5px;
  background: var(--terracotta); transform: rotate(45deg);
}
html[lang="ar"] .article-card .topic {
  font-family: var(--font-ar-body); letter-spacing: 0.04em; text-transform: none; font-size: 0.82rem; font-weight: 600;
}

.article-card h4 {
  font-family: var(--font-ar-display);
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0 0 0.7rem;
  line-height: 1.3;
  color: var(--ink);
}
html[lang="en"] .article-card h4 {
  font-family: var(--font-en-display); font-weight: 600; font-size: 1.45rem; line-height: 1.2;
}

.article-card .excerpt {
  font-size: 0.95rem;
  color: var(--ink-soft);
  margin: 0 0 1rem;
  line-height: 1.6;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-card .tldr-peek {
  background: var(--clay-deep);
  border-left: 2px solid var(--terracotta);
  padding: 0.7rem 0.9rem;
  font-size: 0.82rem;
  color: var(--ink-soft);
  line-height: 1.5;
  margin-bottom: 1rem;
  position: relative;
  font-style: italic;
}
[dir="rtl"] .article-card .tldr-peek {
  border-left: none;
  border-right: 2px solid var(--terracotta);
}
html[lang="ar"] .article-card .tldr-peek { font-style: normal; font-size: 0.92rem; }

.article-card .tldr-peek .label {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--terracotta);
  margin-bottom: 0.3rem;
  font-style: normal;
  font-weight: 600;
}
html[lang="ar"] .article-card .tldr-peek .label {
  font-family: var(--font-ar-body); letter-spacing: 0.03em; text-transform: none; font-size: 0.74rem;
}

.article-card .meta {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 0.9rem;
  border-top: 1px solid var(--clay-line);
  font-size: 0.78rem;
  color: var(--ink-faint);
}
.article-card .meta .author { color: var(--ink-soft); font-weight: 500; }
.article-card .meta .reading-time {
  font-family: var(--font-mono); font-size: 0.72rem; color: var(--gold);
}
html[lang="ar"] .article-card .meta .reading-time { font-family: var(--font-ar-body); font-size: 0.82rem; }

/* Featured / lead variant */
.article-card.featured {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  padding: 0;
  background: var(--ink);
  color: var(--clay);
  border: none;
}
@media (max-width: 900px) { .article-card.featured { grid-template-columns: 1fr; } }
.article-card.featured:hover {
  border: none;
  box-shadow: 0 12px 32px rgba(27,42,74,0.18);
}
.article-card.featured .lead-meta {
  background: var(--terracotta);
  color: var(--clay);
  padding: 2rem;
  display: flex; flex-direction: column; justify-content: space-between;
  position: relative;
  overflow: hidden;
  min-height: 260px;
}
.article-card.featured .lead-meta::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0, transparent 40%),
    repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 8px);
  pointer-events: none;
}
.article-card.featured .lead-meta .stamp {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  position: relative; z-index: 1;
}
html[lang="ar"] .article-card.featured .lead-meta .stamp {
  font-family: var(--font-ar-body); letter-spacing: 0.04em; text-transform: none; font-size: 0.85rem;
}
.article-card.featured .lead-meta .pull {
  font-family: var(--font-ar-display);
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.3;
  margin: 1.5rem 0;
  position: relative; z-index: 1;
}
html[lang="en"] .article-card.featured .lead-meta .pull {
  font-family: var(--font-en-display); font-weight: 500; font-style: italic; font-size: 1.7rem;
}
.article-card.featured .lead-meta .attr {
  font-family: var(--font-mono); font-size: 0.75rem;
  color: rgba(250,250,246,0.7);
  position: relative; z-index: 1;
}
html[lang="ar"] .article-card.featured .lead-meta .attr {
  font-family: var(--font-ar-body); font-size: 0.9rem;
}

.article-card.featured .lead-body { padding: 2rem; }
.article-card.featured .lead-body .topic { color: var(--gold-soft); }
.article-card.featured .lead-body h4 { color: var(--clay); font-size: 1.6rem; }
.article-card.featured .lead-body .excerpt { color: rgba(250,250,246,0.7); -webkit-line-clamp: 4; }
.article-card.featured .lead-body .meta { border-top-color: rgba(255,255,255,0.1); color: rgba(250,250,246,0.5); }
.article-card.featured .lead-body .meta .author { color: var(--clay); }

/* ====== Manifesto strip ====== */
.manifesto {
  background: var(--ink);
  color: var(--clay);
  padding: 5rem 2rem;
  position: relative;
  overflow: hidden;
}
.manifesto-inner {
  max-width: 880px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
}
.manifesto blockquote {
  font-family: var(--font-ar-display);
  font-size: clamp(1.5rem, 3vw, 2.4rem);
  line-height: 1.4;
  margin: 0 0 1.5rem;
  font-weight: 600;
}
html[lang="en"] .manifesto blockquote {
  font-family: var(--font-en-display); font-weight: 400; font-style: italic;
}
.manifesto cite {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--gold);
  font-style: normal;
}
html[lang="ar"] .manifesto cite {
  font-family: var(--font-ar-body); letter-spacing: 0.04em; text-transform: none; font-size: 0.95rem;
}

/* ====== Article reading page ====== */
.article-page { background: var(--clay); }

.article-bandeau {
  background: var(--clay-deep);
  border-bottom: 1px solid var(--clay-line);
  padding: 3rem 2rem 2.5rem;
}
.article-bandeau-inner {
  max-width: var(--col-wide);
  margin: 0 auto;
  text-align: center;
}
.article-bandeau .topic {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--terracotta);
  margin-bottom: 1rem;
}
html[lang="ar"] .article-bandeau .topic {
  font-family: var(--font-ar-body); letter-spacing: 0.05em; text-transform: none; font-size: 0.92rem; font-weight: 700;
}
.article-bandeau h1 {
  font-family: var(--font-ar-display);
  font-size: clamp(1.8rem, 4vw, 3.2rem);
  font-weight: 700;
  margin: 0 0 1.5rem;
  line-height: 1.2;
  color: var(--ink);
  letter-spacing: -0.01em;
}
html[lang="en"] .article-bandeau h1 {
  font-family: var(--font-en-display); font-weight: 500; font-style: italic; line-height: 1.1;
}
.article-bandeau .byline {
  display: flex; justify-content: center; align-items: center; gap: 1rem;
  font-size: 0.92rem; color: var(--ink-soft);
  flex-wrap: wrap;
}
.article-bandeau .byline .dot {
  width: 3px; height: 3px; background: var(--ink-faint); border-radius: 50%;
}
.article-bandeau .byline .author { color: var(--ink); font-weight: 600; }
.article-bandeau .byline .reading-time {
  font-family: var(--font-mono); font-size: 0.78rem; color: var(--gold);
}
html[lang="ar"] .article-bandeau .byline .reading-time { font-family: var(--font-ar-body); font-size: 0.88rem; }

.article-body-wrap {
  max-width: 1180px;
  margin: 0 auto;
  padding: 4rem 2rem 5rem;
  display: grid;
  grid-template-columns: 1fr minmax(0, 38rem) 1fr;
  gap: 2rem;
}
@media (max-width: 900px) {
  .article-body-wrap { grid-template-columns: 1fr; padding: 2.5rem 1.2rem 4rem; }
}

.article-body {
  grid-column: 2;
  font-size: var(--fs-body);
  line-height: 2;
  color: var(--ink);
}
html[lang="en"] .article-body { line-height: 1.75; }

.article-body p { margin: 0 0 1.5rem; }
.article-body p.lede {
  font-size: var(--fs-lede);
  color: var(--ink-soft);
  margin-bottom: 2rem;
}
html[lang="en"] .article-body p.lede {
  font-family: var(--font-en-display); font-style: italic; font-weight: 400;
}

.article-body h2 {
  font-family: var(--font-ar-display);
  font-size: 1.8rem;
  font-weight: 700;
  margin: 3rem 0 1.2rem;
  color: var(--ink);
}
html[lang="en"] .article-body h2 {
  font-family: var(--font-en-display); font-weight: 600; font-style: italic;
}

/* Margin notes — base styles (layout in float block below) */
.margin-note {
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--ink-soft);
  padding: 0.4rem 0;
  border-top: 1px solid var(--gold);
}
.margin-note .number {
  font-family: var(--font-mono);
  font-size: 1.6rem;
  color: var(--terracotta);
  font-weight: 600;
  display: block;
  margin: 0.4rem 0 0.2rem;
}
.margin-note .number .unit { font-size: 0.7rem; color: var(--ink-faint); margin-left: 0.2rem; }
.margin-note .label {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gold);
  display: block;
  margin-bottom: 0.4rem;
}
html[lang="ar"] .margin-note .label {
  font-family: var(--font-ar-body); letter-spacing: 0.03em; text-transform: none; font-size: 0.78rem; font-weight: 700;
}
html[lang="ar"] .margin-note { font-size: 0.92rem; line-height: 1.7; }

/* Margin notes sit BESIDE their paragraph, floated into the article gutter.
   The .article-body is grid-column:2 in the wrap, so floats poke into the
   reading column. We push them out using negative margins into the wrap's
   side gutters and clear between consecutive notes so they don't pile up. */
.margin-note {
  float: right;
  width: 13rem;
  margin: 0.4rem -15rem 1.2rem 1.2rem;  /* push into right gutter */
  padding: 0;
  border-top: 1px solid var(--gold);
  padding-top: 0.6rem;
  position: static;
  clear: right;
}
.margin-left {
  float: left;
  margin: 0.4rem 1.2rem 1.2rem -15rem;  /* push into left gutter */
  clear: left;
}
.margin-right { float: right; clear: right; }
[dir="rtl"] .margin-left { float: right; clear: right; margin: 0.4rem -15rem 1.2rem 1.2rem; }
[dir="rtl"] .margin-right { float: left; clear: left; margin: 0.4rem 1.2rem 1.2rem -15rem; }
@media (max-width: 1100px) {
  /* On narrower viewports there's no gutter to push notes into — inline them */
  .margin-note,
  .margin-left,
  .margin-right,
  [dir="rtl"] .margin-left,
  [dir="rtl"] .margin-right {
    float: none;
    width: auto;
    margin: 1.2rem 0;
    clear: both;
  }
}

/* Big stat section break */
.stat-break {
  grid-column: 1 / -1;
  margin: 3rem 0;
  padding: 3rem 2rem;
  background: var(--clay-deep);
  border-top: 1px solid var(--gold);
  border-bottom: 1px solid var(--gold);
  text-align: center;
  position: relative;
}
.stat-break .label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--gold);
  display: block;
  margin-bottom: 1rem;
}
html[lang="ar"] .stat-break .label {
  font-family: var(--font-ar-body); letter-spacing: 0.04em; text-transform: none; font-size: 0.95rem; font-weight: 700;
}
.stat-break .figure {
  font-family: var(--font-mono);
  font-size: clamp(3.5rem, 8vw, 6rem);
  color: var(--terracotta);
  font-weight: 600;
  line-height: 1;
  margin: 0 0 1rem;
  letter-spacing: -0.02em;
}
.stat-break .desc {
  font-family: var(--font-ar-display);
  font-size: 1.2rem;
  color: var(--ink);
  max-width: 36rem;
  margin: 0 auto;
  line-height: 1.5;
}
html[lang="en"] .stat-break .desc {
  font-family: var(--font-en-display); font-style: italic; font-weight: 500;
}

/* Pull quote */
.pull-quote {
  grid-column: 1 / -1;
  margin: 3rem auto;
  max-width: 50rem;
  padding: 2rem 0;
  border-top: 1px solid var(--gold);
  border-bottom: 1px solid var(--gold);
  text-align: center;
}
.pull-quote q {
  font-family: var(--font-ar-display);
  font-size: 1.6rem;
  line-height: 1.45;
  color: var(--ink);
  font-weight: 600;
  quotes: none;
}
html[lang="en"] .pull-quote q {
  font-family: var(--font-en-display); font-weight: 500; font-style: italic;
}
.pull-quote q::before, .pull-quote q::after { content: none; }

/* TL;DR — full width inside article */
.tldr-block {
  background: var(--clay-deep);
  border: 1px solid var(--clay-line);
  padding: 0;
  margin: 2.5rem 0 3rem;
  position: relative;
}
.tldr-block::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 4px;
  background: linear-gradient(to right, var(--terracotta) 33%, var(--gold) 33% 66%, var(--ink) 66%);
}
.tldr-block .tldr-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.4rem 1.6rem;
  cursor: pointer;
  border-bottom: 1px solid var(--clay-line);
  background: none;
  border: none;
  width: 100%;
  text-align: start;
  font: inherit;
  color: inherit;
}
.tldr-block .tldr-head:hover { background: rgba(184,146,58,0.04); }
.tldr-block .tldr-head .left { display: flex; align-items: center; gap: 0.9rem; }
.tldr-block .tldr-head .stamp {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--terracotta);
  font-weight: 600;
}
html[lang="ar"] .tldr-block .tldr-head .stamp {
  font-family: var(--font-ar-body); letter-spacing: 0.04em; text-transform: none; font-size: 0.85rem;
}
.tldr-block .tldr-head h3 {
  font-family: var(--font-ar-display);
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0.15rem 0 0;
  color: var(--ink);
}
html[lang="en"] .tldr-block .tldr-head h3 {
  font-family: var(--font-en-display); font-weight: 600; font-style: italic; font-size: 1.55rem;
}
.tldr-block .tldr-head .sub {
  font-size: 0.82rem; color: var(--ink-faint); font-style: italic;
}
html[lang="ar"] .tldr-block .tldr-head .sub { font-style: normal; }
.tldr-block .tldr-head .toggle {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gold);
  display: flex; align-items: center; gap: 0.4rem;
}
html[lang="ar"] .tldr-block .tldr-head .toggle {
  font-family: var(--font-ar-body); letter-spacing: 0.04em; text-transform: none; font-size: 0.88rem;
}
.tldr-block .tldr-head .toggle .arrow { transition: transform 0.2s; }
.tldr-block.collapsed .tldr-head .toggle .arrow { transform: rotate(-90deg); }
[dir="rtl"] .tldr-block.collapsed .tldr-head .toggle .arrow { transform: rotate(90deg); }
.tldr-block ol {
  list-style: none;
  margin: 0; padding: 1.4rem 1.6rem;
  counter-reset: tl;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 2rem;
}
@media (max-width: 700px) { .tldr-block ol { grid-template-columns: 1fr; } }
.tldr-block li {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.8rem;
  padding: 0.6rem 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--ink-soft);
  counter-increment: tl;
}
.tldr-block li::before {
  content: counter(tl, decimal);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--gold);
  padding-top: 0.4rem;
  border-top: 2px solid var(--gold);
  min-width: 1.2rem;
  align-self: start;
}
html[lang="ar"] .tldr-block li {
  font-family: var(--font-ar-body); font-size: 1rem; line-height: 1.85;
}
.tldr-block.collapsed ol { display: none; }

/* Author block */
.author-block {
  max-width: var(--col-narrow);
  margin: 4rem auto 0;
  padding: 2rem 0;
  border-top: 1px solid var(--clay-line);
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 1.4rem;
  align-items: start;
}
.author-block .avatar {
  width: 64px; height: 64px;
  background: var(--ink);
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.author-block .avatar::after {
  content: '';
  position: absolute;
  inset: -3px;
  border: 1px solid var(--gold);
  z-index: -1;
}
.author-block .avatar svg { color: var(--gold); width: 32px; }
.author-block .name {
  font-family: var(--font-ar-display);
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.4rem;
  color: var(--ink);
}
html[lang="en"] .author-block .name { font-family: var(--font-en-display); font-weight: 600; font-style: italic; }
.author-block .bio {
  font-size: 0.92rem; color: var(--ink-soft); line-height: 1.6; margin: 0;
}

/* Comments */
.comments {
  max-width: var(--col-narrow);
  margin: 4rem auto 0;
  padding: 2rem 0 0;
  border-top: 1px solid var(--clay-line);
}
.comments h3 {
  font-family: var(--font-ar-display);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.6rem;
  color: var(--ink);
}
html[lang="en"] .comments h3 { font-family: var(--font-en-display); font-weight: 600; font-style: italic; }
.comments h3 .count { color: var(--ink-faint); font-weight: 400; font-size: 1rem; margin-inline-start: 0.6rem; }

.comment {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 1rem;
  padding: 1.2rem 0;
  border-bottom: 1px solid var(--clay-line);
}
.comment:last-child { border-bottom: none; }
.comment .avatar {
  width: 36px; height: 36px;
  background: var(--clay-deep);
  border: 1px solid var(--clay-line);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 0.85rem; color: var(--ink-soft);
  font-weight: 600;
}
html[lang="ar"] .comment .avatar { font-family: var(--font-ar-display); }
.comment .head {
  display: flex; gap: 0.8rem; align-items: baseline;
  margin-bottom: 0.3rem;
  font-size: 0.85rem;
}
.comment .head .name { color: var(--ink); font-weight: 600; }
.comment .head time { color: var(--ink-faint); font-family: var(--font-mono); font-size: 0.75rem; }
html[lang="ar"] .comment .head time { font-family: var(--font-ar-body); font-size: 0.82rem; }
.comment .body { font-size: 0.95rem; line-height: 1.6; color: var(--ink-soft); }
html[lang="ar"] .comment .body { line-height: 1.85; }

.comment-form {
  margin-top: 1.6rem;
  padding-top: 1.6rem;
  border-top: 1px solid var(--clay-line);
}
.comment-form label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-soft);
  display: block;
  margin-bottom: 0.5rem;
}
html[lang="ar"] .comment-form label {
  font-family: var(--font-ar-body); letter-spacing: 0.04em; text-transform: none; font-size: 0.88rem; font-weight: 600;
}
.comment-form textarea {
  width: 100%;
  background: var(--clay);
  border: 1px solid var(--clay-line);
  padding: 0.9rem 1rem;
  font: inherit;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--ink);
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s;
}
.comment-form textarea:focus {
  outline: none;
  border-color: var(--gold);
}
.comment-form .footer {
  margin-top: 0.7rem;
  display: flex; justify-content: space-between; align-items: center;
  font-size: 0.78rem; color: var(--ink-faint);
}
.comment-form .toast {
  color: var(--terracotta); font-style: italic;
}

/* ====== Footer ====== */
.footer {
  background: var(--ink);
  color: rgba(250,250,246,0.6);
  padding: 4rem 2rem 2rem;
  margin-top: 0;
}
.footer-inner { max-width: 1280px; margin: 0 auto; }
.footer .credo {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.footer .credo .mark {
  font-family: var(--font-ar-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gold);
  margin: 0 0 0.4rem;
}
html[lang="en"] .footer .credo .mark { font-family: var(--font-en-display); font-style: italic; font-weight: 500; }
.footer .credo .sub { font-size: 0.85rem; }
.footer .cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;
}
@media (max-width: 700px) { .footer .cols { grid-template-columns: 1fr; } }
.footer h5 {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--gold);
  margin: 0 0 1rem;
  font-weight: 500;
}
html[lang="ar"] .footer h5 {
  font-family: var(--font-ar-body); letter-spacing: 0.04em; text-transform: none; font-size: 0.88rem; font-weight: 700;
}
.footer p, .footer a {
  font-size: 0.88rem;
  line-height: 1.7;
  color: rgba(250,250,246,0.55);
}
.footer a { display: block; text-decoration: none; transition: color 0.2s; }
.footer a:hover { color: var(--clay); }
.footer .colophon-line {
  margin-top: 3rem;
  padding-top: 1.6rem;
  border-top: 1px solid rgba(255,255,255,0.08);
  text-align: center;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  color: rgba(250,250,246,0.3);
}
html[lang="ar"] .footer .colophon-line {
  font-family: var(--font-ar-body); letter-spacing: 0.03em; text-transform: none; font-size: 0.82rem;
}

/* Issue listing — alt section, prints layout */
.archive-strip {
  max-width: 1280px; margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
  border-top: 1px solid var(--clay-line);
}
@media (max-width: 700px) { .archive-strip { grid-template-columns: 1fr; } }
.archive-row {
  display: grid;
  grid-template-columns: 90px 1fr auto;
  gap: 1.5rem;
  align-items: center;
  padding: 1.4rem 1.6rem;
  border-bottom: 1px solid var(--clay-line);
  cursor: pointer;
  transition: background 0.2s;
  text-align: start;
  background: none;
  border-right: none;
  border-left: none;
  border-top: none;
  width: 100%;
  font: inherit;
  color: inherit;
}
.archive-row:nth-child(odd) { border-right: 1px solid var(--clay-line); }
[dir="rtl"] .archive-row:nth-child(odd) { border-right: none; border-left: 1px solid var(--clay-line); }
.archive-row:hover { background: var(--clay-deep); }
.archive-row .date {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--gold);
  letter-spacing: 0.06em;
}
html[lang="ar"] .archive-row .date { font-family: var(--font-ar-body); font-size: 0.85rem; }
.archive-row .title {
  font-family: var(--font-ar-display);
  font-size: 1.05rem;
  color: var(--ink);
  font-weight: 700;
  line-height: 1.4;
}
html[lang="en"] .archive-row .title { font-family: var(--font-en-display); font-weight: 600; }
.archive-row .topic {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-faint);
  white-space: nowrap;
}
html[lang="ar"] .archive-row .topic {
  font-family: var(--font-ar-body); letter-spacing: 0.03em; text-transform: none; font-size: 0.82rem;
}

/* Toast for "you posted a comment" */
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
.toast-row { animation: fadeIn 0.4s ease-out; }


/* ==========================================================
   COVER — full-bleed opening splash, like a print-issue board
   ========================================================== */

.cover {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: #0E1730;            /* deeper than --ink — like ink on cloth */
  color: var(--clay);
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr auto;
  z-index: 100;
  /* paper grain */
  background-image:
    radial-gradient(ellipse at center, rgba(184,146,58,0.06) 0%, transparent 60%),
    radial-gradient(ellipse at top left, rgba(255,255,255,0.04) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(0,0,0,0.4) 0%, transparent 60%);
}

/* Mesopotamian watermark — large rosettes scaled up, brass on ink, screen-blended */
.cover-tessellation {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240' width='240' height='240'><g fill='none' stroke='%23B8923A' stroke-width='0.7' opacity='0.55'><g transform='translate(120 120)'><circle r='4'/><circle r='14'/><circle r='34'/><g><ellipse cx='0' cy='-23' rx='6' ry='20'/><ellipse cx='0' cy='-23' rx='6' ry='20' transform='rotate(45)'/><ellipse cx='0' cy='-23' rx='6' ry='20' transform='rotate(90)'/><ellipse cx='0' cy='-23' rx='6' ry='20' transform='rotate(135)'/><ellipse cx='0' cy='-23' rx='6' ry='20' transform='rotate(180)'/><ellipse cx='0' cy='-23' rx='6' ry='20' transform='rotate(225)'/><ellipse cx='0' cy='-23' rx='6' ry='20' transform='rotate(270)'/><ellipse cx='0' cy='-23' rx='6' ry='20' transform='rotate(315)'/></g><g stroke-width='0.5' opacity='0.65'><line x1='0' y1='-34' x2='0' y2='-50'/><line x1='0' y1='34' x2='0' y2='50'/><line x1='-34' y1='0' x2='-50' y2='0'/><line x1='34' y1='0' x2='50' y2='0'/><line x1='-24' y1='-24' x2='-35.4' y2='-35.4'/><line x1='24' y1='-24' x2='35.4' y2='-35.4'/><line x1='-24' y1='24' x2='-35.4' y2='35.4'/><line x1='24' y1='24' x2='35.4' y2='35.4'/></g></g></g></svg>"),
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120' width='120' height='120'><g fill='%23B8923A' opacity='0.18'><path d='M12 18 L21 21 L12 24 Z'/><path d='M24 18 L33 21 L24 24 Z'/><path d='M12 30 L21 33 L12 36 Z'/><path d='M87 84 L96 87 L87 90 Z'/><path d='M99 84 L108 87 L99 90 Z'/><path d='M87 96 L96 99 L87 102 Z'/></g></svg>");
  background-size: 240px 240px, 120px 120px;
  background-position: center, 60px 60px;
  opacity: 0.5;
  mix-blend-mode: screen;
}

/* Top + bottom registers — thin brass rules with stamp/CTA */
.cover-register {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 2rem 4rem;
  position: relative;
  z-index: 2;
}
.cover-register .rule {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--gold) 20%, var(--gold) 80%, transparent);
  opacity: 0.55;
}
.cover-register .stamp {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--gold);
  white-space: nowrap;
}

/* Left/right vertical rails */
.cover-rail {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--gold);
  opacity: 0.7;
  writing-mode: vertical-rl;
  z-index: 2;
}
.cover-rail.left { left: 2rem; }
.cover-rail.right { right: 2rem; writing-mode: vertical-lr; }
.cover-rail .diamond {
  writing-mode: horizontal-tb;
  font-size: 0.5rem;
  opacity: 0.6;
}
[dir="rtl"] .cover-rail.right { font-family: var(--font-ar-mono, var(--font-mono)); letter-spacing: 0.18em; }

/* Center stack */
.cover-center {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 4rem;
  gap: 0;
}

.cover-crest {
  color: var(--gold);
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 2px 8px rgba(184,146,58,0.25));
}

.cover-wordmark {
  font-family: var(--font-ar-display);
  font-size: clamp(5rem, 14vw, 11rem);
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.01em;
  margin: 0;
  color: var(--gold);
  text-shadow: 0 2px 24px rgba(184,146,58,0.18);
}
[lang="en"] .cover-wordmark {
  font-family: var(--font-en-display);
  font-style: italic;
  font-weight: 500;
  font-size: clamp(4.5rem, 12vw, 9.5rem);
  letter-spacing: -0.02em;
}

.cover-translit {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  letter-spacing: 0.5em;
  text-transform: uppercase;
  color: var(--gold);
  opacity: 0.65;
  margin-top: 0.8rem;
  padding-inline-start: 0.5em;
}
[lang="ar"] .cover-translit {
  font-family: var(--font-mono);
  letter-spacing: 0.6em;
}

.cover-divider {
  color: var(--gold);
  margin: 1.6rem 0 1.4rem;
  opacity: 0.7;
}

.cover-tagline {
  font-family: var(--font-ar-display);
  font-size: 1.2rem;
  font-weight: 400;
  color: var(--clay);
  opacity: 0.78;
  max-width: 32rem;
  line-height: 1.5;
  margin: 0 0 3rem;
}
[lang="en"] .cover-tagline {
  font-family: var(--font-en-display);
  font-style: italic;
  font-size: 1.25rem;
}

.cover-feature {
  border-block: 1px solid rgba(184,146,58,0.3);
  padding: 1.6rem 2rem;
  max-width: 44rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  position: relative;
}
.cover-feature::before,
.cover-feature::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  background: var(--gold);
  rotate: 45deg;
  opacity: 0.6;
}
.cover-feature::before { top: -3.5px; }
.cover-feature::after  { bottom: -3.5px; }

.cover-feature .kicker {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--gold);
  opacity: 0.85;
}
.cover-feature h2 {
  font-family: var(--font-ar-display);
  font-size: 1.55rem;
  font-weight: 700;
  line-height: 1.4;
  margin: 0;
  color: var(--clay);
  cursor: pointer;
  transition: color 0.2s;
}
.cover-feature h2:hover { color: var(--gold-soft); }
[lang="en"] .cover-feature h2 {
  font-family: var(--font-en-display);
  font-style: italic;
  font-weight: 500;
}
.cover-feature .byline {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--gold);
  opacity: 0.75;
}

/* Bottom CTA — "open the issue" */
.cover-open {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.6rem 1.2rem;
  margin: 0 auto;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--gold);
  transition: color 0.2s, gap 0.3s;
}
.cover-open:hover { color: var(--gold-soft); gap: 1.6rem; }
.cover-open .line {
  width: 56px;
  height: 1px;
  background: currentColor;
  opacity: 0.5;
}
.cover-open .arrow {
  font-size: 1rem;
  letter-spacing: 0;
  animation: cover-bob 2.4s ease-in-out infinite;
}
@keyframes cover-bob {
  0%, 100% { transform: translateY(0); opacity: 0.7; }
  50% { transform: translateY(4px); opacity: 1; }
}

/* Hide tweaks panel chrome from intruding on the cover */
.cover ~ * .tweaks-panel { z-index: 200; }

/* Responsive */
@media (max-width: 900px) {
  .cover-rail { display: none; }
  .cover-register { padding: 1.5rem 2rem; }
  .cover-center { padding: 0 2rem; }
  .cover-feature { padding: 1.2rem 1rem; }
}

```

---

### `data.js`

```js
// Sample article data — bilingual, with TL;DR + margin stats + section breaks
window.ARTICLES = [
  {
    slug: 'muwazanat-2025',
    topic_ar: 'السياسة الاقتصادية',
    topic_en: 'Economic Policy',
    title_ar: 'الموازنة العراقية 2025: وهم الإصلاح وحقيقة الاتكاء على النفط',
    title_en: 'The Iraqi Budget 2025: The Illusion of Reform',
    excerpt_ar: 'قراءة نقدية في بنية الموازنة الاتحادية لعام 2025 وما تكشفه من استمرار الاعتماد الهيكلي على النفط وغياب إرادة الإصلاح الحقيقي.',
    excerpt_en: 'A critical reading of the 2025 federal budget and what it reveals about structural oil dependency and the absence of reform.',
    author_ar: 'طارق الراشد',
    author_en: 'Tariq Al-Rashid',
    date: '2026-04-15',
    minutes: 9,
    featured: true,
    pull_ar: 'الدولة الريعية لا تصلح نفسها من تلقاء ذاتها.',
    pull_en: 'The rentier state does not reform itself.',
    tldr_ar: [
      '٩٣٪ من الإيرادات تأتي من النفط — والحكومة تعِد بالتنويع منذ عقدين',
      'أكثر من ٤ ملايين موظف حكومي، والقطاع الخاص يساهم بأقل من ٤٪ في الناتج المحلي',
      'الفساد يبتلع المليارات من العقود الحكومية قبل أن تُبنى مدرسة واحدة',
      'الإصلاح الحقيقي يحتاج ضريبة وإرادة سياسية — وكلاهما في إجازة',
      'الخلاصة: وثيقة محاصصة، لا خطة تنمية',
    ],
    tldr_en: [
      '93% of revenues are oil money. Diversification promised for two decades.',
      '4M+ public sector workers. Private sector under 4% of GDP. Math doesn\u2019t work.',
      'Corruption swallows billions in contracts before a school gets built.',
      'Real reform needs tax + political will. Both on indefinite leave.',
      'Bottom line: a power-sharing document dressed as a budget.',
    ],
    body_ar: [
      { type: 'lede', text: 'حين صادق مجلس النواب العراقي على الموازنة الاتحادية لعام 2025 في أواخر عام 2024، كان الخطاب الرسمي يتحدث عن "مرحلة جديدة" من التنويع الاقتصادي. غير أن قراءة متأنية للأرقام تكشف عن حقيقة مغايرة تماماً.' },
      { type: 'p', text: 'ما يزيد على 93% من الإيرادات المتوقعة مصدرها النفط الخام، وهي نسبة لم تتغير جوهرياً منذ عقود. المشكلة ليست في الرقم وحده، بل في الأنماط البنيوية التي يعكسها. فالقطاع الخاص غير النفطي يساهم بأقل من 4% في الناتج المحلي الإجمالي، فيما يستوعب القطاع الحكومي أكثر من أربعة ملايين موظف.', margin: { side: 'right', label: 'حصة النفط', number: '٩٣٪', unit: 'من الإيرادات', note: 'موازنة 2025 الاتحادية — مكتب رئاسة الوزراء' } },
      { type: 'p', text: 'وحين يهبط سعر النفط إلى ما دون خمسة وستين دولاراً للبرميل، يجد العراق نفسه وجهاً لوجه أمام عجز مالي هيكلي لا مفر منه. هذه ليست أزمة عابرة — إنها هندسة اقتصادية مصممة للانهيار عند أول صدمة سعرية.', margin: { side: 'left', label: 'سعر التعادل', number: '$65', unit: 'للبرميل', note: 'الحد الأدنى لتوازن الموازنة' } },
      { type: 'stat', label: 'القطاع الخاص', figure: '< ٤٪', desc: 'مساهمة القطاع الخاص غير النفطي في الناتج المحلي الإجمالي. اقتصاد بلا قطاع خاص ليس اقتصاداً.' },
      { type: 'h2', text: 'ما يغيب أهم مما يحضر' },
      { type: 'p', text: 'لا ترى في الموازنة رؤية متكاملة لتطوير البنية التحتية الصناعية، ولا استراتيجية واضحة لتحفيز الاستثمار الخاص في الزراعة والتصنيع والتقنية. ثمة مخصصات للمشاريع، نعم — لكنها تتوزع وفق منطق المحاصصة السياسية والجغرافية، لا وفق أولويات التنمية الاقتصادية المستدامة.' },
      { type: 'pull', text: 'الدولة الريعية لا تصلح نفسها من تلقاء ذاتها.' },
      { type: 'p', text: 'منطق توزيع ريع النفط — الذي يمنح الحكومة شرعيتها عبر رواتب القطاع العام والدعومات لا عبر الكفاءة والإنتاج — يُفرز نخباً سياسية لا مصلحة لها في بناء اقتصاد حقيقي منتج. لأن الاقتصاد الحقيقي يستوجب محاسبة حقيقية، وهو ما تتجنبه منظومة الحكم الراهنة.', margin: { side: 'right', label: 'موظفو القطاع العام', number: '٤+', unit: 'مليون موظف', note: 'مقابل أقل من 600 ألف في القطاع الخاص الرسمي' } },
      { type: 'h2', text: 'الفساد بالأرقام' },
      { type: 'p', text: 'الفساد المؤسسي لا يزال يُجرف نسباً كبيرة من الإنفاق الحكومي قبل أن تصل إلى مستحقيها. التقارير الرقابية تشير إلى خسائر مالية ناجمة عن الفساد في المشتريات والعقود تُقدَّر بمليارات الدولارات سنوياً. ليست أرقاماً مجردة — إنها مدارس لم تُبنَ، ومستشفيات لم تُجهَّز، وشبكات مياه لم تُصلَح.' },
      { type: 'p', text: 'الإصلاح الذي يستحق هذا الاسم يبدأ من الضريبة لا من النفط: بناء منظومة ضريبية عادلة وفعّالة على الأرباح والثروات، وتحرير بيئة الأعمال من الروتين، وربط الإنفاق بمؤشرات الأداء. غير أن هذا يتطلب إرادة سياسية لم تتشكل بعد.' },
      { type: 'p', text: 'في المحصلة، موازنة 2025 ليست وثيقة تنمية — إنها وثيقة بقاء سياسي تُعيد توزيع ريع النفط بين المتنافسين على السلطة. وما لم تتغير هذه المعادلة البنيوية، سيبقى الحديث عن التنويع ترفاً خطابياً.' },
    ],
    body_en: [
      { type: 'lede', text: 'When Iraq\u2019s Council of Representatives ratified the 2025 federal budget in late 2024, the official narrative spoke of a "new phase" of diversification. A careful reading of the figures reveals a different reality.' },
      { type: 'p', text: 'Over 93% of projected revenues come from crude oil — a ratio that has not meaningfully changed in decades. The problem lies not in this figure alone, but in the structural patterns it reflects. The non-oil private sector contributes less than 4% to GDP, while the public sector employs more than four million civil servants.', margin: { side: 'right', label: 'Oil revenue share', number: '93%', unit: 'of total', note: 'Federal Budget 2025, PM Office' } },
      { type: 'p', text: 'When oil falls below sixty-five dollars a barrel, Iraq faces structural fiscal deficit with no exit. This is not a passing crisis — it is economic engineering designed to collapse at the first price shock.', margin: { side: 'left', label: 'Break-even', number: '$65', unit: 'per barrel', note: 'Minimum for budget balance' } },
      { type: 'stat', label: 'Private sector', figure: '< 4%', desc: 'Non-oil private sector contribution to GDP. An economy without a private sector is not an economy.' },
      { type: 'h2', text: 'What is absent matters most' },
      { type: 'p', text: 'There is no coherent vision for industrial infrastructure, no clear strategy for private investment in agriculture, manufacturing, or technology. There are project allocations — but distributed by the logic of political and geographic power-sharing, not sustainable development.' },
      { type: 'pull', text: 'The rentier state does not reform itself.' },
      { type: 'p', text: 'The logic of distributing oil rents — granting the government legitimacy through public-sector salaries and subsidies rather than efficiency and production — produces political elites with no interest in building a productive economy. Because real economies demand real accountability, which the current system avoids.', margin: { side: 'right', label: 'Public sector', number: '4M+', unit: 'employees', note: 'vs. <600K in formal private sector' } },
      { type: 'h2', text: 'Corruption by the numbers' },
      { type: 'p', text: 'Institutional corruption continues to drain significant portions of government spending before it reaches its beneficiaries. Oversight reports cite losses estimated at billions annually. These are not abstract numbers — they are schools not built, hospitals not equipped, water networks not repaired.' },
      { type: 'p', text: 'Reform worthy of the name begins with taxation, not oil: building a fair tax system on profits and wealth, liberating business from bureaucracy, and linking spending to measurable outcomes. This requires political will that has yet to materialize.' },
      { type: 'p', text: 'In sum, the 2025 budget is not a development document — it is a political survival document redistributing oil rents among those competing for power. Until this equation changes, talk of diversification will remain rhetorical luxury.' },
    ],
  },
  {
    slug: 'kahraba-baghdad',
    topic_ar: 'البنية التحتية',
    topic_en: 'Infrastructure',
    title_ar: 'الكهرباء في بغداد: عشرون سنة من الوعود وانقطاع لا يُحلّ',
    title_en: 'Baghdad Electricity: Twenty Years of Promises, Outages That Won\u2019t End',
    excerpt_ar: 'لماذا تنفق الحكومة العراقية مليارات الدولارات على قطاع الكهرباء وتبقى المنظومة الوطنية عاجزة عن تلبية الطلب؟',
    excerpt_en: 'Why does the Iraqi government spend billions on electricity while the national grid still fails to meet demand?',
    author_ar: 'طارق الراشد',
    author_en: 'Tariq Al-Rashid',
    date: '2026-03-22',
    minutes: 7,
    pull_ar: 'الكهرباء عندنا ليست مشكلة هندسية — هي مشكلة سياسية ترتدي بزة المهندس.',
    pull_en: 'Our electricity is not an engineering problem. It is a political problem in an engineer\u2019s uniform.',
    tldr_ar: [
      'أُنفق أكثر من ٨٠ مليار دولار على القطاع منذ ٢٠٠٣ — والمولّدات الخاصة لا تزال تعمل',
      'العجز في الذروة الصيفية يبلغ ٨ آلاف ميغاواط — أي مدينة كاملة بلا تيار',
      'الفقد في الشبكة يتجاوز ٤٠٪ — نصفه فني، نصفه سرقة منظَّمة',
      'العقود تمر عبر سبع طبقات من الوسطاء قبل أن تصل إلى المهندس',
      'الخلاصة: المشكلة ليست في الكهرباء، بل في من يستفيد من بقائها معطوبة',
    ],
    tldr_en: [
      'Over $80B spent on the sector since 2003 — private generators still hum.',
      'Peak summer gap: 8,000 MW. An entire city, dark.',
      'Grid losses exceed 40% — half technical, half organized theft.',
      'Contracts pass through seven layers of intermediaries before reaching the engineer.',
      'Bottom line: the problem isn\u2019t electricity. It\u2019s who profits from it being broken.',
    ],
    body_ar: [
      { type: 'lede', text: 'في صيف ٢٠٢٣، حين تجاوزت الحرارة في بغداد خمسين درجة مئوية، كانت العائلات تتناوب على النوم أمام مولّدات الحي. لم يكن هذا مشهداً استثنائياً — بل المشهد الافتراضي منذ عقدين. خلال هذه العقود، أُنفق على قطاع الكهرباء ما يفوق ثمانين مليار دولار. والسؤال ليس "أين ذهب المال؟" — السؤال هو: لماذا يستمر النظام في الفشل بنفس الطريقة كل عام؟' },
      { type: 'p', text: 'الإجابة الرسمية معتادة: نقص الغاز، الإرهاب، الطقس، ارتفاع الطلب. كلها صحيحة جزئياً. وكلها تتجنب القلب: الكهرباء في العراق لم تُصمَّم لتعمل — صُمِّمت لتُموَّل. كل أزمة طاقة هي مناقصة جديدة، وكل مناقصة هي عمولة، وكل عمولة هي شريحة من شبكة سياسية تحتاج التغذية.', margin: { side: 'right', label: 'الإنفاق التراكمي', number: '$80+', unit: 'مليار', note: 'وزارة الكهرباء، تقديرات تراكمية ٢٠٠٣–٢٠٢٤' } },
      { type: 'p', text: 'انظر إلى الفجوة بين العرض والطلب في ذروة الصيف: تصل إلى ثمانية آلاف ميغاواط. هذا ليس عجزاً — هذا حجم مدينة عراقية متوسطة بلا كهرباء على الإطلاق. والحلول الفنية لها معروفة منذ خمسة عشر عاماً: محطات دورة مركبة بكفاءة عالية، شبكة نقل جهد فائق العالي، نظام عدّاد ذكي يُنهي السرقة، استثمار جدي في الطاقة الشمسية حيث الشمس مجانية تسعة أشهر في السنة.', margin: { side: 'left', label: 'فجوة الذروة', number: '٨,٠٠٠', unit: 'ميغاواط', note: 'صيف ٢٠٢٣ — تقرير الشبكة الوطنية' } },
      { type: 'stat', label: 'الفقد في الشبكة', figure: '> ٤٠٪', desc: 'نصفه فقد فني بسبب شبكة متهالكة، نصفه سرقة وتعليق غير قانوني. في الدول المماثلة لا يتجاوز ١٢٪.' },
      { type: 'h2', text: 'هندسة الفشل المنظَّم' },
      { type: 'p', text: 'لنأخذ عقداً نموذجياً: محطة توليد بقدرة خمسمئة ميغاواط، قيمتها التعاقدية حوالي ٧٥٠ مليون دولار. تخرج الكلفة الفعلية للبناء أقل بكثير — ربما خمسمئة مليون. الفارق لا يختفي. يتوزع عبر سلسلة من المقاولين الثانويين، الوكلاء المحليين، الشركاء "المطلوبين" بحكم العرف السياسي، والاستشاريين الذين لا يستشيرون شيئاً.', margin: { side: 'right', label: 'طبقات الوسطاء', number: '٧', unit: 'في عقد واحد', note: 'مراجعة لعقد محطة توليد نموذجي ٢٠٢١' } },
      { type: 'pull', text: 'الكهرباء عندنا ليست مشكلة هندسية — هي مشكلة سياسية ترتدي بزة المهندس.' },
      { type: 'p', text: 'حين تنتهي المحطة من البناء — متأخرة بسنتين عن الموعد المتعاقَد عليه — تكتشف الوزارة أن خط الغاز الذي يفترض أن يغذيها لم يُمدَّ. لماذا؟ لأن عقد خط الغاز كان مع وزارة أخرى، تتحكم بها كتلة سياسية أخرى، لم تُحسَم حصصها بعد. تنتظر المحطة الجديدة شهوراً، ثم سنوات. وحين تشتغل، تشتغل بكفاءة نصف المعلَنة لأن المعدات وصلت ناقصة.' },
      { type: 'h2', text: 'لماذا تنجح المولّدة، ويفشل النظام؟' },
      { type: 'p', text: 'لاحظ الآن المفارقة: مولّدة الحي — تلك التي يديرها شاب من البلد، بدون شهادة هندسية، بدون عقود حكومية — تعمل. تعمل سنة كاملة. صاحبها يصلحها بنفسه، يشتري وقودها من السوق، يحصِّل ثمنها من الجيران بالكاش. الاقتصاد بسيط: خدمة، ثمن، مسؤولية مباشرة. لا وسطاء، لا محاصصة.', margin: { side: 'left', label: 'المولّدات الخاصة', number: '٢.٥+', unit: 'مليون مشترك', note: 'تقدير غير رسمي — اتحاد جمعيات أصحاب المولّدات' } },
      { type: 'p', text: 'هذه ليست دعوة إلى الخصخصة الكاملة — فالكهرباء سلعة استراتيجية لا يجوز تركها لمنطق السوق وحده. لكنها مرآة. تقول لنا إن المشكلة ليست في إمكانية تشغيل خدمة كهرباء في العراق. المشكلة في النموذج الإداري الذي يُصرّ عليه النظام السياسي لأن أي بديل يهدِّد منظومة الريع.' },
      { type: 'h2', text: 'ما الذي يلزم فعلاً' },
      { type: 'p', text: 'الإصلاح الذي يستحق هذا الاسم لا يبدأ من بناء محطات جديدة. يبدأ من ثلاث نقاط: استقلالية مالية وإدارية كاملة لشركة الكهرباء عن الوزارة؛ نظام عقود مفتوح ومنشور علناً مع آلية اعتراض قضائي سريع؛ وتسعيرة كهرباء تعكس الكلفة الحقيقية، مع دعم مباشر للأسر الفقيرة بدلاً من الدعم العام الذي يسرق منه القادرون أكثر مما يستفيد منه المحتاجون.' },
      { type: 'p', text: 'كل هذه الحلول معروفة. كلها مكتوبة في تقارير البنك الدولي، ومستشاري وزارة الكهرباء، ولجان الإصلاح المتعاقبة. لم تُطبَّق ليس لأنها صعبة فنياً — بل لأن تطبيقها يعني إنهاء آلية تمويل سياسية كاملة. وهنا يقف الإصلاح، عند الحد الذي يعجز الخطاب الرسمي عن تجاوزه.' },
    ],
    body_en: [
      { type: 'lede', text: 'In the summer of 2023, when Baghdad temperatures crossed fifty degrees Celsius, families took turns sleeping by the neighborhood generator. This was not exceptional — it was the default, sustained for two decades. Across those decades, more than eighty billion dollars has flowed into the electricity sector. The question is not "where did the money go?" The question is: why does the system keep failing in exactly the same way every year?' },
      { type: 'p', text: 'The official answer is familiar: gas shortages, terrorism, weather, rising demand. Each is partially true. Each avoids the core. Iraqi electricity was not designed to work — it was designed to be funded. Every energy crisis is a fresh tender, every tender a commission, every commission a slice that feeds a political network.', margin: { side: 'right', label: 'Cumulative spend', number: '$80B+', unit: 'since 2003', note: 'Ministry of Electricity, cumulative estimates 2003–2024' } },
      { type: 'p', text: 'Look at the supply-demand gap at peak summer: eight thousand megawatts. That is not a deficit — that is the size of a mid-sized Iraqi city with no electricity at all. The technical fixes have been known for fifteen years: high-efficiency combined-cycle plants, very-high-voltage transmission, smart metering to end theft, serious investment in solar where the sun is free nine months a year.', margin: { side: 'left', label: 'Peak gap', number: '8,000', unit: 'MW', note: 'Summer 2023 — National Grid report' } },
      { type: 'stat', label: 'Grid losses', figure: '> 40%', desc: 'Half technical, due to a decaying network. Half theft and illegal hookups. In comparable countries, this number is under 12%.' },
      { type: 'h2', text: 'The engineering of organized failure' },
      { type: 'p', text: 'Take a typical contract: a 500 MW generation plant, contract value around $750 million. The actual build cost is much lower — perhaps $500 million. The gap does not vanish. It distributes across subcontractors, local agents, "required" partners by political custom, and consultants who consult on nothing.', margin: { side: 'right', label: 'Layers of intermediaries', number: '7', unit: 'per contract', note: 'Audit of a representative 2021 generation contract' } },
      { type: 'pull', text: 'Our electricity is not an engineering problem. It is a political problem in an engineer\u2019s uniform.' },
      { type: 'p', text: 'When the plant is finally finished — two years late — the ministry discovers the gas line that should feed it was never laid. Why? Because the gas-line contract sat with a different ministry, controlled by a different political bloc, whose share had not been settled. The new plant waits months, then years. When it finally runs, it runs at half its declared efficiency because the equipment arrived incomplete.' },
      { type: 'h2', text: 'Why does the generator succeed, and the system fail?' },
      { type: 'p', text: 'Note the paradox. The neighborhood generator — run by a young man with no engineering degree, no government contract — works. It runs all year. The owner repairs it himself, buys his own fuel, collects his own cash. The economics are simple: service, price, direct responsibility. No intermediaries. No quotas.', margin: { side: 'left', label: 'Private generators', number: '2.5M+', unit: 'subscribers', note: 'Informal estimate — Generator Owners Association' } },
      { type: 'p', text: 'This is not an argument for full privatization — electricity is a strategic good and cannot be left to market logic alone. But it is a mirror. It tells us the problem is not the feasibility of running power in Iraq. The problem is the management model the political system insists on, because any alternative threatens the rent network.' },
      { type: 'h2', text: 'What it would actually take' },
      { type: 'p', text: 'Reform worthy of the name does not start with building new plants. It starts with three things: full financial and administrative independence for the electricity company from the ministry; an open, publicly published contracting system with rapid judicial review; and tariffs that reflect real cost, with direct subsidies for poor families rather than blanket subsidies that benefit the wealthy more than the needy.' },
      { type: 'p', text: 'All of these solutions are known. All are written into World Bank reports, ministry consultants\u2019 binders, successive reform committees. They have not been applied not because they are technically hard — but because applying them means ending an entire political funding mechanism. And here reform stops, at the line official discourse cannot cross.' },
    ],
  },
  {
    slug: 'al-fasad-al-mu-assasi',
    topic_ar: 'مكافحة الفساد',
    topic_en: 'Anti-Corruption',
    title_ar: 'الفساد المؤسسي: ليس استثناءً بل آلية حكم',
    title_en: 'Institutional Corruption: Not an Exception, A Mechanism of Rule',
    excerpt_ar: 'الفساد في العراق ليس مرضاً عرضياً يصيب نظاماً سليماً — بل هو الآلية الأساسية التي يعمل بها النظام نفسه.',
    excerpt_en: 'Corruption in Iraq is not a passing affliction. It is the basic mechanism by which the system itself operates.',
    author_ar: 'طارق الراشد',
    author_en: 'Tariq Al-Rashid',
    date: '2026-03-08',
    minutes: 11,
    tldr_ar: ['الفساد ليس خللاً — هو وظيفة', 'هيئة النزاهة بلا أنياب حقيقية', 'الإصلاح يبدأ من تفكيك المحاصصة، لا من القوانين'],
    tldr_en: ['Corruption is not a bug — it\u2019s a feature', 'The Integrity Commission has no real teeth', 'Reform starts by dismantling sectarian quotas, not laws'],
  },
  {
    slug: 'al-mu-assasat-al-da-ifa',
    topic_ar: 'الإصلاح المؤسسي',
    topic_en: 'Institutional Reform',
    title_ar: 'مؤسسات بلا سلطة: لماذا تفشل الرقابة في العراق؟',
    title_en: 'Institutions Without Authority: Why Oversight Fails in Iraq',
    excerpt_ar: 'يمتلك العراق على الورق منظومة رقابية متكاملة — ديوان رقابة، هيئة نزاهة، لجان برلمانية. لماذا تفشل جميعها؟',
    excerpt_en: 'On paper, Iraq has a full oversight system. Why does every part of it fail?',
    author_ar: 'طارق الراشد',
    author_en: 'Tariq Al-Rashid',
    date: '2026-02-19',
    minutes: 8,
    tldr_ar: ['الرقابة بلا سلطة تنفيذية = ديكور', 'القضاء يخضع لذات القوى التي يفترض أن يحاسبها', 'الحل: استقلالية مالية وإدارية للهيئات الرقابية'],
    tldr_en: ['Oversight without enforcement = decoration', 'The judiciary answers to the same forces it should hold accountable', 'Solution: fiscal and administrative independence for oversight bodies'],
  },
  {
    slug: 'al-shabab-w-al-hijra',
    topic_ar: 'الشأن الاجتماعي',
    topic_en: 'Society',
    title_ar: 'هجرة العقول: حين يصبح المغادرة قراراً عقلانياً',
    title_en: 'The Brain Drain: When Leaving Becomes the Rational Choice',
    excerpt_ar: 'يغادر العراق سنوياً آلاف من خريجي الطب والهندسة والعلوم. هذه ليست خيانة — إنها قراءة دقيقة للواقع.',
    excerpt_en: 'Thousands of Iraq\u2019s doctors, engineers, and scientists leave each year. This is not betrayal — it is a clear reading of reality.',
    author_ar: 'طارق الراشد',
    author_en: 'Tariq Al-Rashid',
    date: '2026-01-30',
    minutes: 10,
    tldr_ar: ['أكثر من 70% من خريجي الطب يفكرون بالهجرة', 'الراتب ليس السبب الأول — البيئة المهنية هي', 'بقاء الكفاءات يتطلب مشروعاً وطنياً، لا شعارات'],
    tldr_en: ['Over 70% of medical graduates consider emigration', 'Salary isn\u2019t the top reason — the professional environment is', 'Retention requires a national project, not slogans'],
  },
];

window.SAMPLE_COMMENTS = {
  'kahraba-baghdad': [
    { id: 1, name_ar: 'مهند الجبوري', name_en: 'Muhannad Al-Jubouri', initial: 'م', date: '2026-03-23', body_ar: 'كمهندس عمل في وزارة الكهرباء لسبع سنوات، أؤكد كل كلمة. أسوأ ما في الأمر أن من يحاول العمل بصدق يُحاصَر — لا يُطرد، بل يُحاصَر حتى يستقيل.', body_en: 'As an engineer who worked in the ministry for seven years, I confirm every word. The worst part: those who try to work honestly are not fired — they are surrounded until they resign.' },
    { id: 2, name_ar: 'سارة الموسوي', name_en: 'Sarah Al-Mousawi', initial: 'س', date: '2026-03-24', body_ar: 'الفقرة عن المولّدة دقيقة جداً. السوق غير الرسمي يعمل لأن المساءلة فيه فورية. الدرس واضح، لكن لا أحد يريد سماعه.', body_en: 'The paragraph about the generator is precise. The informal market works because accountability there is immediate. The lesson is obvious, but no one wants to hear it.' },
  ],
  'muwazanat-2025': [
    { id: 1, name_ar: 'هدى الكاظمي', name_en: 'Huda Al-Kadhimi', initial: 'ه', date: '2026-04-16', body_ar: 'تحليل دقيق. أضيف إلى ذلك أن الموازنات السنوية أصبحت مفرغة من معناها — لا أحد في الوزارات يعمل وفق رؤية متعددة السنوات. الموازنة تُعدّ ثم تُنسى.', body_en: 'Sharp analysis. I\u2019d add that annual budgets have lost their meaning — no one in ministries works to a multi-year vision. Budgets are drafted and forgotten.' },
    { id: 2, name_ar: 'عمر سعيد', name_en: 'Omar Saeed', initial: 'ع', date: '2026-04-17', body_ar: 'النقطة المتعلقة بربط الإنفاق بمؤشرات الأداء جوهرية. لكن من سيقيس الأداء حين تكون الجهات الرقابية ذاتها جزءاً من المنظومة؟', body_en: 'The point about linking spending to performance indicators is essential. But who measures performance when oversight bodies are themselves part of the system?' },
    { id: 3, name_ar: 'ليلى الحلو', name_en: 'Layla Al-Hilou', initial: 'ل', date: '2026-04-18', body_ar: 'مقال يستحق القراءة مرتين. اللغة هادئة، لكن الحجة قاسية — وهذا تماماً ما نحتاجه.', body_en: 'Worth reading twice. The language is calm, but the argument is harsh — exactly what we need.' },
  ],
};

```

---

### `tweaks-panel.jsx`

```jsx

// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;width:100%;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null
      ? keyOrEdits : { [keyOrEdits]: val };
    setValues((prev) => ({ ...prev, ...edits }));
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({ title = 'Tweaks', children }) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({ x: 16, y: 16 });
  const PAD = 16;

  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth, h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y)),
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);

  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);

  React.useEffect(() => {
    const onMsg = (e) => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);
      else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
  };

  const onDragStart = (e) => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = (ev) => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy),
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  if (!open) return null;
  return (
    <>
      <style>{__TWEAKS_STYLE}</style>
      <div ref={dragRef} className="twk-panel" data-noncommentable=""
           style={{ right: offsetRef.current.x, bottom: offsetRef.current.y }}>
        <div className="twk-hd" onMouseDown={onDragStart}>
          <b>{title}</b>
          <button className="twk-x" aria-label="Close tweaks"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={dismiss}>✕</button>
        </div>
        <div className="twk-body">{children}</div>
      </div>
    </>
  );
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({ label, children }) {
  return (
    <>
      <div className="twk-sect">{label}</div>
      {children}
    </>
  );
}

function TweakRow({ label, value, children, inline = false }) {
  return (
    <div className={inline ? 'twk-row twk-row-h' : 'twk-row'}>
      <div className="twk-lbl">
        <span>{label}</span>
        {value != null && <span className="twk-val">{value}</span>}
      </div>
      {children}
    </div>
  );
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({ label, value, min = 0, max = 100, step = 1, unit = '', onChange }) {
  return (
    <TweakRow label={label} value={`${value}${unit}`}>
      <input type="range" className="twk-slider" min={min} max={max} step={step}
             value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </TweakRow>
  );
}

function TweakToggle({ label, value, onChange }) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl"><span>{label}</span></div>
      <button type="button" className="twk-toggle" data-on={value ? '1' : '0'}
              role="switch" aria-checked={!!value}
              onClick={() => onChange(!value)}><i /></button>
    </div>
  );
}

function TweakRadio({ label, value, options, onChange }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const opts = options.map((o) => (typeof o === 'object' ? o : { value: o, label: o }));
  const idx = Math.max(0, opts.findIndex((o) => o.value === value));
  const n = opts.length;

  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  const segAt = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor(((clientX - r.left - 2) / inner) * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };

  const onPointerDown = (e) => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = (ev) => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <TweakRow label={label}>
      <div ref={trackRef} role="radiogroup" onPointerDown={onPointerDown}
           className={dragging ? 'twk-seg dragging' : 'twk-seg'}>
        <div className="twk-seg-thumb"
             style={{ left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
                      width: `calc((100% - 4px) / ${n})` }} />
        {opts.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={o.value === value}>
            {o.label}
          </button>
        ))}
      </div>
    </TweakRow>
  );
}

function TweakSelect({ label, value, options, onChange }) {
  return (
    <TweakRow label={label}>
      <select className="twk-field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => {
          const v = typeof o === 'object' ? o.value : o;
          const l = typeof o === 'object' ? o.label : o;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </TweakRow>
  );
}

function TweakText({ label, value, placeholder, onChange }) {
  return (
    <TweakRow label={label}>
      <input className="twk-field" type="text" value={value} placeholder={placeholder}
             onChange={(e) => onChange(e.target.value)} />
    </TweakRow>
  );
}

function TweakNumber({ label, value, min, max, step = 1, unit = '', onChange }) {
  const clamp = (n) => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({ x: 0, val: 0 });
  const onScrubStart = (e) => {
    e.preventDefault();
    startRef.current = { x: e.clientX, val: value };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = (ev) => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return (
    <div className="twk-num">
      <span className="twk-num-lbl" onPointerDown={onScrubStart}>{label}</span>
      <input type="number" value={value} min={min} max={max} step={step}
             onChange={(e) => onChange(clamp(Number(e.target.value)))} />
      {unit && <span className="twk-num-unit">{unit}</span>}
    </div>
  );
}

function TweakColor({ label, value, onChange }) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl"><span>{label}</span></div>
      <input type="color" className="twk-swatch" value={value}
             onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function TweakButton({ label, onClick, secondary = false }) {
  return (
    <button type="button" className={secondary ? 'twk-btn secondary' : 'twk-btn'}
            onClick={onClick}>{label}</button>
  );
}

Object.assign(window, {
  useTweaks, TweaksPanel, TweakSection, TweakRow,
  TweakSlider, TweakToggle, TweakRadio, TweakSelect,
  TweakText, TweakNumber, TweakColor, TweakButton,
});

```

---

### `components.jsx`

```jsx
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

```

---

### `cover.jsx`

```jsx
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

```

---

### `home.jsx`

```jsx
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

```

---

### `article.jsx`

```jsx
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

```

---

### `app.jsx`

```jsx
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

```

---

## Final notes

- The default landing is the **cover** route. After "Open the Issue" is clicked, the user lands on home (with hero=masthead). Cover is one-time per session.
- The masthead title in the header navigates to home — NOT back to cover.
- The Tweaks panel toggle is exposed by the host environment in the prototype; in the live site, replace with a small floating button (gear icon) in the corner.
- All Arabic content uses real Iraqi political-thought language — do not translate or paraphrase. Use the exact strings from data.js.
- Use semantic HTML throughout (header, main, article, aside, nav).
- Test in both AR (RTL) and EN (LTR) modes after porting — RTL is the primary direction.

Once ported and pushed to the main branch, Vercel should deploy automatically. Verify on mobile.
