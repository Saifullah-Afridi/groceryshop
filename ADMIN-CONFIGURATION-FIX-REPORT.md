# Rakan Shop — Admin Configuration / Vercel Build Fix

## Root cause

`AdminConfigurationPage.tsx` imported `getAdminSettings` and `updateAdminSettings`, but `frontend/src/services/authService.ts` exported neither function. The page's `settings` callback consequently had no inferred response type.

The backend did not previously expose admin settings routes. Its original admin login checked `ADMIN_EMAIL` and `ADMIN_PASSWORD` directly from environment variables. The existing Prisma migration `20261118000000_production_hardening` already created a singleton `AdminAccount` table, but the Prisma schema and authentication service did not use it.

## Changes made

### Frontend

- Added `AdminSettings`, `UpdateAdminSettingsInput`, and `UpdateAdminSettingsResult` TypeScript interfaces to `frontend/src/services/authService.ts`.
- Added typed `getAdminSettings()` (`GET /auth/settings`) and `updateAdminSettings()` (`PUT /auth/settings`) service functions using the existing `api()` client and admin bearer token.
- Explicitly typed the settings load callback in `AdminConfigurationPage.tsx`.
- Updated the authenticated admin context's email and persisted session after a successful settings update, so the admin sidebar does not continue showing the old email.
- Preserved the existing configuration page and its visual design.

### Backend

- Added the `AdminAccount` Prisma model matching the table already created by the production-hardening migration.
- Added authenticated `GET /api/auth/settings` and `PUT /api/auth/settings` routes. Both require the existing `requireAdmin` middleware.
- Added Zod validation for the update payload: valid email, non-empty current password, and a new password of at least eight characters.
- Implemented credential persistence using `bcryptjs` with 12 salt rounds. Passwords are never returned by the settings API and are stored only as hashes.
- Preserved compatibility with existing deployments: if no `AdminAccount` row exists, the first successful login using the current `ADMIN_EMAIL` / `ADMIN_PASSWORD` environment variables creates the initial database-backed account. Later logins use the database account.
- Added duplicate-email handling and current-password verification before changing credentials.

## API contract

### `GET /api/auth/settings`

Requires an admin bearer token.

Response:

```json
{ "email": "admin@example.com" }
```

### `PUT /api/auth/settings`

Requires an admin bearer token.

Request:

```json
{
  "currentPassword": "current-password",
  "email": "new-admin@example.com",
  "password": "new-password-at-least-8-chars"
}
```

Response:

```json
{
  "email": "new-admin@example.com",
  "message": "Administrator login details updated successfully."
}
```

## Database / migration

No new SQL migration is required for this change because the supplied project already contains the `AdminAccount` table definition in:

`api/prisma/migrations/20261118000000_production_hardening/migration.sql`

The Prisma model was added to `api/prisma/schema.prisma` to make that existing table available through `prisma.adminAccount`.

For a deployment where migrations have not yet been applied, run `npx prisma migrate deploy` from `api` before deploying the backend.

## Validation performed

- `node --check` across every JavaScript file under `api/src`: **PASS**.
- Structural check that the Prisma `AdminAccount` model matches the existing migration's columns: **PASS**.
- Full frontend TypeScript check: **NOT VERIFIED**. `npm ci` could not complete in this environment (dependency installation timed out). Running the globally available `tsc --noEmit` therefore reported missing project dependencies and React type declarations, causing cascading JSX/type errors. Those are environment/dependency-resolution errors and cannot be treated as a successful build or as confirmed application defects.
- Vite production build: **NOT RUN**, because the frontend dependencies could not be installed.
- Prisma CLI validation / client generation: **NOT RUN**, because backend dependencies could not be installed.
- Authenticated API and PostgreSQL integration tests: **NOT RUN**, because no database credentials or running database were supplied.

## Deployment commands

From `api`:

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npx prisma validate
```

From `frontend`:

```bash
npm ci
npx tsc --noEmit
npm run build
```

Ensure the API deployment has `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` configured. Keep `ADMIN_EMAIL` and `ADMIN_PASSWORD` set during the transition because they are used to bootstrap the database account on the first successful login when no `AdminAccount` row exists.

## Remaining security consideration

Admin JWTs retain the project's existing seven-day lifetime. This change preserves the current token/authentication convention; changing the password does not revoke already-issued admin JWTs before their normal expiry. If immediate session revocation is required, add an admin token-version / password-changed-at check in the admin authentication middleware as a separate hardening change.
