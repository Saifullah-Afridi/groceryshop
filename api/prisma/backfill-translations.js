import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { translateTexts } from "../src/lib/translate.js";

const prisma = new PrismaClient();

async function backfill(model, label, fields) {
  const rows = await model.findMany();
  let updated = 0;
  for (const row of rows) {
    const missing = [];
    const values = [];
    for (const field of fields) {
      const translatedField = `${field}Ar`;
      if (row[field] && !row[translatedField]?.trim()) {
        missing.push(translatedField);
        values.push(row[field]);
      }
    }
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
  await backfill(prisma.product, "Products", ["name"]);
  await backfill(prisma.category, "Categories", ["name"]);
} catch (error) {
  console.error("Translation backfill failed:", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
