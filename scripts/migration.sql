-- Run this in the Supabase SQL editor at:
-- https://supabase.com/dashboard/project/ukmyjostwftmvyrciqrm/sql

-- Staff members
CREATE TABLE IF NOT EXISTS staff_members (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL,
  credential    text        NOT NULL,
  title         text        NOT NULL,
  bio           text        NOT NULL,
  photo_url     text,
  booking_url   text,
  display_order integer     NOT NULL DEFAULT 0,
  is_visible    boolean     NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL,
  summary       text        NOT NULL,
  category      text        NOT NULL,
  duration      text,
  hero_image_url text,
  display_order integer     NOT NULL DEFAULT 0,
  is_visible    boolean     NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

-- Service price lines
CREATE TABLE IF NOT EXISTS service_price_lines (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id    uuid        NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  label         text        NOT NULL,
  price         text        NOT NULL DEFAULT '',
  display_order integer     NOT NULL DEFAULT 0
);

-- Staff <-> Services junction
CREATE TABLE IF NOT EXISTS staff_services (
  staff_id    uuid  NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  service_id  uuid  NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, service_id)
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  quote         text        NOT NULL,
  author        text        NOT NULL,
  photo_url     text,
  is_visible    boolean     NOT NULL DEFAULT true,
  display_order integer     NOT NULL DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- Gallery images
CREATE TABLE IF NOT EXISTS gallery_images (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text        NOT NULL,
  category      text        NOT NULL,
  before_url    text        NOT NULL,
  after_url     text        NOT NULL,
  caption       text,
  display_order integer     NOT NULL DEFAULT 0,
  is_visible    boolean     NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

-- Newsletter sends
CREATE TABLE IF NOT EXISTS newsletter_sends (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name       text        NOT NULL,
  subject             text        NOT NULL,
  resend_broadcast_id text        UNIQUE NOT NULL,
  sent_at             timestamptz,
  open_count          integer     NOT NULL DEFAULT 0,
  click_count         integer     NOT NULL DEFAULT 0,
  recipient_count     integer     NOT NULL DEFAULT 0,
  created_at          timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE staff_members    ENABLE ROW LEVEL SECURITY;
ALTER TABLE services         ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_price_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_services   ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials      ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_sends ENABLE ROW LEVEL SECURITY;

-- Public read policies (only visible rows exposed to anon clients)
CREATE POLICY "public read staff_members"    ON staff_members    FOR SELECT USING (is_visible);
CREATE POLICY "public read services"         ON services         FOR SELECT USING (is_visible);
CREATE POLICY "public read service_price_lines" ON service_price_lines FOR SELECT
  USING (EXISTS (SELECT 1 FROM services s WHERE s.id = service_price_lines.service_id AND s.is_visible));
CREATE POLICY "public read staff_services"   ON staff_services   FOR SELECT
  USING (EXISTS (SELECT 1 FROM staff_members sm WHERE sm.id = staff_services.staff_id AND sm.is_visible));
CREATE POLICY "public read testimonials"     ON testimonials      FOR SELECT USING (is_visible);
CREATE POLICY "public read gallery_images"   ON gallery_images   FOR SELECT USING (is_visible);
-- newsletter_sends is admin-only; no public SELECT policy.

-- Indexes on FK columns used in joins and RLS subqueries
CREATE INDEX IF NOT EXISTS idx_service_price_lines_service_id ON service_price_lines(service_id);
CREATE INDEX IF NOT EXISTS idx_staff_services_service_id ON staff_services(service_id);

-- No authenticated-user write policies.
-- All writes go through the service role key in API routes, which bypasses RLS entirely.
-- Any authenticated-but-non-admin Supabase user therefore has read-only access
-- through the public SELECT policies above, and no write access at all.
