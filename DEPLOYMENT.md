# Rakan Shop deployment notes

This project has two applications in one repository:

- `frontend/`: Vite + React static frontend.
- `api/`: Express + Prisma API.
- Supabase: PostgreSQL database and public image storage.

For a personal test deployment, create two Vercel projects from the same Git repository, one with Root Directory `frontend` and one with Root Directory `api`. Keep the Supabase database and storage in the same Supabase project.

## Before deploying

1. Push the updated repository to GitHub.
2. In the API project, configure every variable listed in `api/.env.example` using real values. Set `NODE_ENV=production` and `CLIENT_ORIGIN` to the deployed frontend origin.
3. In the frontend project, set the Vite API URL variable used by `frontend/src/services/apiClient.ts` to the deployed API origin with `/api` at the end (for example `https://rakan-api.vercel.app/api`).
4. Apply the Prisma schema change to the Supabase database from the API directory:

   ```bash
   npm install
   npx prisma db push
   npx prisma generate
   ```

5. Deploy the API, then deploy the frontend.
6. Test login, email verification, image uploads, order checkout, cancellation, and admin status changes.

Do not put `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, admin credentials, or Azure Translator credentials in frontend environment variables. They belong only in the API environment.

Vercel Hobby is intended for personal, non-commercial use. Check Vercel's current plan terms and function limits before using this deployment for a real shop.
