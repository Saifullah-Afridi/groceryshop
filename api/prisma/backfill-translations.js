import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { translateTexts } from "../src/lib/translate.js";

const prisma = new PrismaClient();

async function backfill(model, label) {
  const rows = await model.findMany();
  let updated = 0;
  for (const row of rows) {
    const missing = [];
    const values = [];
    if (row.name && !row.nameAr?.trim()) { missing.push("nameAr"); values.push(row.name); }
    if (row.description && !row.descriptionAr?.trim()) { missing.push("descriptionAr"); values.push(row.description); }
    if (!missing.length) continue;

    // Existing Arabic text is never overwritten; only empty translation fields are filled.
    const translated = await translateTexts(values, "en", "ar");
    const data = Object.fromEntries(missing.map((key, index) => [key, translated[index]]));
    await model.update({ where: { id: row.id }, data });
    updated += 1;
  }
  console.log(`${label}: translated ${updated} record(s).`);
}

try {
  await backfill(prisma.product, "Products");
  await backfill(prisma.category, "Categories");
} catch (error) {
  console.error("Translation backfill failed:", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
