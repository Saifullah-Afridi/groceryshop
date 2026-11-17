-- Creates the administrator credentials table expected by Prisma.
-- Safe to run when the table is missing; it does not delete or reset existing data.
CREATE TABLE IF NOT EXISTS public."AdminAccount" (
  "id" TEXT NOT NULL DEFAULT 'primary',
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdminAccount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AdminAccount_email_key"
  ON public."AdminAccount" ("email");
