-- Migration 005: is_system flag on service_categories + category_id FK on services

-- 1. Add is_system to service_categories (default false for existing rows)
alter table service_categories
  add column if not exists is_system boolean not null default false;

-- 2. Ensure the "Other" system fallback category exists
insert into service_categories (name, display_order, is_system)
select 'Other', 9999, true
where not exists (
  select 1 from service_categories where name = 'Other' and is_system = true
);

-- 3. Add category_id FK to services (nullable initially so backfill can run)
alter table services
  add column if not exists category_id uuid references service_categories(id) on delete set null;

-- 4. Backfill category_id by matching existing category text to category name
update services s
set category_id = sc.id
from service_categories sc
where sc.name = s.category
  and s.category_id is null;

-- 5. Any still-null category_id → assign to "Other"
update services s
set category_id = (select id from service_categories where name = 'Other' limit 1)
where s.category_id is null;
