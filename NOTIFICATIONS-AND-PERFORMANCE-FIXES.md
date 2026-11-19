# Rakan Shop reliability changes

## Notifications
- Notification rows remain durable in PostgreSQL and are created in the same transaction as order creation/status changes.
- An `AFTER INSERT` trigger sends a small PostgreSQL `NOTIFY` payload after commit. Every persistent API instance maintains its own dedicated `LISTEN` connection.
- Admin and customer browsers use authenticated Server-Sent Events (SSE). The API sends only events matching the authenticated audience/customer; the browser fetches persisted notification history when it connects/reconnects or receives an event.
- There is no five-second polling and no full-page reload. Reconnection uses backoff; offline history is recovered from PostgreSQL.
- The API must run as a persistent Node.js service. The listener connection must use a PostgreSQL direct or session-mode connection (Supabase session pooler, normally port 5432), not transaction-mode pooling (normally port 6543).
- `NOTIFICATION_DATABASE_URL` can hold the dedicated session-mode connection string; if omitted, the listener falls back to `DATABASE_URL`.

## Database migrations
- `api/prisma/migrations/20261118000000_production_hardening/migration.sql` is an additive migration for the missing AdminAccount/Notification tables, archive/stock fields, indexes, and shared rate-limit storage.
- Back up the production database before applying it. Use `npm run db:migrate:deploy` in the API deployment environment. Do not use `prisma migrate reset` or `db push` against production.
- Existing installations that were originally created with `prisma db push` should compare the live schema to `schema.prisma` before applying this migration. The migration is additive and uses IF NOT EXISTS, but it cannot repair unrelated pre-existing schema drift.

## Performance and protection
- Dashboard monthly best-seller aggregation now loads order items with the orders in one query (no N+1 loop).
- Admin order, product, and customer lists use server-side pagination.
- Product suggestions query bounded database candidates instead of loading the entire catalogue for every keystroke.
- Rate limiting is stored in PostgreSQL so limits are shared between API instances. If the limiter table/database is unavailable, protected endpoints fail closed with HTTP 503.
- Product stock and low-stock thresholds are validated against the effective stored unit on partial updates.
- `/api/health` is a liveness endpoint; `/api/ready` checks PostgreSQL connectivity.

## Not included by request
Twilio Verify / WhatsApp OTP and password reset have intentionally not been implemented. The existing email verification flow remains unchanged.

## Verification limits
Static source checks were run. Full npm installation/build and live Supabase tests could not be completed in this environment because `npm ci` timed out. Test database migrations, uploads, and notification delivery in staging before production deployment.
