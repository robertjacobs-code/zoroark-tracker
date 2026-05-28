create extension if not exists "uuid-ossp";

create table cards (
  id uuid primary key default uuid_generate_v4(),
  sort_index integer not null,
  release_date date not null,
  binder_page integer,
  binder_row integer,
  region text not null check (region in ('EN','JP','CN','KR','DE','FR','IT','ES','PT','OTHER')),
  card_name text not null,
  form_mechanic text,
  set_name text not null,
  card_number text not null,
  rarity text,
  variant text,
  finish text,
  notes text,
  copies_owned integer not null default 0 check (copies_owned between 0 and 3),
  image_url text,
  tcg_api_id text,
  is_excluded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cards_region_release on cards(region, release_date);
create index cards_card_number on cards(card_number);
create index cards_sort_index on cards(sort_index);

create table scan_log (
  id uuid primary key default uuid_generate_v4(),
  scanned_at timestamptz not null default now(),
  scan_type text not null check (scan_type in ('new_cards','missing_images')),
  cards_found integer not null default 0,
  cards_added integer not null default 0,
  details jsonb
);

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger cards_updated_at before update on cards
  for each row execute function update_updated_at();

alter table cards enable row level security;

create policy "Public read" on cards for select using (true);
create policy "Service role write" on cards for all using (auth.role() = 'service_role');
