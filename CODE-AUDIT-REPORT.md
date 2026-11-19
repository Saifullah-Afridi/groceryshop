# Rakan Shop — Senior Code Review & Test Report

**Reviewed archive:** `Rakan Shop(3).zip`  
**Review date:** 18 November 2026  
**Review type:** Static code review, source consistency checks, and limited syntax validation  
**Verdict:** **NOT PRODUCTION READY**

The project contains substantial working feature code, but important production blockers remain. This review did not connect to the live Supabase project or run end-to-end tests.

## Changes made in this cleaned copy

1. Removed confirmed unreferenced frontend files:
   - `frontend/src/components/GlobalLoader.tsx`
   - `frontend/src/components/loaders.css`
   - `frontend/src/components/QuantityStepper.tsx`
   - `frontend/src/components/ShopToolbar.tsx`
   - `frontend/src/pages/CheckoutPage.tsx` (the route already redirects `/checkout` to `/shop`)
2. Removed unused Supabase client/token implementation:
   - `api/src/lib/supabase.js` (not imported anywhere; also imported a package absent from the API dependencies)
   - unused `realtimeToken` handler and its JWT/env references
   - stale Supabase Realtime SQL/setup instructions that did not match the actual running SSE implementation
   - unused frontend `@supabase/supabase-js` dependency
3. Enforced the requested archive-only product workflow:
   - Removed permanent product deletion from the admin UI.
   - Removed `DELETE /api/products/:id` route, controller, service function, frontend service, and hook.
   - Products can now be archived and restored; order item snapshots remain attached to the order.
4. Corrected the backend upload-size error message from 5 MB to 4 MB.
5. Removed the local frontend `.env` from the ZIP and added safe `.env.example` files for frontend and API.
6. Fixed category partial updates to default the translation language to English when the client omits it.
7. Updated deployment and notification documentation so it no longer claims that the app is using Supabase Realtime.

These changes do not alter the Home or Shop visual designs.

## Findings

### P0 — Release blockers

#### 1. Notifications are not reliable on Vercel / multiple API instances
**Files:** `api/src/modules/notifications/notifications.realtime.js`, `api/src/modules/notifications/notifications.stream.js`, `api/src/modules/orders/orders.service.js`, `frontend/src/components/NotificationBell.tsx`

The current implementation stores SSE subscribers in an in-memory JavaScript `Set`. The stream request and the order/status mutation can be handled by different serverless instances. Those instances do not share memory, so the event is lost. The frontend considers an open stream connected and suppresses its fallback refresh, so the notification may remain unseen until another refresh/focus event.

**Required:** Replace the process-local event bus with a shared transport (properly authorized Supabase Realtime, Redis/pub-sub, etc.) or implement durable polling that runs even when the SSE connection appears connected. Test across two separate API instances, not just two tabs on one local server.

#### 2. The live database is behind the Prisma schema
**Evidence:** The runtime error supplied during this review reports `P2021` because `public.AdminAccount` does not exist. The schema defines `model AdminAccount`.

The same database must also contain the current `Product.isArchived` field and `Notification` table. The repository has additive SQL scripts, but they are not tracked as a proper Prisma migration history.

**Required:** Back up the database, compare its live schema with `api/prisma/schema.prisma`, apply reviewed additive changes (including `api/prisma/manual-admin-account-migration.sql` and the relevant feature SQL), then run `npx prisma generate`. Do not reset production data.

#### 3. No production-safe migration history
**Files:** `api/prisma/`, `api/package.json`, `DEPLOYMENT.md`

There is no `api/prisma/migrations/` directory. Deployment instructions previously relied on `prisma db push`. That is convenient for development but is not a controlled production migration process.

**Required:** Establish checked-in Prisma migrations or a reviewed SQL migration process with a deployment log and backup/rollback plan.

#### 4. Customer OTP implementation does not match the discussed WhatsApp/Twilio flow
**Files:** `api/src/modules/customers/customers.service.js`, `api/src/modules/customers/customers.routes.js`, `api/package.json`, `api/prisma/schema.prisma`

The current code sends a six-digit code by email through Nodemailer. It has no Twilio Verify integration, no WhatsApp number field, and no forgot-password/reset-password endpoints.

**Required:** If the agreed requirement is Twilio Verify over WhatsApp for registration and password reset, implement and test that flow before release. Normal login can remain phone/email plus password as agreed.

### P1 — High priority

#### 5. Product/category writes depend on Azure Translator configuration
**Files:** `api/src/lib/translate.js`, `api/src/modules/products/products.service.js`, `api/src/modules/categories/categories.service.js`, `api/.env.example`

`buildBilingualContent()` calls Azure Translator whenever a non-empty name/description is submitted in one language. If the Azure credentials are not configured, product/category create and edit requests fail. The original archive had no API `.env.example`; the cleaned copy now lists these variables and marks them as required for automatic translation.

**Required:** Either configure Azure Translator in production and make this requirement explicit, or implement a graceful manual-translation/fallback path. If the business wants to operate without Azure Translator, the service must be changed to allow manual translations or a safe fallback.

#### 6. Admin dashboard performs N+1 database queries
**File:** `api/src/modules/dashboard/dashboard.service.js`

The monthly orders query does not include `items`, then loops over every order and issues a separate `OrderItem.findMany`. This creates one extra database query per monthly order and will become slow as order volume grows.

**Required:** Fetch monthly orders with `include: { items: true }` or use a grouped aggregate query.

#### 7. Admin order history is silently capped at 300
**File:** `api/src/modules/orders/orders.service.js`

`listOrders()` uses `take: 300` and has no pagination cursor/page parameters. Once there are more than 300 orders, older orders are not available through this endpoint.

**Required:** Add stable server-side pagination and a UI control or cursor-based loading.

#### 8. Rate limiting uses per-process memory
**Files:** `api/src/modules/auth/auth.routes.js`, `api/src/modules/customers/customers.routes.js`, `api/src/modules/contact/contact.routes.js`, `api/src/modules/orders/orders.routes.js`

The `express-rate-limit` configurations use the default in-memory store. Limits are not shared between serverless instances and reset when instances restart.

**Required:** Use a shared rate-limit store (for example Redis/Upstash) for production, and consider separate per-account limits for login and OTP verification.

#### 9. Dashboard health endpoint does not check dependencies
**File:** `api/src/app.js`

`GET /api/health` always returns `{ status: "ok" }`, even when PostgreSQL is unreachable. This is a liveness response, not a readiness check.

**Required:** Add a readiness endpoint that performs a lightweight database check and returns a non-200 status when required dependencies are unavailable.

#### 10. Product stock validation can be bypassed on partial updates
**File:** `api/src/modules/products/products.validation.js`

The update schema validates stock step sizes only when `unit` is included in the same request. The comment says the service re-checks against the stored unit, but `updateProduct()` does not perform that check. A partial API update can therefore store stock quantities inconsistent with the product unit.

**Required:** Validate the effective unit and effective stock/threshold values using the current database record plus submitted changes.

#### 11. Notification history is not visible in the UI
**Files:** `frontend/src/components/NotificationBell.tsx`, `api/src/modules/notifications/notifications.service.js`

The API returns recent notifications including read rows, but the frontend immediately filters the result to unread rows. Once a notification is marked read, it disappears and there is no history view in the UI.

**Required:** Add a notification history view or an all/read/unread view if notification history remains a requirement.

### P2 — Medium priority

#### 12. Search suggestions load the entire product catalogue for each query
**Files:** `api/src/modules/products/products.service.js`, `frontend/src/components/NavbarSearch.tsx`

The UI debounces input by 220 ms, but each suggestion request loads every active product and category into memory and scores them in JavaScript. This will become expensive with a large catalogue.

**Required:** Move search to indexed database queries, use bounded candidate sets, or introduce a search index as the catalogue grows.

#### 13. Admin product/customer lists are unbounded
**Files:** `api/src/modules/products/products.service.js`, `api/src/modules/customers/customers.service.js`

Admin product and customer list endpoints fetch all records and rely on client-side pagination/filtering. This can increase response time and memory use.

**Required:** Add server-side pagination, search, and sorting.

#### 14. Image deletion failures are silently ignored
**File:** `api/src/lib/storage.js`

`deleteImage()` ignores network errors and does not check whether Supabase returned a non-success HTTP status. This can leave orphaned images in storage without any operational signal.

**Required:** Log failed cleanup operations safely and add a scheduled orphan-file cleanup strategy.

#### 15. Health, database pool, and storage have not been integration-tested
The earlier runtime output also included a connection failure to the Supabase pooler. Static review cannot establish whether this is a temporary network/pool exhaustion issue or a persistent configuration issue.

**Required:** Verify the exact pooler connection string/port, pool mode, connection limits, and production request concurrency. Test image upload/delete against the actual bucket.

## Validation performed

| Check | Result |
|---|---|
| API JavaScript syntax (`node --check` over `api/src` and `api/prisma` JS files) | PASS |
| Package JSON parsing | PASS |
| Frontend dependency lock after removing unused Supabase package | Updated |
| Full frontend dependency install | NOT COMPLETED — `npm ci` timed out |
| Frontend TypeScript/Vite production build | NOT RUN — dependencies unavailable |
| Prisma schema validation/generation | NOT RUN — API dependencies not installed in this review environment |
| Live database migrations | NOT RUN |
| Supabase Storage upload/delete | NOT RUN |
| Live notifications across instances | NOT RUN; code review identifies a cross-instance design blocker |
| Full customer checkout/order workflow | NOT RUN |
| Automated unit/integration test suite | No test script or test suite was present in the reviewed package manifests/source tree |

## Release recommendation

Do not deploy this archive as a production release yet. The cleanup removes unused code and prevents accidental permanent product deletion, but it does not solve the P0 blockers.

Recommended order:
1. Apply and verify the database schema safely.
2. Apply and verify the PostgreSQL notification trigger and persistent SSE listener described in the realtime implementation addendum.
3. Implement the agreed Twilio WhatsApp OTP and password-reset flow.
4. Fix dashboard N+1 queries, order pagination, shared rate limiting, and stock-update validation.
5. Complete dependency installation, frontend build, Prisma validation, and end-to-end tests against a staging Supabase project.


## Follow-up hardening pass (18 November 2026)

Implemented in this archive:
1. The initial hardening archive used database-backed polling. The subsequent realtime implementation replaces that temporary approach with PostgreSQL LISTEN/NOTIFY and authenticated SSE across persistent API instances; see the final realtime implementation addendum and deployment guide.
2. Added unread/recent-history tabs to the existing notification dropdown without changing the site's visual theme.
3. Added an additive Prisma migration for AdminAccount, Notification, Product.isArchived, Order.stockReserved, indexes, and RateLimitBucket.
4. Added a PostgreSQL-backed shared rate limiter and replaced in-memory express-rate-limit usage on admin login/settings, customer auth, order creation, and contact form routes.
5. Removed the 300-order hard cap and added server-side order pagination plus status counts.
6. Added server-side pagination for admin product and customer lists.
7. Fixed effective-unit stock-step validation for partial product updates.
8. Fixed dashboard N+1 item loading.
9. Bounded database candidates for product search suggestions.
10. Added `/api/ready` database readiness check and configured Express proxy trust for Vercel client IPs.

Not implemented by explicit user instruction: Twilio WhatsApp OTP and password reset. Existing email OTP remains.

Validation caveat: `npm ci` for the frontend timed out in this environment, so the TypeScript/Vite build could not be completed. API JavaScript syntax checks and JSON parsing passed. Live database migration, Supabase Storage, and cross-instance browser testing still require the user's staging environment.


## Realtime notification implementation (18 November 2026)

The temporary five-second polling implementation has been removed. The final project now uses a PostgreSQL `AFTER INSERT` trigger to publish a compact `NOTIFY` payload after the notification transaction commits. Each persistent API process opens its own dedicated PostgreSQL session connection and executes `LISTEN`; it forwards matching events over authenticated SSE to admin or the owning customer. The browser reconnects with backoff and reloads persisted notification history after reconnection.

The API must run as a persistent Node.js service, not as Vercel serverless functions. Set `NOTIFICATION_DATABASE_URL` to a direct or Supabase session-mode PostgreSQL URL (normally port 5432). The npm registry was unreachable during this workspace run, so `pg` was added to `api/package.json` but the API lockfile could not be regenerated here; run `npm install` inside `api/` before deployment and commit the resulting `package-lock.json`.
