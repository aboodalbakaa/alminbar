# Al-Minbar Progress Log

## Last updated
2026-09-16

## Current status
Phase 3: Fiscal watchdog automation — seeded data, twice-daily scrape, live briefing page. Tracker is no longer an empty shell.

---

## Completed so far

### Phase 1 — Scaffold
- Concept, persona (Tariq Al-Rashid), CLAUDE.md defined
- GitHub repo, Vercel connected
- Next.js 14 App Router, bilingual AR/EN, Tailwind
- Header, Footer, Home, Articles, About, Submit, Admin, Writers pages
- Supabase: profiles, submissions, comments tables

### Phase 2 — Government Oversight Module
- Database migration: `supabase-government-migration.sql`
- Daily scraper engine (`src/lib/scrapers/`)
- Admin panel + forms + server actions
- Frontend tracker pages

### Phase 3 — Fiscal automation (this session)
The oversight module was built but empty. The point of the platform is to score the cabinet’s financial decisions, not to wait for someone to type them in.

What now runs without a human in the loop:

1. **Auto-seed on first scrape** — if `officials` is empty, the cron job writes the Zaidi cabinet, parliament session, fiscal KPIs, published H1 2026 metrics, and the June 2026 Green Zone case. Same seed is a button in `/admin/government` and `POST /api/seed`.
2. **Twice-daily scrape** (`vercel.json` 06:00 and 18:00 UTC) — RSS (including Iraq Business News), World Bank (now with oil rents, tax/GDP, debt, current account, fuel exports), WTI and IQD market prints, official-name matching, fiscal-tag boost so budget/oil/payroll items auto-publish.
3. **Daily fiscal brief** — template analysis stored as a published `scraped_item` and rendered live at `/government/briefing`. Flags: oil vs $65 break-even, H1 deficit, payroll capture, oil-rent share, investment starvation, stalled pledges, no 2026 budget.
4. **Surfaces** — fiscal strip on `/government`, CTA on home, nav links AR/EN, working admin scrape (the old POST had no `CRON_SECRET` and always 401’d).
5. **Editorial** — `content/articles/2026-09-16-sitta-ashhur-bila-muwazana.mdx` (Tariq Al-Rashid): six months without a budget, $16bn H1 deficit, 85% payroll, collapsed exports, tax list vs collections.

---

## How to turn it on in production

1. Set `CRON_SECRET` in Vercel (and matching `SUPABASE_*` keys — already used).
2. Either wait for the next cron, click **Seed cabinet + fiscal pledges** then **Run scraper + fiscal brief** in admin, or:
   `curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://<host>/api/scrape`
3. Confirm `/ar/government` shows the PM and `/ar/government/briefing` shows flags.

The Python `scripts/seed_government.py` is legacy; TypeScript `src/lib/scrapers/seed.ts` is the source of truth.

---

## Things needing attention

1. **CRON_SECRET** must exist in Vercel or cron/auth stays 401.
2. **Nitter Twitter** is still flaky; matching now works off RSS names instead.
3. **Nine vacant portfolios** remain hardcoded on the cabinet grid (Interior/Defence etc. were never confirmed 14 May 2026).
4. Briefing copy is template-based (deterministic, no LLM key). That is intentional: numbers over tone.

## Next task
Watch the first production scrape. If RSS sources 404, swap URLs in `sources.ts`. Then add KPI status updates when a pledge is demonstrably delivered — still a human editorial act.

## Decisions this session
- Opposition means **measurable fiscal oversight**, not insults. Structure, not person.
- First scrape seeds the cabinet so the tracker cannot sit empty again.
- H1 2026 MoF figures (via Rudaw/964) are stored as `country_metrics` with source URLs.
- Documentation ≠ conviction remains the legal line on corruption items.
