create extension if not exists pgcrypto;

create table if not exists cities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  region text not null,
  timezone text not null default 'America/New_York',
  lanes text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  create type content_status as enum ('draft', 'review', 'published', 'archived');
exception
  when duplicate_object then null;
end $$;

create table if not exists places (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id) on delete cascade,
  slug text not null,
  status content_status not null default 'draft',
  sort_order integer not null default 100,
  name text not null,
  area text not null,
  category text not null,
  tags text[] not null default '{}',
  rating text,
  blurb text not null,
  map_url text not null,
  web_url text,
  image_url text,
  source_url text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(city_id, slug)
);

create table if not exists day_trips (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id) on delete cascade,
  slug text not null,
  status content_status not null default 'draft',
  sort_order integer not null default 100,
  kicker text not null,
  title text not null,
  body text not null,
  tags text[] not null default '{}',
  source_notes jsonb not null default '[]'::jsonb,
  publish_week date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(city_id, slug)
);

create table if not exists weekly_issues (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id) on delete cascade,
  slug text not null,
  status content_status not null default 'draft',
  label text,
  kicker text,
  title text not null,
  subject text not null,
  summary text not null,
  picks text[] not null default '{}',
  cards jsonb not null default '[]'::jsonb,
  publish_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(city_id, slug)
);

create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id) on delete cascade,
  name text not null,
  url text not null,
  lane text not null,
  note text,
  active boolean not null default true,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  unique(city_id, url)
);

create table if not exists source_candidates (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id) on delete cascade,
  source_id uuid references sources(id) on delete set null,
  status content_status not null default 'draft',
  title text not null,
  url text,
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  summary text,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists city_settings (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(city_id, key)
);

create table if not exists newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  city_slug text not null default 'nature-coast',
  source text not null default 'site-signup',
  status text not null default 'subscribed',
  provider text not null default 'supabase',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant usage on schema public to anon, authenticated, service_role;

grant select on table
  cities,
  places,
  day_trips,
  weekly_issues,
  sources,
  city_settings
to anon, authenticated;

grant select, insert, update, delete on table
  cities,
  places,
  day_trips,
  weekly_issues,
  sources,
  source_candidates,
  city_settings,
  newsletter_signups
to service_role;
