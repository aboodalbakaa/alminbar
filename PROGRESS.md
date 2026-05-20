# Al-Minbar Progress Log

## Last updated
2026-05-20

## Current status
Phase 2: Government Oversight Module — fully built. DB migrated. Admin forms complete. No data seeded yet.

---

## Completed so far

### Phase 1 — Scaffold
- Concept, persona (Tariq Al-Rashid), CLAUDE.md defined
- GitHub repo, Vercel connected
- Next.js 14 App Router, bilingual AR/EN, Tailwind
- Header, Footer, Home, Articles, About, Submit, Admin, Writers pages
- Supabase: profiles, submissions, comments tables

### Phase 2 — Government Oversight Module (built today)
- **Database migration** written: `supabase-government-migration.sql`
  - tables: officials, parliament_sessions, kpis, scraped_items, corruption_cases, country_metrics
  - ⚠️ MUST BE RUN MANUALLY in Supabase dashboard (project ohcxccolujkruyhoaixf)

- **Daily scraper engine** (`src/lib/scrapers/`)
  - `sources.ts` — 8 Iraqi RSS feeds + World Bank indicators + 7 static international rankings
  - `rss.ts` — RSS parser with relevance scoring + Twitter via Nitter RSS
  - `worldbank.ts` — Fetches Iraq data + global rankings for 12 indicators
  - `country_metrics` table auto-updated via World Bank API

- **API route** `src/app/api/scrape/route.ts`
  - GET/POST secured with CRON_SECRET env var
  - Runs: RSS scrape → Twitter scrape → World Bank metrics
  - Upserts deduplicated by source_url

- **Vercel cron** — runs daily at 06:00 UTC (set in vercel.json)

- **Frontend pages** (all bilingual AR/EN, RTL-first):
  - `/government` — overview: KPI stats, economy metrics, governance rankings, cabinet, news feed
  - `/government/[slug]` — individual official: profile, KPI list with progress bar, corruption cases, news
  - `/government/parliament` — current session stats, session history, parliament news
  - `/government/corruption` — all cases with sources, evidence levels, amounts
  - `/government/metrics` — full Iraq global rankings dashboard (World Bank auto + static international)

- **Admin panel** `src/app/[locale]/admin/government/page.tsx`
  - Lists officials, pending scraped news, recent KPIs, country metrics
  - Links to add: official, KPI, corruption case, session

- **Admin forms** — all built and type-checked clean:
  - `officials/new` — add official (identity, party, bio, social, term)
  - `officials/[id]` — edit/delete official
  - `kpis/new` — add KPI/promise with official + session dropdowns
  - `corruption/new` — add corruption case with source URLs textarea
  - `sessions/new` — add parliament session (stats + dates)
  - `news/[id]` — review scraped item: assign official, categorise, publish or discard

- **Server actions** (`src/app/actions/government.ts`) — all 10 actions implemented:
  `createOfficial`, `updateOfficial`, `deleteOfficial`, `createKpi`, `updateKpiStatus`,
  `createCorruptionCase`, `createSession`, `updateSession`, `publishScrapedItem`, `discardScrapedItem`, `upsertMetric`

- **Header** updated — "رقابة الحكومة / Gov. Tracker" nav link added

---

## ⚠️ Things needing attention

1. **No seed data** — officials, KPIs, parliament sessions are all empty. Admin forms are ready — enter officials first, then parliament session, then KPIs.

2. **TypeScript**: One pre-existing bug fixed — `onSubmit="string"` on delete official form (server component can't use client confirm dialog; removed).

---

## Next task (single most important)
**Seed data via admin forms**: go to `/ar/admin/government` → add officials (PM, ministers, key MPs) → add current parliament session → add initial KPIs.

## Decisions made this session
- World Bank API used for live economic data (free, no key required)
- Twitter scraped via Nitter RSS (no API key needed, may be flaky)
- Scraped news: relevance_score >= 0.3 auto-publishes; below that is held for review
- Corruption page has legal disclaimer — "documentation ≠ conviction"
- Country metrics stored in `country_metrics` table, auto-upserted by scraper daily
- Static international rankings (CPI, HDI, Press Freedom, etc.) defined in sources.ts — admin enters values manually or scraper populates when data available
