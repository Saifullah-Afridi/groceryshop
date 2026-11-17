-- Feature schema changes for product archiving and persistent notifications.
-- Preferred deployment command: npm run db:push (from the api directory).
-- This SQL is provided for environments where schema changes are applied manually.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isArchived" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "Notification" (
  "id" SERIAL PRIMARY KEY,
  "audience" TEXT NOT NULL,
  "customerId" INTEGER,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "orderId" INTEGER,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Notification_audience_isRead_createdAt_idx"
  ON "Notification"("audience", "isRead", "createdAt");
CREATE INDEX IF NOT EXISTS "Notification_customerId_isRead_createdAt_idx"
  ON "Notification"("customerId", "isRead", "createdAt");
