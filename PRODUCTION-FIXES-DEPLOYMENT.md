# Rakan Shop — apply the reliability fixes

## Before touching the production database

1. Download a fresh Supabase backup and verify that it can be restored.
2. Confirm the API's `DATABASE_URL` points to the intended project.
3. Do not run `prisma db push`, `prisma migrate reset`, or SQL that drops tables.

## Existing Rakan database (previously managed with `prisma db push`)

From the `api/` directory:

```bash
npm ci
npx prisma generate
npx prisma migrate status
```

If there is no `_prisma_migrations` table/history, inspect the current tables against `api/prisma/migrations/20261117000000_initial_baseline/migration.sql`. The baseline is the original core schema. Confirm that the core tables and columns already exist before marking it applied:

```bash
npx prisma migrate resolve --applied 20261117000000_initial_baseline
```

This command only records the baseline; it does not create missing base tables. The next migration adds the feature objects/columns that may be absent, including `AdminAccount`, `Notification`, `RateLimitBucket`, `Product.isArchived`, and `Order.stockReserved`:

```bash
npm run db:migrate:deploy
npx prisma migrate status
```

If `_prisma_migrations` already exists with a different migration history, stop and reconcile it before proceeding. If any core baseline table/column is missing, do not mark the baseline applied; inspect and plan a separate migration first.

## New/empty database

Do not mark the baseline as applied. Run:

```bash
npm ci
npx prisma generate
npm run db:migrate:deploy
```

This runs the baseline and then the additive hardening migration.

## Deploy and verify

1. Deploy the API after the migrations have completed.
2. Check `GET /api/health` (process liveness) and `GET /api/ready` (database readiness).
3. Deploy the frontend.
4. Test customer and admin notification delivery. Notifications should appear within about 5 seconds on a visible tab; this implementation uses persistent database polling, not websocket push.
5. Test admin product/customer/order pagination, archive/restore, order status transitions, discounts, stock reservation, and image uploads.
6. Test the database-backed rate limit from separate API instances.

Twilio WhatsApp OTP and password reset are intentionally not part of this release. Existing email OTP remains unchanged.
