-- Rakan Shop query-performance indexes.
-- Run once in Supabase SQL Editor. These are additive and do not alter existing rows.

CREATE INDEX IF NOT EXISTS "Order_customerId_id_idx"
  ON public."Order" ("customerId", "id");

CREATE INDEX IF NOT EXISTS "Order_status_id_idx"
  ON public."Order" ("status", "id");

CREATE INDEX IF NOT EXISTS "Notification_audience_createdAt_idx"
  ON public."Notification" ("audience", "createdAt");

CREATE INDEX IF NOT EXISTS "Notification_customerId_createdAt_idx"
  ON public."Notification" ("customerId", "createdAt");

-- The admin order search uses case-insensitive substring matching on these fields.
-- Trigram indexes prevent full-table scans for typical contains searches.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "Order_name_trgm_idx"
  ON public."Order" USING GIN ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Order_phone_trgm_idx"
  ON public."Order" USING GIN ("phone" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Order_city_trgm_idx"
  ON public."Order" USING GIN ("city" gin_trgm_ops);
