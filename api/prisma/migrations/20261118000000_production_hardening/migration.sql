-- Additive production-hardening migration. Safe to apply to an existing store.
-- It deliberately does not drop or rewrite customer, product, or order records.

ALTER TABLE IF EXISTS public."Product"
  ADD COLUMN IF NOT EXISTS "isArchived" BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE IF EXISTS public."Order"
  ADD COLUMN IF NOT EXISTS "stockReserved" BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public."AdminAccount" (
  "id" TEXT NOT NULL DEFAULT 'primary',
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminAccount_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AdminAccount_email_key"
  ON public."AdminAccount"("email");

CREATE TABLE IF NOT EXISTS public."Notification" (
  "id" SERIAL NOT NULL,
  "audience" TEXT NOT NULL,
  "customerId" INTEGER,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "orderId" INTEGER,
  "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Notification_audience_isRead_createdAt_idx"
  ON public."Notification"("audience", "isRead", "createdAt");
CREATE INDEX IF NOT EXISTS "Notification_customerId_isRead_createdAt_idx"
  ON public."Notification"("customerId", "isRead", "createdAt");
CREATE INDEX IF NOT EXISTS "Notification_audience_createdAt_idx"
  ON public."Notification"("audience", "createdAt");
CREATE INDEX IF NOT EXISTS "Notification_customerId_createdAt_idx"
  ON public."Notification"("customerId", "createdAt");

CREATE TABLE IF NOT EXISTS public."RateLimitBucket" (
  "key" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "resetAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);
CREATE INDEX IF NOT EXISTS "RateLimitBucket_resetAt_idx"
  ON public."RateLimitBucket"("resetAt");

CREATE INDEX IF NOT EXISTS "Order_customerId_id_idx" ON public."Order"("customerId", "id");
CREATE INDEX IF NOT EXISTS "Order_status_id_idx" ON public."Order"("status", "id");
