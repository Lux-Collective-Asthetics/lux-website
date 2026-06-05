-- Run in Supabase Dashboard → SQL Editor

-- Multiple photos per staff member
create table if not exists staff_photos (
  id            uuid primary key default gen_random_uuid(),
  staff_id      uuid not null references staff_members(id) on delete cascade,
  photo_url     text not null,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

-- Company/team photos shown at the top of the About page
create table if not exists about_gallery (
  id            uuid primary key default gen_random_uuid(),
  photo_url     text not null,
  caption       text,
  display_order integer not null default 0,
  is_visible    boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Owner/featured flag on staff members
alter table staff_members add column if not exists is_owner boolean not null default false;

-- RLS
alter table staff_photos   enable row level security;
alter table about_gallery  enable row level security;

create policy "public read staff_photos" on staff_photos for select
  using (
    exists (
      select 1 from staff_members sm
      where sm.id = staff_photos.staff_id and sm.is_visible = true
    )
  );

create policy "public read about_gallery" on about_gallery for select
  using (is_visible = true);

-- Service role access
grant all on staff_photos  to service_role;
grant all on about_gallery to service_role;
grant select on staff_photos  to anon, authenticated;
grant select on about_gallery to anon, authenticated;

-- Performance indexes
create index if not exists idx_staff_photos_staff_id      on staff_photos(staff_id, display_order);
create index if not exists idx_about_gallery_display_order on about_gallery(display_order);
