-- Run this AFTER applying the updated Prisma schema (which adds ON_THE_WAY).
-- Existing in-progress statuses are consolidated into the single ON_THE_WAY status.
UPDATE "Order"
SET "status" = 'ON_THE_WAY'
WHERE "status" IN ('CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY');
