# Rakan Shop — Server-Side Admin Pagination Report

## Summary

Implemented database-level, offset-based pagination for the admin collection views. Admin list requests now send a page and page size to the API; the API applies Prisma `skip`/`take`, runs a matching `count()`, and returns the requested page plus pagination metadata.

The existing storefront endpoints and their array response shapes were deliberately kept separate. This avoids changing the public Shop/catalogue, checkout, and customer order-list contracts.

**This is an implementation handoff, not a production certification.** Full frontend type-check/build, Prisma validation, and live API/database tests could not be completed in this environment because project dependencies were not installed and no database connection was supplied. See Tests and limitations below.

## Admin lists covered

| Admin view | API endpoint | Pagination/filter behavior |
|---|---|---|
| Products (active and archived) | `GET /products/admin/all` | `page`, `limit`, `search`/`q`, `category`, `archived`, `sort` |
| Categories | `GET /categories/admin/all` | `page`, `limit`, `search`/`q`, `sort` |
| Customers | `GET /customers` | `page`, `limit`, `search`/`q`, `sort` |
| Orders | `GET /orders` | `page`, `limit`, `search`/`q`, `status`, `sort` |
| Delivery cities/fees | `GET /cities/all` | `page`, `limit`, `search`/`q`, `sort` |
| A customer's order history | `GET /customers/:id` | `page`, `limit`, `search`/`q`, `status`; customer statistics are calculated separately |

The admin dashboard was also checked. Its recent orders and best sellers were already bounded. Its stock widgets previously loaded all active products and filtered them in JavaScript; these now use database-side queries and return at most five low-stock and five out-of-stock products, while product totals use `count()`.

## Backend implementation

### Pagination contract

Paginated admin list responses use the project's existing JSON API style, with this shape:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 145,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

Orders additionally return `statusCounts` so the status tabs continue to show counts across the complete search result, rather than just the current page. Customer detail responses retain the existing customer and `stats` properties, but their `orders` collection is now the requested page and they include `ordersPagination`.

### Validation and query behavior

- Shared pagination parsing lives in `api/src/lib/pagination.js`.
- `page` must be an integer from 1 to 1,000,000.
- `limit` must be an integer from 1 to 100. The default API page size is 20; the existing admin tables request 8.
- Search values are trimmed and limited to 120 characters.
- Invalid pagination and unsupported sort/filter values return HTTP 400.
- Each paginated query uses the same `where` object for its page query and `count()`.
- Sort orders include a unique secondary key (`id`) where the primary sort is not already unique.
- Orders and customer order history include their items in the paginated database query, avoiding per-row N+1 reads.
- Product admin search is applied in PostgreSQL across product name, Arabic name, farm, and category names. The public catalogue's existing relevance-scoring behavior was preserved.
- Public `/products`, `/categories`, `/cities`, and customer `/orders/mine` responses were not converted to pagination.

### Backend files changed

- `api/src/lib/pagination.js` (new shared parser)
- `api/src/modules/products/products.controller.js`
- `api/src/modules/products/products.service.js`
- `api/src/modules/categories/categories.controller.js`
- `api/src/modules/categories/categories.routes.js`
- `api/src/modules/categories/categories.service.js`
- `api/src/modules/customers/customers.controller.js`
- `api/src/modules/customers/customers.service.js`
- `api/src/modules/orders/orders.controller.js`
- `api/src/modules/orders/orders.validation.js`
- `api/src/modules/orders/orders.service.js`
- `api/src/modules/cities/cities.controller.js`
- `api/src/modules/cities/cities.service.js`
- `api/src/modules/dashboard/dashboard.service.js`

## Frontend implementation

Updated the admin service layer and React Query hooks to request page-specific data and include pagination/search/filter values in query keys:

- `frontend/src/services/adminService.ts`
- `frontend/src/hooks/useAdmin.ts`

Updated admin pages:

- `AdminProductsPage.tsx`
- `AdminCategoriesPage.tsx`
- `AdminCustomersPage.tsx`
- `AdminOrdersPage.tsx`
- `AdminCitiesPage.tsx`
- `AdminCustomerPage.tsx`

The existing reusable `Pagination` component is retained. Tables now render the current API page directly and use the API's `total` and `totalPages`; frontend array slicing was removed from the admin list pagination paths. Product and order search are debounced and reset to page 1. Product category/archive filters, order status filters, and customer-history status filters reset to page 1. Query cache keys include the current parameters, and existing admin mutations continue invalidating the `admin` query family.

No storefront, Home page, Shop page, product card, navigation, sidebar, typography, or color redesign was made.

## Database indexes

No Prisma model/schema migration was needed.

The project already contained `api/prisma/query-performance-indexes.sql` with trigram indexes for product/category/customer/order search and order sorting indexes. I added one idempotent index for the newly supported delivery-city substring search:

```sql
CREATE INDEX IF NOT EXISTS "City_name_trgm_idx"
ON public."City" USING GIN ("name" gin_trgm_ops);
```

The existing SQL file remains safe to rerun because it uses `IF NOT EXISTS`. Apply it only if the index is not already present.

## Tests performed

| Check | Result |
|---|---|
| `node --check` across all 57 backend JavaScript files | PASS |
| TypeScript/TSX syntax transpilation for the changed frontend files using the globally available TypeScript compiler API | PASS |
| Full `tsc --noEmit` | BLOCKED: frontend dependencies/types (`react`, `react-router-dom`, `lucide-react`, React Query, etc.) are not installed |
| Vite production build | NOT RUN: dependencies unavailable |
| Prisma schema validation / Prisma Client generation | NOT RUN: local Prisma CLI/client dependencies unavailable |
| API integration tests for page 1, subsequent/last page, empty results, search, filters, sorting, invalid limits, and mutations | NOT RUN: no installed API dependencies or `DATABASE_URL`/PostgreSQL connection supplied |
| Live database query-plan/index verification | NOT RUN: no database connection supplied |

An `npm ci` attempt did not complete in the available execution window, and no `node_modules` directory was created. No live database behavior is claimed as tested.

## Installation and run commands

From the project root:

### Backend

```bash
cd api
npm ci
npx prisma generate
npx prisma validate
```

Apply the performance SQL from the Supabase SQL Editor, or from a machine with database access:

```bash
psql "$DATABASE_URL" -f prisma/query-performance-indexes.sql
```

Then start the API:

```bash
npm run start
```

### Frontend

In another terminal:

```bash
cd frontend
npm ci
npm run build
```

For local development:

```bash
npm run dev
```

Ensure the API environment contains the existing `DATABASE_URL` and the frontend environment points to the deployed/local API as configured by the project.

## Remaining limitations / production checklist

1. Run `npm ci`, `npx prisma validate`, and `npm run build` in the deployment environment.
2. Apply/confirm `City_name_trgm_idx` and the existing performance indexes in the production PostgreSQL database.
3. Run authenticated API tests against a staging database for all listed endpoints, including mutation invalidation and page-boundary behavior.
4. Search uses PostgreSQL `contains`/case-insensitive matching and benefits from the existing trigram indexes. Confirm the indexes are actually installed in the target database.
5. Offset pagination is appropriate for the current admin tables and supports page-number navigation. If tables grow to very large row counts and users navigate deeply, evaluate cursor pagination for orders/products.
6. Category selection in the product form requests the first 100 categories (the API maximum). If the business expects more than 100 categories, that selector should be changed to a searchable server-backed picker.

Do not treat this build as fully production-ready until the blocked build, Prisma, and live database tests have passed.
