# Rakan Shop fixes — notifications and order performance

## What changed

- Rebuilt `frontend/src/components/NotificationBell.tsx` with a fixed-width header action, readable notification rows, bounded scrolling, connection state, reconnect handling, and optimistic read actions.
- Removed the broad button-size selector from `frontend/src/components/admin/AdminLayout.tsx`. It was forcing every nested button in the bell (including “Mark all as read”) into a 36px square.
- The bell now listens for Notification INSERT and UPDATE events. On an event it refreshes the notification list and invalidates the relevant React Query caches:
  - Admin: order list and dashboard.
  - Customer: personal order history.
- Removed the routine 30-second order-list polling. A 60-second fallback refresh remains only while the Supabase Realtime channel is disconnected.
- Optimized stock reservation/restoration in `api/src/modules/orders/orders.service.js`: one conditional SQL statement handles all product lines instead of one Prisma request per item. The operation remains inside the order transaction so stock and order creation/cancellation stay atomic.
- Removed redundant final order SELECTs from cancellation and status-update transactions.
- Set explicit transaction wait/timeout limits (`maxWait: 10000`, `timeout: 15000`).
- Added composite order/notification indexes to `api/prisma/schema.prisma` and a one-time SQL script for those indexes plus trigram indexes for admin order search.

## Required Supabase setup

Realtime will not work just because the frontend code is updated. The Supabase database and API must be configured:

1. Open the Supabase SQL Editor and run `api/prisma/enable-notification-realtime.sql`.
2. In the API environment (`api/.env` locally, or the API hosting provider), set `SUPABASE_JWT_SECRET` to the **legacy JWT signing secret from the same Supabase project** used by `SUPABASE_URL` and `DATABASE_URL`. Do not use the Supabase publishable key, service-role key, or the Rakan `JWT_SECRET`.
3. Confirm the frontend `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` refer to that same Supabase project. Restart Vite after changing frontend environment variables.
4. Restart/redeploy the API after changing its environment variables.
5. Run `api/prisma/order-notification-performance.sql` once in the Supabase SQL Editor to add the performance indexes.

## Test

- Keep an admin session open in one browser and a customer session open in another.
- Place an order as the customer. The admin notification should appear without reloading, and the admin order list/dashboard should refresh.
- Change the order status as admin. The customer's notification and order history should update without reloading.
- Mark one notification and all notifications as read. Verify the unread badge changes immediately and stays correct after reopening.
- Temporarily disable Realtime or remove the network. The UI should show the reconnecting state and the fallback should refresh data while the page is visible.

## Validation performed

- `node --check` passed for all 52 API JavaScript source files.
- TypeScript/JSX transpile syntax checks passed for the four changed frontend TypeScript files.
- A full Vite build and live Supabase/database test were not run in this environment because the uploaded project does not include installed `node_modules` or the API runtime environment/credentials.
