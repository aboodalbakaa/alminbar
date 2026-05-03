-- ============================================================
-- Al-Minbar — Supabase Schema
-- Run this in: supabase.com/dashboard/project/ohcxccolujkruyhoaixf/sql/new
-- ============================================================

-- PROFILES (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text not null,
  bio_ar text,
  bio_en text,
  role text not null default 'reader'
    check (role in ('reader', 'contributor', 'editor', 'admin')),
  avatar_url text,
  twitter_url text,
  linkedin_url text,
  youtube_url text,
  instagram_url text,
  website_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_all"   on public.profiles for select using (true);
create policy "profiles_insert_own"   on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own"   on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- SUBMISSIONS
create table public.submissions (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title_ar text not null,
  title_en text not null default '',
  excerpt_ar text,
  excerpt_en text,
  content_ar text not null,
  content_en text,
  topic_ar text not null default 'سياسة',
  topic_en text not null default 'Politics',
  status text not null default 'draft'
    check (status in ('draft', 'pending', 'approved', 'rejected', 'published')),
  rejection_reason text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.submissions enable row level security;

create policy "submissions_select_own"
  on public.submissions for select
  using (auth.uid() = author_id);

create policy "submissions_select_editor"
  on public.submissions for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('editor', 'admin'))
  );

create policy "submissions_insert_auth"
  on public.submissions for insert
  with check (auth.uid() = author_id);

create policy "submissions_update_own_draft"
  on public.submissions for update
  using (auth.uid() = author_id and status in ('draft', 'rejected'));

create policy "submissions_update_editor"
  on public.submissions for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('editor', 'admin'))
  );


-- COMMENTS
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  article_slug text not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  parent_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "comments_select_approved"
  on public.comments for select
  using (status = 'approved');

create policy "comments_select_own"
  on public.comments for select
  using (auth.uid() = author_id);

create policy "comments_select_editor"
  on public.comments for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('editor', 'admin'))
  );

create policy "comments_insert_auth"
  on public.comments for insert
  with check (auth.uid() = author_id);

create policy "comments_update_editor"
  on public.comments for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('editor', 'admin'))
  );
