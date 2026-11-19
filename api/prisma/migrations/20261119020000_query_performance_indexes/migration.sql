-- Rakan Shop query-performance indexes. Safe to run more than once.
-- Supabase supports pg_trgm; it accelerates Prisma contains/insensitive searches.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "Product_name_trgm_idx" ON public."Product" USING GIN ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Product_nameAr_trgm_idx" ON public."Product" USING GIN ("nameAr" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Product_farm_trgm_idx" ON public."Product" USING GIN ("farm" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Category_name_trgm_idx" ON public."Category" USING GIN ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Category_nameAr_trgm_idx" ON public."Category" USING GIN ("nameAr" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Customer_name_trgm_idx" ON public."Customer" USING GIN ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Customer_email_trgm_idx" ON public."Customer" USING GIN ("email" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Customer_phone_trgm_idx" ON public."Customer" USING GIN ("phone" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Order_name_trgm_idx" ON public."Order" USING GIN ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Order_phone_trgm_idx" ON public."Order" USING GIN ("phone" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Order_city_trgm_idx" ON public."Order" USING GIN ("city" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Order_createdAt_id_idx" ON public."Order" ("createdAt" DESC, "id" DESC);
CREATE INDEX IF NOT EXISTS "Order_customerId_createdAt_idx" ON public."Order" ("customerId", "createdAt" DESC);
