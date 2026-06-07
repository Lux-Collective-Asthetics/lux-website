-- Add unique unsubscribe token to each subscriber.
-- DEFAULT gen_random_uuid() means existing rows get tokens automatically.
-- New inserts via upsert (which omits the column) also get a token via DEFAULT.
ALTER TABLE subscribers
  ADD COLUMN IF NOT EXISTS token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE;
