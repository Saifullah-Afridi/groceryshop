# Rakan Shop — Code Audit and Fix Report

**Source archive:** `Rakan Shop.zip`  
**Updated:** 19 November 2026  
**Scope:** backend correctness, customer translation, database/API performance, unused-code cleanup, and handover hygiene.

## Executive summary

This pass fixes several confirmed backend issues and improves query behavior. Azure AI Foundry has been removed. Azure Translator remains the only translation service. The existing Home and Shop UI styling was not intentionally redesigned.

This archive is **not yet certified production-ready**: dependency lockfiles could not be regenerated because this environment could not resolve `registry.npmjs.org` (`EAI_AGAIN`); frontend build, Prisma validation, live database migration, Azure Translator calls, and live Supabase Realtime tests could not be run here. Remaining limitations are listed below.

## 1. Product stock validation on partial updates — FIXED

**Problem:** a partial product update could submit `stockQuantity` or `minQuantity` without a `unit`; validation then used the default kg step rather than the product's saved unit. Changing a product's unit could also leave its existing inventory values invalid.

**Changes:**
- `api/src/modules/products/products.validation.js`: update validation now checks the effective unit and merged current/submitted inventory values.
- `api/src/modules/products/products.service.js`: calls the inventory validator using the stored product before applying an update.
- Name-only or price-only updates do not fail because of unrelated legacy inventory values; inventory-related updates validate the effective stock and threshold.

## 2. Automatic bilingual customer delivery details — IMPLEMENTED

**Problem:** the schema migration existed, but the normal registration and checkout flows did not translate and save both language versions.

**Changes:**
- `api/prisma/schema.prisma`: added `Customer.addressAr`, `Order.addressAr`, and `Order.noteAr` to the Prisma models. The existing migration `20261119010000_jordanian_arabic_customer_translations` already adds these columns.
- `api/src/lib/translate.js`: added `translateCustomerField`. It detects Arabic-script versus Latin-script input and translates to the other language with Azure Translator. The selected UI language is used as a fallback for text with no letters.
- `api/src/modules/customers/customers.validation.js` and `customers.service.js`: registration, admin customer creation, and admin address edits save both versions.
- `api/src/modules/orders/orders.validation.js` and `orders.service.js`: checkout translates and saves address and delivery instructions in both languages.
- Frontend registration and both checkout surfaces send the selected language. Customer/order types include the translated fields, and customer/order views use the selected language where updated.
- `api/prisma/backfill-customer-arabic.js`: converted the old Foundry-based backfill to Azure Translator. Run it with `npm run translate:customers` if existing rows need missing translations filled.

**Privacy:** only the address and delivery-instruction strings are sent to Azure Translator. Customer names and phone numbers are not passed to the translation function or request.

**Failure behavior:** if Azure Translator is unavailable, registration or checkout returns HTTP 503 and does not save a record with a silently missing translation. This preserves the requirement that both versions are saved, but means customers cannot complete those actions during a Translator outage.

**Language note:** Azure Translator uses its standard Arabic (`ar`) language code. The source terms can be Jordanian Arabic, but Azure Translator is not a dedicated Jordanian-dialect model. Validate real examples with the client before production.

## 3. Admin order history limited to 300 — FIXED

**Problem:** `listOrders` used `take: 300`, making older orders invisible to the admin list and search.

**Change:** removed the hard 300-row cap from `api/src/modules/orders/orders.service.js`. The admin can now retrieve older orders.

**Remaining scaling note:** the endpoint currently returns the full matching order list and the UI paginates the visible rows client-side. Server-side pagination/cursor loading is still recommended once order volume grows substantially.

## 4. Rate limiting not shared between API instances — FIXED IN ROUTING

**Problem:** routes used `express-rate-limit`'s in-memory store, while a PostgreSQL-backed limiter already existed in the project.

**Changes:**
- Authentication, customer OTP/login, checkout, and contact routes now use `databaseRateLimit` backed by the shared `RateLimitBucket` table.
- `api/src/app.js` trusts one hosting proxy hop so `req.ip` can identify the client behind the deployment proxy.
- The limiter fails closed with HTTP 503 if the database-backed protection is unavailable.
- Removed `express-rate-limit` from `api/package.json`.

**Deployment requirement:** the `RateLimitBucket` table must exist. It is created by the existing `20261118000000_production_hardening` migration. Confirm that migration/table is present before deploying these routes.

## 5. Dashboard best-seller N+1 queries — FIXED

**Problem:** the dashboard fetched monthly orders and then ran another `OrderItem.findMany` for every order.

**Change:** `api/src/modules/dashboard/dashboard.service.js` now uses database aggregates for today's/month's revenue, a single `groupBy` query for best sellers, `_count` for recent-order item counts, and a narrow product selection for inventory alerts. The per-order query loop has been removed.

## 6. Health endpoint did not check PostgreSQL — FIXED

**Change:** `GET /api/health` now runs `SELECT 1` through Prisma. It returns:
- HTTP 200 with `{ status: "ok", database: "connected" }` when PostgreSQL responds.
- HTTP 503 with `{ status: "degraded", database: "unavailable" }` when it cannot connect.

## 7. Package lockfiles missing declared dependencies — NOT FULLY FIXED (NETWORK BLOCKER)

**Detected:**
- API manifest declares `sharp`, but `api/package-lock.json` has no locked `sharp` package.
- Frontend manifest declares `browser-image-compression` and `@supabase/supabase-js`, but `frontend/package-lock.json` does not lock either package.

**Attempted:** `npm install --package-lock-only --ignore-scripts --no-audit --no-fund` in both `api/` and `frontend/`.

**Result:** both attempts failed because DNS/network access to `registry.npmjs.org` returned `EAI_AGAIN`. The API manifest was updated to remove the now-unused `express-rate-limit` dependency, but the lockfiles remain stale. Do not use `npm ci` until the lockfiles have been regenerated.

**Run locally when internet is available:**

```bash
cd api
npm install

cd ../frontend
npm install
```

Commit the resulting two lockfiles. Then run the frontend build and API Prisma checks.

## 8. Admin lists and search suggestions — PARTIALLY IMPROVED

**Changes:**
- Product search suggestions no longer load the entire product and category catalog. The service builds database `contains` filters, limits candidate products/categories, and scores only that candidate set.
- Admin customer list now selects only fields required by the list, rather than loading password/OTP fields and then dropping them in the DTO.
- Added `api/prisma/query-performance-indexes.sql` and a matching Prisma migration. They add `pg_trgm` indexes for case-insensitive product/category/customer/order search and btree indexes for common order-history access.
- Existing admin screens already paginate the displayed rows in the browser.

**Remaining limitation:** admin product/customer/order list APIs still return full matching lists, so pagination is not yet server-side. This is acceptable for the current small seed catalog but should be addressed before the store grows to many thousands of products, customers, or orders. The new SQL indexes improve filtering but do not replace server-side pagination.

## Azure AI Foundry removal

Removed all Foundry-specific integration/configuration and setup materials. Azure Translator remains in use for product/category names, seed data, customer registration addresses, checkout addresses/instructions, and the customer translation backfill.

The Arabic seed remains in place: six categories and 120 one-word Jordanian Arabic product names (20 per category). The seed stores the original Arabic in `nameAr` and the Azure Translator English output in `name`.

## Confirmed unused code/files removed

- `api/src/lib/azureAgent.js` — Foundry authentication and model-call integration.
- `api/FOUNDRY-AGENT-INSTRUCTIONS.md` and `api/AZURE-AGENT-SETUP.md` — Foundry-only setup/instructions.
- `api/src/lib/supabase.js` — unused API-side Supabase JS client (Realtime browser client remains in the frontend; server storage uses its existing REST helper).
- `api/src/modules/notifications/notificationStream.js`, `notifications.stream.controller.js`, `notifications.stream.js`, and `notifications.realtime.js` — unused in-memory/SSE notification path; active Supabase Realtime + persistent notification API is retained.
- `frontend/src/components/GlobalLoader.tsx` and `loaders.css` — unreferenced global loader.
- `frontend/src/components/QuantityStepper.tsx` — unreferenced component.
- `frontend/src/components/ShopToolbar.tsx` — unreferenced component.
- The obsolete commented-out earlier implementation at the top of `frontend/src/pages/admin/AdminOrdersPage.tsx`.
- Local `frontend/.env` — local environment file should not be distributed in a project ZIP; `.env.example` remains.
- `.git/` repository metadata/history — not required to run the handover project.
- Outdated root audit/deployment snapshots superseded by this report: `AUDIT-AND-CHANGES-REPORT.md`, `CODE-AUDIT-REPORT.md`, `DEPLOYMENT.md`, `FINAL_TEST_REPORT.txt`, `NOTIFICATIONS-AND-PERFORMANCE-FIXES.md`, and `PRODUCTION-FIXES-DEPLOYMENT.md`.

The customer Arabic backfill file was **not** deleted; it was converted from Foundry to Azure Translator.

## Database SQL to apply

For an existing Supabase database, run `api/prisma/query-performance-indexes.sql` in Supabase SQL Editor. It creates the search indexes and enables `pg_trgm` if permitted. The address translation columns are covered by the existing `20261119010000_jordanian_arabic_customer_translations` migration; if those columns are not yet present, run `npx prisma db push` from `api/` after reviewing the schema diff.

## Validation performed in this environment

| Check | Result |
|---|---|
| `node --check` across API source and Prisma JS files | Passed |
| API/frontend package JSON and locale JSON parsing | Passed |
| Seed static count | Passed: 120 products, 20 in each of six categories |
| Seed name format | Passed: no multiword product names found |
| Foundry code/config reference scan | Passed: no Foundry integration/config references remain |
| Product/category description fields in Prisma schema | Passed: none present |
| ZIP archive integrity | Passed (`unzip -t`) |
| Frontend TypeScript/build | Not completed: dependencies are absent; global `tsc` reports missing React/Vite/library modules |
| Prisma schema validation/client generation | Not run: Prisma CLI and dependencies are not installed in this environment |
| Live PostgreSQL migration/health/rate-limit test | Not run: no project DB connection supplied |
| Live Azure Translator calls | Not run: no API credentials supplied to this environment |
| Live Supabase Realtime/RLS delivery | Not run: requires the actual Supabase project and customer/admin sessions |

## Recommended next steps

1. Regenerate both package lockfiles locally with `npm install` in `api/` and `frontend/`.
2. Run `npx prisma db push` and `npx prisma generate` in `api/` against the test database after reviewing the schema diff.
3. Run `api/prisma/query-performance-indexes.sql` in Supabase SQL Editor.
4. Configure Azure Translator variables in `api/.env` and test registration/checkout once with English text and once with Arabic text, including English text entered while the Arabic UI is selected and vice versa.
5. Confirm database rate limiting and `/api/health` against the test deployment.
6. Run frontend `npm run build` and test product stock updates, customer registration, checkout, admin order history, dashboard, notifications, and language switching.
7. Implement server-side pagination before the admin lists become large.

**No live Supabase database, Azure Translator resource, or production deployment was modified by this code audit.**
