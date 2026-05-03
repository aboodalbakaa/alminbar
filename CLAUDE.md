## Session startup ritual
1. Read this file fully
2. Read PROGRESS.md — this tells you exactly where we left off
3. Ask ONE clarifying question if needed, then start working
4. At session end: update PROGRESS.md before Abood types /exit

---

# Al-Minbar | المنبر

## What this is
A bilingual (Arabic/English) political publication platform. 
The founding voice is Tariq Al-Rashid — a constructed Iraqi 
intellectual persona who publishes critical analysis of Iraqi 
governance. Other contributors can also publish here.

## Core mission
Constructive, evidence-based criticism of Iraqi government — 
focused on the PM, economic policy, corruption, infrastructure, 
and institutional reform. Goal: a prosperous Iraq.

## Technical stack
- Next.js 14 (App Router)
- Supabase (database)
- Vercel (deployment)
- MDX (articles as files in /content/articles/)
- next-i18next (bilingual AR/EN)
- Tailwind CSS

## Design rules
- Arabic is PRIMARY language — always implement RTL first
- Colours: Deep navy (#1B2A4A), Gold (#C9A84C), White (#FAFAFA)
- Arabic font: Noto Naskh Arabic
- English font: Playfair Display (headings), Inter (body)
- Tone: serious journalism, never blog-like

## Tariq Al-Rashid
- Iraqi intellectual, founding editor
- Writes in both Arabic and English
- Profile image: /public/tariq-profile.jpg
- Bio: Iraqi thinker writing from the diaspora. 
  Critical of systems, never personal. One goal: 
  a prosperous Iraq.

## Content structure
- Articles live in /content/articles/ as MDX files
- Filename format: YYYY-MM-DD-slug.mdx
- Each article has frontmatter: title_ar, title_en, 
  author, date, topic, excerpt_ar, excerpt_en

## Connected to
المجلس الثقافي العراقي — interview archive that 
informs the intellectual foundation of this platform.

## Deployment
- GitHub repo: alminbar
- Vercel project: alminbar
- Push to main → auto-deploys to production
- Push to any branch → preview URL generated
