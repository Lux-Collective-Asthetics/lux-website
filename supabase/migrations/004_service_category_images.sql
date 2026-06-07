-- Adds an optional image URL to each service category.
-- Used by the public service slideshow and the homepage parallax scroll sections.
-- When set via admin, overrides the static fallback images baked into those components.

alter table service_categories add column if not exists image_url text;
