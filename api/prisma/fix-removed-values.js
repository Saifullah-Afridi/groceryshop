import { PrismaClient } from "@prisma/client";

// Run this ONCE, before "npm run db:push", on a database that already has data.
//  - orders that were CONFIRMED or PREPARING become PENDING (those two statuses no longer exist)
//  - products and order lines sold by the "head" unit become "item" (that unit no longer exists)
// Safe to run again: it only touches rows that still use the old values.
const prisma = new PrismaClient();

const orders = await prisma.$executeRawUnsafe(`UPDATE "Order" SET "status" = 'PENDING' WHERE "status"::text IN ('CONFIRMED', 'PREPARING')`);
const products = await prisma.$executeRawUnsafe(`UPDATE "Product" SET "unit" = 'item' WHERE "unit" = 'head'`);
const lines = await prisma.$executeRawUnsafe(`UPDATE "OrderItem" SET "unit" = 'item' WHERE "unit" = 'head'`);

console.log(`Orders moved to PENDING: ${orders}`);
console.log(`Products changed from head to item: ${products}`);
console.log(`Order lines changed from head to item: ${lines}`);
await prisma.$disconnect();
