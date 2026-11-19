-- Run once against the existing Rakan database before deploying this version.
-- Product and category descriptions are no longer used by the application.
ALTER TABLE public."Product" DROP COLUMN IF EXISTS "description";
ALTER TABLE public."Product" DROP COLUMN IF EXISTS "descriptionAr";
ALTER TABLE public."Category" DROP COLUMN IF EXISTS "description";
ALTER TABLE public."Category" DROP COLUMN IF EXISTS "descriptionAr";
