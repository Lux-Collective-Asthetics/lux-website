-- Lux Collective — full database schema
-- Run once in Supabase Dashboard → SQL Editor

create table if not exists service_categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  display_order integer not null default 0,
  is_system     boolean not null default false,
  image_url     text,
  created_at    timestamptz not null default now()
);

create table if not exists services (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  summary       text not null default '',
  category      text not null,
  category_id   uuid references service_categories(id) on delete set null,
  duration      text,
  hero_image_url text,
  display_order integer not null default 0,
  is_visible    boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists service_price_lines (
  id            uuid primary key default gen_random_uuid(),
  service_id    uuid not null references services(id) on delete cascade,
  label         text not null,
  price         text not null default '',
  display_order integer not null default 0
);

create table if not exists staff_members (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  credential    text not null default '',
  title         text not null default '',
  bio           text not null default '',
  photo_url     text,
  booking_url   text,
  display_order integer not null default 0,
  is_visible    boolean not null default true,
  is_owner      boolean not null default false,
  created_at    timestamptz not null default now()
);

create table if not exists staff_services (
  staff_id   uuid not null references staff_members(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  primary key (staff_id, service_id)
);

create table if not exists gallery_images (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  category      text not null,
  before_url    text not null,
  after_url     text not null,
  caption       text,
  display_order integer not null default 0,
  is_visible    boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists staff_photos (
  id            uuid primary key default gen_random_uuid(),
  staff_id      uuid not null references staff_members(id) on delete cascade,
  photo_url     text not null,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists about_gallery (
  id            uuid primary key default gen_random_uuid(),
  photo_url     text not null,
  caption       text,
  display_order integer not null default 0,
  is_visible    boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists testimonials (
  id            uuid primary key default gen_random_uuid(),
  quote         text not null,
  author        text not null,
  photo_url     text,
  is_visible    boolean not null default true,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  status          text not null default 'active',
  token           uuid not null default gen_random_uuid() unique,
  subscribed_at   timestamptz,
  unsubscribed_at timestamptz,
  created_at      timestamptz not null default now()
);

create table if not exists newsletter_sends (
  id                   uuid primary key default gen_random_uuid(),
  campaign_name        text not null,
  subject              text not null,
  resend_broadcast_id  text not null unique,
  sent_at              timestamptz,
  open_count           integer not null default 0,
  click_count          integer not null default 0,
  recipient_count      integer not null default 0,
  created_at           timestamptz not null default now()
);

-- Enable Row Level Security on all tables
alter table services              enable row level security;
alter table service_price_lines   enable row level security;
alter table service_categories    enable row level security;
alter table staff_members         enable row level security;
alter table staff_services        enable row level security;
alter table staff_photos          enable row level security;
alter table about_gallery         enable row level security;
alter table gallery_images        enable row level security;
alter table testimonials          enable row level security;
alter table subscribers           enable row level security;
alter table newsletter_sends      enable row level security;

-- Public read access for visible content
create policy "public read service_categories" on service_categories for select using (true);
create policy "public read services"        on services           for select using (is_visible = true);
create policy "public read price lines"     on service_price_lines for select
  using (exists (select 1 from services s where s.id = service_price_lines.service_id and s.is_visible));
create policy "public read staff"           on staff_members      for select using (is_visible = true);
create policy "public read staff_services"  on staff_services     for select
  using (
    exists (select 1 from staff_members sm where sm.id = staff_services.staff_id and sm.is_visible)
    and exists (select 1 from services s where s.id = staff_services.service_id and s.is_visible)
  );
create policy "public read gallery"         on gallery_images     for select using (is_visible = true);
create policy "public read testimonials"    on testimonials       for select using (is_visible = true);
create policy "public read staff_photos"    on staff_photos       for select
  using (
    exists (select 1 from staff_members sm where sm.id = staff_photos.staff_id and sm.is_visible = true)
  );
create policy "public read about_gallery"   on about_gallery      for select using (is_visible = true);

-- Service role bypasses RLS (used by server actions and seed script)
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- Anon/authenticated can read public content
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;

-- Performance indexes for FK joins and ordered queries
create index if not exists idx_service_price_lines_service_id on service_price_lines(service_id);
create index if not exists idx_staff_services_service_id on staff_services(service_id);
create index if not exists idx_gallery_images_display_order on gallery_images(display_order);
create index if not exists idx_staff_photos_staff_id on staff_photos(staff_id, display_order);
create index if not exists idx_about_gallery_display_order on about_gallery(display_order);
create index if not exists idx_service_categories_display_order on service_categories(display_order);
