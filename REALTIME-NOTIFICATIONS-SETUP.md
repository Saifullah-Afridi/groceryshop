# Rakan Shop — Supabase Realtime notifications setup

The API continues to save notifications in PostgreSQL. Supabase Realtime listens for new rows in `public."Notification"`; the browser receives an INSERT event and reloads the durable notification list through the authenticated Rakan API. The old 10-second polling loop has been removed.

## 1. Run the SQL (one time)

Open Supabase Dashboard → SQL Editor and run the complete file:

`api/prisma/enable-notification-realtime.sql`

This enables row-level security, grants read permission to the `authenticated` database role, adds an audience/customer-specific SELECT policy, and adds the table to the `supabase_realtime` publication. The policy allows admins to see only ADMIN notification rows and customers to see only their own CUSTOMER rows.

## 2. Backend environment — Vercel project `rakan-api`

Keep the existing server variables. Add:

- `SUPABASE_JWT_SECRET` = the Supabase project's legacy JWT signing secret from Project Settings → API → JWT Settings.

This secret is server-only. The API uses it to mint a five-minute Supabase Realtime access token only after validating the user's existing Rakan JWT. The Rakan JWT is never sent to Supabase.

**Important compatibility check:** this implementation signs short-lived tokens with the project's legacy HS256 JWT secret. If the project uses only asymmetric signing keys and the legacy JWT secret is unavailable, do not substitute the publishable key, secret API key, service-role key, or the Rakan `JWT_SECRET`. The token-signing approach must be adapted to the project's signing-key configuration before enabling Realtime.

## 3. Frontend environment — Vercel project `groceryshop`

Add these two public variables:

- `VITE_SUPABASE_URL` = the same project URL used by the API's `SUPABASE_URL`.
- `VITE_SUPABASE_PUBLISHABLE_KEY` = the `sb_publishable_...` key (or legacy anon key) from the same Supabase project.

These values are safe for browser use. Never put `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or `SUPABASE_JWT_SECRET` in the frontend.

For local development, put the two `VITE_` variables in `frontend/.env`, and put `SUPABASE_JWT_SECRET` in `api/.env`.

## 4. Install and deploy

From `frontend/` run:

```bash
npm install
npm run build
```

`@supabase/supabase-js` is a frontend dependency. `npm install` updates `frontend/package-lock.json` to include it.

From `api/` run:

```bash
npm install
npm start
```

Redeploy both Vercel projects after adding the environment variables.

## 5. Test both directions

1. Sign in as admin in one browser and as a customer in another.
2. Place an order as the customer. The admin notification badge/list should update without a page refresh.
3. Change the order status as admin. The customer's notification badge/list should update without a page refresh.
4. Mark notifications read, reload, and confirm read state/history persists.
5. Confirm a customer cannot receive another customer's notification.
6. Close/reopen the customer browser, then confirm notifications created while offline appear on the next visit.

If Realtime authorization fails, verify the SQL policy/publication, exact matching Supabase project URL and publishable key, and that `SUPABASE_JWT_SECRET` is the project's actual legacy JWT signing secret.


## 6. Order query performance

Run `api/prisma/order-notification-performance.sql` once in the Supabase SQL Editor. It adds composite indexes for the order and notification list queries, plus trigram indexes for the admin's case-insensitive name/phone/city search.

The API order service also reserves/restores all stock lines with one conditional SQL statement rather than one Prisma request per product. Order cancellation/status updates reuse the order row already loaded inside the transaction instead of performing another read. Interactive order transactions now have a 15-second timeout and a 10-second connection-acquisition wait.

These changes reduce round trips; they do not replace checking Supabase connection health, pooler mode, or database load if latency remains high.
