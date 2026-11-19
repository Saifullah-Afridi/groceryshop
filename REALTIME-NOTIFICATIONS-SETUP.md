# Rakan Shop — Supabase Realtime notifications setup

The API continues to save notifications in PostgreSQL. Supabase Realtime listens for new rows in `public."Notification"`; the browser receives an INSERT event and reloads the durable notification list through the authenticated Rakan API. The old 10-second polling loop has been removed.

## 1. Run the SQL (one time)

Open Supabase Dashboard → SQL Editor and run the complete file:

`api/prisma/enable-notification-realtime.sql`

This enables row-level security, grants schema/table read permission to the `authenticated` database role, adds an audience/customer-specific SELECT policy, and adds the table to the `supabase_realtime` publication. The policy allows admins to see only ADMIN notification rows and customers to see only their own CUSTOMER rows. The frontend listens only for INSERT events; it then reloads the durable list through the authenticated Rakan API. Mark-as-read operations are also scoped by audience/customer in the database write.

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


## 6. Verify the database configuration

After running the setup SQL, run these queries in Supabase SQL Editor. The first must return the `Notification` table in `supabase_realtime`; the second must show the `rakan_notifications_realtime_select` policy with RLS enabled. Also review every other policy on this table: PostgreSQL permissive policies are combined with OR, so an older broad SELECT policy could weaken the audience restriction.

```sql
SELECT pubname, schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND schemaname = 'public'
  AND tablename = 'Notification';

SELECT policyname, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'Notification';

SELECT relrowsecurity, relforcerowsecurity
FROM pg_class
WHERE oid = 'public."Notification"'::regclass;
```

The expected result is one publication row, an enabled RLS flag, and no other permissive SELECT policy that grants broader access. The `authenticated` role must have SELECT permission.

## 7. Live end-to-end verification

Source review confirms the intended flow: order transaction inserts a persistent notification; Supabase emits the INSERT; the browser refreshes through the authenticated API; and RLS filters the Realtime event by audience/customer. A source-code audit cannot prove that your live Supabase project has the correct legacy JWT secret, publication, grants, or network connectivity. Complete the two-session test in section 5 after deployment. Check browser console and API logs for subscription status `SUBSCRIBED`; `CHANNEL_ERROR`, `TIMED_OUT`, or `CLOSED` trigger a reconnect attempt.
