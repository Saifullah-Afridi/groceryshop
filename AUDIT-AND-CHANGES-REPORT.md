# Rakan Shop — Change and Realtime Audit Report

**Baseline:** `Rakan-Shop-Realtime-complete_1.zip`  
**Updated:** 19 November 2026

## Changes made

### Product and category descriptions removed
- Removed product descriptions from the customer product card.
- Removed product and category description fields from their admin forms.
- Removed product description columns and description-based search from the admin product list.
- Removed description properties from the frontend Product and Category types and their admin input types.
- Removed description from multipart API submissions, API validation, DTOs, and product search scoring.
- Product and category name translation now translates only the name field; no description text is submitted or translated.
- Removed `description` and `descriptionAr` from both Prisma `Product` and `Category` models.
- Added `api/prisma/remove-all-descriptions.sql` to drop the obsolete description columns from both tables. Run it once against the existing Supabase database.

### Jordanian Arabic seed catalog
- Replaced the old English seed product catalog with **120 single-word Jordanian Arabic product names**, exactly 20 in each of six categories.
- Category names are also provided in Jordanian Arabic: خضرة، فواكه، لحوم، ألبان، عصاير، تموين.
- The seed script sends 126 Arabic labels (six categories + 120 products) to Azure Translator in two batches (`ar` → `en`).
- Original Arabic is stored in `nameAr`; translated English is stored in `name`. This lets you compare the English result with the submitted Jordanian Arabic.
- Seed data list: `JORDANIAN-ARABIC-SEED-DATA.md`.
- The seed has **not** been executed; it requires working Azure Translator credentials and a reachable PostgreSQL database. Existing products without Arabic names are left untouched, so use a clean test database if you want to see only the 120-product catalog.

### Realtime notification review and hardening
Source review confirms the intended event flow is implemented:
1. Order create/status/cancel operations insert notification rows in the same Prisma transaction as the order change.
2. The API exposes separate admin/customer routes protected by the corresponding Rakan JWT role.
3. The API mints five-minute Supabase Realtime JWTs using `SUPABASE_JWT_SECRET`; the application JWT and server secret are not sent to the browser.
4. SQL enables RLS, grants SELECT to `authenticated`, scopes customer rows by `customerId`, scopes admin rows to admin claims, and adds `public."Notification"` to `supabase_realtime`.
5. The frontend subscribes to INSERT events, refreshes the durable list through the authenticated API, fetches on initial subscription, refreshes the Supabase token every four minutes, and retries failed/closed channels.
6. Mark-as-read writes now include the audience/customer scope in the database update itself.

**Realtime verdict:** the source implementation is coherent and has the expected security boundaries, but **live Realtime is not certified yet**. It cannot be fully tested without the target Supabase project, its legacy JWT signing secret, database publication, RLS state, and live admin/customer sessions. Follow `REALTIME-NOTIFICATIONS-SETUP.md`, run the SQL verification queries there, then complete the two-session order test. Check that the channel reaches `SUBSCRIBED`. Also inspect all existing policies on `Notification`: PostgreSQL permissive policies are OR-combined, so an older broad SELECT policy must not remain.

## Security cleanup
- Replaced the SMTP password and personal account values in `api/.env.example` with safe placeholders.
- **Important:** if the previously exposed SMTP app password was real, revoke it in the email provider and generate a new one. Editing the example file does not invalidate an already-issued credential.
- Removed the empty root `package-lock.json` because the project has no root `package.json`; API and frontend maintain their own package files.

## Checks performed

| Check | Result |
|---|---|
| ZIP extraction / archive inspection | Passed |
| API JavaScript syntax (`node --check`) | Passed |
| Seed catalog count | Passed: 20 in each of 6 categories (120 total) |
| Seed product names | Passed: all are single-word labels |
| English/Arabic locale JSON parsing | Passed |
| Product and category description fields in UI/API/model | Removed |
| Realtime code and SQL source review | Passed; live project test pending |
| Frontend production build | Not run: dependencies are not installed in this audit environment |
| Prisma schema validation / database migration | Not run: Prisma CLI and database are unavailable here |
| Live Azure Translator seed request | Not run: no API credentials were provided to this audit runtime |
| Live Supabase Realtime delivery and RLS isolation | Not run: requires the actual Supabase project |

## Remaining dependency issue
The supplied lockfiles are behind their package manifests:
- API lockfile is missing `sharp`.
- Frontend lockfile is missing `browser-image-compression` and `@supabase/supabase-js`.

An attempt to regenerate the API lockfile could not reach `registry.npmjs.org` from this environment (`EAI_AGAIN`). On your machine, run `npm install` separately inside `api/` and `frontend/` to synchronize each lockfile, then run `npm ci` and `npm run build` in `frontend/`.

## Safe deployment order
1. Revoke the exposed SMTP app password if it was real.
2. Back up the database.
3. Run `api/prisma/remove-all-descriptions.sql` once in Supabase SQL Editor.
4. Run `npx prisma generate` and `npx prisma db push` from `api/` after confirming the database backup.
5. Run `npm install` in `api/` and `frontend/` to update their lockfiles.
6. Configure the three Azure Translator variables and Realtime environment variables; keep `SUPABASE_JWT_SECRET` server-side only.
7. Run `npm run db:seed` from `api/` to translate and insert the Jordanian Arabic catalog.
8. Complete the live Realtime and customer/admin isolation tests before production.

**No live database, Supabase project, or production deployment was modified by this audit.**
