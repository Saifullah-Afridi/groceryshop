# Rakan Shop API

Express (JavaScript ES modules) + Prisma + Supabase PostgreSQL and Storage.

## Setup

1. Create a public Supabase Storage bucket named `rakan`.
2. Copy `api/.env.example` to `api/.env` and configure the values. Keep `.env` private.
3. Configure Azure Translator in the API environment: `AZURE_TRANSLATOR_KEY`, `AZURE_TRANSLATOR_REGION`, and `AZURE_TRANSLATOR_ENDPOINT`.
4. Install dependencies with `npm install`.
5. Apply the Prisma schema to a development database with `npm run db:push`.
6. Run `api/prisma/enable-notification-realtime.sql` in Supabase SQL Editor and follow `REALTIME-NOTIFICATIONS-SETUP.md` to verify RLS and Realtime.
7. Run `npm run db:seed` to create six Jordanian Arabic categories and 20 one-word Arabic product names per category. The seed calls Azure Translator and stores the original Arabic in `nameAr` and the English translation in `name`.
8. Start the API with `npm run dev`.

For production, use a database backup and a controlled migration process. Do not run `prisma db push` against production without reviewing the schema diff.

## Customer address translation

Registration and checkout send the current UI language (`en` or `ar`) with the submitted delivery address and instructions. The API sends only the address/instruction text to Azure Translator, never customer names or phone numbers. It stores English in `address`/`note` and Arabic in `addressAr`/`noteAr`. If translation is unavailable, registration or checkout returns HTTP 503 and does not save a partially translated record.

The existing migration `20261119010000_jordanian_arabic_customer_translations` adds these columns. The Prisma schema now includes them. For existing deployments, verify that migration is applied before running the updated API.

To fill missing translations on older rows, run `npm run translate:customers` after configuring Azure Translator. The script preserves any existing translation pair.

## Shared rate limiting

Authentication, OTP, checkout, and contact routes use the PostgreSQL `RateLimitBucket` table, so counters are shared across API instances. The table is created by the `20261118000000_production_hardening` migration. The API fails closed with HTTP 503 if the shared limiter is unavailable.

## Health check

`GET /api/health` checks PostgreSQL with `SELECT 1`. It returns HTTP 200 when the database is reachable and HTTP 503 when it is not.

## Query performance

- Search suggestions query a bounded candidate set instead of loading the full product/category catalogue.
- Dashboard totals use database aggregates, and best sellers use one `groupBy` query rather than an N+1 query loop.
- `api/prisma/query-performance-indexes.sql` adds trigram indexes for case-insensitive contains searches and btree indexes for order history. Run it in Supabase SQL Editor or apply the matching migration.
- Admin pages already paginate visible rows in the browser. The current list endpoints still return the full admin list; server-side pagination is a remaining scaling improvement for very large customer/product datasets.

## API features

- Admin and customer authentication are separate.
- Order prices, discounts, stock reservations, delivery fees, and totals are calculated by the API.
- Stock reservations use conditional database updates to prevent concurrent overselling.
- Product and category descriptions are not part of the data model.
- Notifications are persisted in PostgreSQL and delivered through Supabase Realtime.

## Environment and build

Run `npm install` separately in `api/` and `frontend/`. Then run `npm run build` in `frontend/`. Run `npm run prisma:generate` in `api/` after changing `prisma/schema.prisma`.
