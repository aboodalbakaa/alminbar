import urllib.request, urllib.error, json, time, sys, os

PAT = os.environ.get("SUPABASE_ACCESS_TOKEN", "")
REF = os.environ.get("SUPABASE_PROJECT_REF", "ohcxccolujkruyhoaixf")
URL = f"https://api.supabase.com/v1/projects/{REF}/database/query"

def run(label, sql):
    body = json.dumps({"query": sql}).encode()
    req = urllib.request.Request(URL, data=body, headers={
        "Authorization": f"Bearer {PAT}",
        "Content-Type": "application/json"
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            print(f"OK  {label}")
            return True
    except urllib.error.HTTPError as e:
        err = e.read().decode()[:300]
        print(f"ERR {label}: {err}")
        return False
    except Exception as e:
        print(f"ERR {label}: {e}")
        return False

steps = [
    ("profiles RLS policies", """
do $$ begin
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='profiles_select_all') then
    create policy "profiles_select_all" on public.profiles for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='profiles_insert_own') then
    create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='profiles_update_own') then
    create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
  end if;
end $$;
"""),
    ("handle_new_user trigger", """
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
"""),
    ("submissions table", """
create table if not exists public.submissions (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title_ar text not null, title_en text not null default '',
  excerpt_ar text, excerpt_en text, content_ar text not null, content_en text,
  topic_ar text not null default 'سياسة', topic_en text not null default 'Politics',
  status text not null default 'draft' check (status in ('draft','pending','approved','rejected','published')),
  rejection_reason text, reviewed_by uuid references public.profiles(id), reviewed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.submissions enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='submissions' and policyname='submissions_select_own') then
    create policy "submissions_select_own" on public.submissions for select using (auth.uid() = author_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='submissions' and policyname='submissions_select_editor') then
    create policy "submissions_select_editor" on public.submissions for select
      using (exists (select 1 from public.profiles where id = auth.uid() and role in ('editor','admin')));
  end if;
  if not exists (select 1 from pg_policies where tablename='submissions' and policyname='submissions_insert_auth') then
    create policy "submissions_insert_auth" on public.submissions for insert with check (auth.uid() = author_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='submissions' and policyname='submissions_update_own_draft') then
    create policy "submissions_update_own_draft" on public.submissions for update
      using (auth.uid() = author_id and status in ('draft','rejected'));
  end if;
  if not exists (select 1 from pg_policies where tablename='submissions' and policyname='submissions_update_editor') then
    create policy "submissions_update_editor" on public.submissions for update
      using (exists (select 1 from public.profiles where id = auth.uid() and role in ('editor','admin')));
  end if;
end $$;
"""),
    ("comments table", """
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  article_slug text not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  body text not null, status text not null default 'pending' check (status in ('pending','approved','rejected')),
  parent_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.comments enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='comments' and policyname='comments_select_approved') then
    create policy "comments_select_approved" on public.comments for select using (status = 'approved');
  end if;
  if not exists (select 1 from pg_policies where tablename='comments' and policyname='comments_select_own') then
    create policy "comments_select_own" on public.comments for select using (auth.uid() = author_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='comments' and policyname='comments_insert_auth') then
    create policy "comments_insert_auth" on public.comments for insert with check (auth.uid() = author_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='comments' and policyname='comments_update_editor') then
    create policy "comments_update_editor" on public.comments for update
      using (exists (select 1 from public.profiles where id = auth.uid() and role in ('editor','admin')));
  end if;
end $$;
"""),
    ("officials table", """
create table if not exists public.officials (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique, name_ar text not null, name_en text not null,
  title_ar text not null, title_en text not null,
  role_type text not null default 'minister'
    check (role_type in ('prime_minister','deputy_pm','minister','mp','speaker','other')),
  party_ar text, party_en text, ministry_ar text, ministry_en text,
  photo_url text, bio_ar text, bio_en text,
  twitter_handle text, facebook_url text, instagram_url text,
  term_start date, term_end date, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.officials enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='officials' and policyname='officials_select_all') then
    create policy "officials_select_all" on public.officials for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='officials' and policyname='officials_admin_all') then
    create policy "officials_admin_all" on public.officials for all
      using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
  end if;
end $$;
"""),
    ("parliament_sessions table", """
create table if not exists public.parliament_sessions (
  id uuid default gen_random_uuid() primary key,
  session_number int not null, term_number int not null default 5,
  title_ar text not null, title_en text not null,
  start_date date not null, end_date date,
  status text not null default 'active' check (status in ('active','closed','suspended')),
  laws_passed int default 0, sessions_held int default 0,
  attendance_rate numeric(5,2), description_ar text, description_en text,
  created_at timestamptz not null default now()
);
alter table public.parliament_sessions enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='parliament_sessions' and policyname='sessions_select_all') then
    create policy "sessions_select_all" on public.parliament_sessions for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='parliament_sessions' and policyname='sessions_admin_all') then
    create policy "sessions_admin_all" on public.parliament_sessions for all
      using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
  end if;
end $$;
"""),
    ("kpis table", """
create table if not exists public.kpis (
  id uuid default gen_random_uuid() primary key,
  official_id uuid references public.officials(id) on delete cascade not null,
  session_id uuid references public.parliament_sessions(id) on delete set null,
  title_ar text not null, title_en text not null, description_ar text, description_en text,
  category text not null default 'general'
    check (category in ('economy','infrastructure','security','corruption','healthcare','education','services','general')),
  status text not null default 'promised'
    check (status in ('promised','in_progress','achieved','failed','abandoned','stalled')),
  date_promised date, deadline date, completion_date date, source_url text, evidence_url text,
  notes_ar text, notes_en text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.kpis enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='kpis' and policyname='kpis_select_all') then
    create policy "kpis_select_all" on public.kpis for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='kpis' and policyname='kpis_admin_all') then
    create policy "kpis_admin_all" on public.kpis for all
      using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
  end if;
end $$;
"""),
    ("scraped_items table", """
create table if not exists public.scraped_items (
  id uuid default gen_random_uuid() primary key,
  official_id uuid references public.officials(id) on delete set null,
  source_name text not null, source_url text not null unique,
  title_ar text, title_en text, summary_ar text, summary_en text, raw_content text,
  published_at timestamptz, scraped_at timestamptz not null default now(),
  category text not null default 'news'
    check (category in ('news','social_media','official_statement','parliament','decision','corruption')),
  tags text[] default '{}', is_verified boolean not null default false,
  is_published boolean not null default false, relevance_score numeric(3,2) default 0.5
);
alter table public.scraped_items enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='scraped_items' and policyname='scraped_select_published') then
    create policy "scraped_select_published" on public.scraped_items for select using (is_published = true);
  end if;
  if not exists (select 1 from pg_policies where tablename='scraped_items' and policyname='scraped_admin_all') then
    create policy "scraped_admin_all" on public.scraped_items for all
      using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
  end if;
end $$;
"""),
    ("corruption_cases table", """
create table if not exists public.corruption_cases (
  id uuid default gen_random_uuid() primary key,
  official_id uuid references public.officials(id) on delete set null,
  title_ar text not null, title_en text not null,
  description_ar text not null, description_en text not null,
  amount_usd bigint, date_reported date, date_occurred date,
  source_urls text[] not null default '{}',
  status text not null default 'alleged'
    check (status in ('alleged','under_investigation','confirmed','acquitted','convicted','dismissed')),
  evidence_level text not null default 'low' check (evidence_level in ('low','medium','high','documented')),
  case_type text not null default 'financial'
    check (case_type in ('financial','bribery','embezzlement','nepotism','abuse_of_power','other')),
  is_published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.corruption_cases enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='corruption_cases' and policyname='corruption_select_published') then
    create policy "corruption_select_published" on public.corruption_cases for select using (is_published = true);
  end if;
  if not exists (select 1 from pg_policies where tablename='corruption_cases' and policyname='corruption_admin_all') then
    create policy "corruption_admin_all" on public.corruption_cases for all
      using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
  end if;
end $$;
"""),
    ("country_metrics table", """
create table if not exists public.country_metrics (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique, indicator_code text,
  name_ar text not null, name_en text not null, description_ar text, description_en text,
  value numeric, unit text not null default '', year int not null default 2024,
  global_rank int, total_countries int, previous_value numeric, previous_rank int,
  trend text check (trend in ('up','down','stable')),
  category text not null default 'economy'
    check (category in ('economy','governance','social','security','infrastructure')),
  source_name text not null, source_url text not null,
  updated_at timestamptz not null default now()
);
alter table public.country_metrics enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='country_metrics' and policyname='metrics_select_all') then
    create policy "metrics_select_all" on public.country_metrics for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='country_metrics' and policyname='metrics_admin_all') then
    create policy "metrics_admin_all" on public.country_metrics for all
      using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
  end if;
end $$;
"""),
    ("indexes", """
create index if not exists officials_slug_idx on public.officials(slug);
create index if not exists officials_role_type_idx on public.officials(role_type);
create index if not exists scraped_items_official_idx on public.scraped_items(official_id);
create index if not exists scraped_items_scraped_at_idx on public.scraped_items(scraped_at desc);
create index if not exists kpis_official_idx on public.kpis(official_id);
create index if not exists kpis_status_idx on public.kpis(status);
create index if not exists corruption_official_idx on public.corruption_cases(official_id);
create index if not exists metrics_category_idx on public.country_metrics(category);
"""),
]

for label, sql in steps:
    run(label, sql)
    time.sleep(0.2)

print("Done.")
