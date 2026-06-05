-- service_categories: managed list of service type names
-- Categories are loosely coupled to services via the category text column.
-- Running this migration seeds the table from existing service category strings.

create table if not exists service_categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

alter table service_categories enable row level security;

create policy "public read service_categories"
  on service_categories for select using (true);

grant all on service_categories to service_role;
grant select on service_categories to anon, authenticated;

-- Seed from existing services
insert into service_categories (name, display_order)
select distinct category, (row_number() over (order by category)) - 1
from services
on conflict (name) do nothing;
