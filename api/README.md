# Rakan API

Express (JavaScript, functions only) + Prisma + Supabase (Postgres database and image storage).

## Set up
1. In Supabase > Storage, create a **public** bucket named exactly `rakan`. The bucket is just a name you choose, it is not a key.
2. `cp .env.example .env` and fill it in. The comments in the file say which Supabase screen each value comes from (Connect > Direct for `DATABASE_URL`, Connect > Server for `SUPABASE_URL` and `SUPABASE_SECRET_KEY`). Both must come from the same project.
3. `npm install`
4. `npm run db:push` creates the tables. `npm run db:seed` adds the six categories, 10 products in each category, and two delivery cities (Irbid, Ramtha). It is safe to run again. Rename them and set the fees in the admin dashboard.
5. In the Supabase SQL editor, run this once so the tables cannot be read through Supabase's public data API (our API uses Prisma, which is not affected):
   ```sql
   alter table "Category" enable row level security;
   alter table "Product" enable row level security;
   alter table "Customer" enable row level security;
   alter table "City" enable row level security;
   alter table "Order" enable row level security;
   alter table "OrderItem" enable row level security;
   ```
6. `npm run dev` starts the API on http://localhost:4000

## Email codes
New shoppers confirm their email with a 6-digit code. While `SMTP_HOST` is empty the code is printed in the terminal, which is enough for development. For real emails, fill in the SMTP settings in `.env` (see the comments there).

## Folder layout
Each feature has its own folder in `src/modules`: `*.routes.js` (URLs and who may call them), `*.controller.js` (reads the request, sends the reply), `*.service.js` (the real work), `*.validation.js` (rules for incoming data).
Shared code: `src/lib` (database, storage, email, helpers), `src/middlewares`, `src/config/env.js`.

## Endpoints
| Method | URL | Who |
|---|---|---|
| POST | `/api/auth/login` | admin |
| GET | `/api/categories`, `/api/categories/:id` | anyone |
| POST, PUT, DELETE | `/api/categories`, `/api/categories/:id` | admin |
| GET | `/api/products?category=&q=&sort=`, `/api/products/:id` | anyone |
| POST, PUT, DELETE | `/api/products`, `/api/products/:id` | admin |
| POST | `/api/customers/register` | anyone (sends the code) |
| POST | `/api/customers/verify-otp` | anyone (returns a token) |
| POST | `/api/customers/resend-otp` | anyone |
| POST | `/api/customers/login` | anyone |
| GET | `/api/customers/me` | signed-in customer |
| GET, POST, PUT, DELETE | `/api/customers`, `/api/customers/:id` | admin |
| GET | `/api/cities` (active only) | anyone |
| GET | `/api/cities/all` | admin |
| POST, PUT, DELETE | `/api/cities`, `/api/cities/:id` | admin |
| POST | `/api/orders` | signed-in customer |
| GET | `/api/orders/mine` | signed-in customer |
| POST | `/api/orders/:id/cancel` | signed-in customer (only while PENDING) |
| GET | `/api/orders`, `/api/orders/:id` | admin |
| PUT | `/api/orders/:id/status` | admin |

## Orders are priced by the server
The order request only contains product ids, quantities, the city id and the delivery details. It never contains a price, a delivery fee or a total. The server reads every price and the city fee from the database, checks that each quantity goes up in steps of 0.25 kg (and is at most 50), and works out the totals itself. Changing numbers in the browser cannot change what an order costs.

Admin and customer tokens are different: a customer token cannot use admin routes.

## Environment setup

Copy `.env.example` to `.env` and fill in the values from your Supabase, Azure Translator, and email provider dashboards. Keep `.env` private and never add it to Git.

After changing `prisma/schema.prisma`, apply the schema to your development database and regenerate Prisma Client:

```bash
npm run db:push
npm run prisma:generate
```

The `Order.stockReserved` field distinguishes orders created after stock reservation was introduced from older orders. This prevents cancelling an older order from incorrectly increasing inventory that was never deducted.

## Image uploads

Category and product image uploads accept JPEG, PNG, WebP, and GIF files up to 5 MB. The API checks both the declared MIME type and the file signature before uploading to Supabase Storage.


## Recent feature update

- Product and category images accept JPG, PNG, or WebP up to 4 MB. The browser validates dimensions (minimum 300 × 300), compresses to WebP (target 500 KB, maximum dimension 1600 px), and the API independently validates and converts with Sharp to WebP (maximum dimension 1200 px, quality 87).
- Products are archived instead of hard-deleted. Archived products are hidden from the public catalogue and cannot be checked out; existing order line snapshots remain intact.
- Product API responses include `originalPrice` and backend-calculated `discountedPrice`. Order totals are still recalculated authoritatively by the API at checkout.
- Notifications are stored in PostgreSQL and delivered through Supabase Realtime Postgres Changes. The frontend receives only new-row events and fetches notification details through the authenticated API. Run `api/prisma/enable-notification-realtime.sql` and configure `SUPABASE_JWT_SECRET` in the API plus `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the frontend. See `REALTIME-NOTIFICATIONS-SETUP.md` for the secure RLS/token setup.

### Deploying the schema and dependencies

From `api/`, run `npm install` and then `npm run db:push` against the configured Supabase PostgreSQL database. From `frontend/`, run `npm install` before building. Add the `sharp` dependency in the API and `browser-image-compression` in the frontend (both are listed in their package manifests). Deploy the API before the frontend. Do not run `db:push` against production until you have a current database backup.
