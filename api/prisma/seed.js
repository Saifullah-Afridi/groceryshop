import { PrismaClient } from "@prisma/client";
import { translateTexts } from "../src/lib/translate.js";

const prisma = new PrismaClient();

// The source names below are intentionally Jordanian Arabic. The seed translates
// them to English with Azure Translator and stores both values in the bilingual
// columns: `nameAr` keeps the submitted Arabic; `name` stores the translation.
const categories = [
  { id: "vegetables", nameAr: "خضرة", icon: "Carrot", color: "#6f7d1f", tint: "#d9ecd9" },
  { id: "fruits", nameAr: "فواكه", icon: "Apple", color: "#157a66", tint: "#f6dfd3" },
  { id: "meats", nameAr: "لحوم", icon: "Beef", color: "#7f1717", tint: "#f2d6da" },
  { id: "dairy-cheeses", nameAr: "ألبان", icon: "Milk", color: "#6b1f6e", tint: "#d8e6f2" },
  { id: "fresh-juices", nameAr: "عصاير", icon: "CupSoda", color: "#10337a", tint: "#f7e6c4" },
  { id: "supermarket", nameAr: "تموين", icon: "Wheat", color: "#6b3d10", tint: "#e6e2cf" },
];

// Exactly 20 single-word Jordanian Arabic product names per category.
// Prices are JOD per 0.25 kg for kg products, or per bottle/pack otherwise.
const products = [
  // Vegetables — خضرة
  ["vegetables", "بندورة", 0.16, "kg", "مزارع الأغوار"],
  ["vegetables", "خيار", 0.14, "kg", "مزارع الأغوار"],
  ["vegetables", "بطاطا", 0.15, "kg", "مزارع إربد"],
  ["vegetables", "كوسا", 0.18, "kg", "مزارع الرمثا"],
  ["vegetables", "باذنجان", 0.15, "kg", "مزارع الأغوار"],
  ["vegetables", "بصل", 0.10, "kg", "مزارع حوران"],
  ["vegetables", "جزر", 0.13, "kg", "مزارع إربد"],
  ["vegetables", "زهرة", 0.19, "kg", "مزارع إربد"],
  ["vegetables", "فليفلة", 0.28, "kg", "بيوت الأغوار"],
  ["vegetables", "ثوم", 0.45, "kg", "مزارع حوران"],
  ["vegetables", "ملفوف", 0.16, "kg", "مزارع عجلون"],
  ["vegetables", "خس", 0.12, "kg", "مزارع الأغوار"],
  ["vegetables", "سبانخ", 0.18, "kg", "مزارع إربد"],
  ["vegetables", "ملوخية", 0.22, "kg", "مزارع الأغوار"],
  ["vegetables", "بامية", 0.30, "kg", "مزارع الأغوار"],
  ["vegetables", "فجل", 0.12, "kg", "مزارع الرمثا"],
  ["vegetables", "لفت", 0.14, "kg", "مزارع حوران"],
  ["vegetables", "بقدونس", 0.10, "bunch", "مزارع إربد"],
  ["vegetables", "نعنع", 0.10, "bunch", "مزارع إربد"],
  ["vegetables", "بازيلا", 0.24, "kg", "مزارع عجلون"],

  // Fruits — فواكه
  ["fruits", "تفاح", 0.24, "kg", "بساتين عجلون"],
  ["fruits", "موز", 0.20, "kg", "مزارع الأغوار"],
  ["fruits", "فراولة", 0.40, "kg", "مزارع إربد"],
  ["fruits", "برتقال", 0.21, "kg", "بساتين وادي العرب"],
  ["fruits", "كلمنتينا", 0.19, "kg", "بساتين الشمال"],
  ["fruits", "ليمون", 0.18, "kg", "بساتين وادي العرب"],
  ["fruits", "عنب", 0.35, "kg", "كروم جرش"],
  ["fruits", "بطيخ", 0.09, "kg", "مزارع الأغوار"],
  ["fruits", "رمان", 0.38, "kg", "بساتين الشمال"],
  ["fruits", "تين", 0.55, "kg", "بساتين عجلون"],
  ["fruits", "مشمش", 0.42, "kg", "بساتين عجلون"],
  ["fruits", "خوخ", 0.36, "kg", "بساتين إربد"],
  ["fruits", "دراق", 0.38, "kg", "بساتين عجلون"],
  ["fruits", "كرز", 0.65, "kg", "بساتين عجلون"],
  ["fruits", "إجاص", 0.32, "kg", "بساتين الشمال"],
  ["fruits", "كيوي", 0.45, "kg", "مورد الفواكه"],
  ["fruits", "مانجا", 0.50, "kg", "مورد الفواكه"],
  ["fruits", "جوافة", 0.38, "kg", "مزارع الأغوار"],
  ["fruits", "أفوكادو", 0.60, "kg", "مورد الفواكه"],
  ["fruits", "تمر", 0.48, "kg", "مزارع الأغوار"],

  // Meats — لحوم
  ["meats", "غنم", 2.38, "kg", "مزارع بلدية"],
  ["meats", "عجل", 2.13, "kg", "مزارع بلدية"],
  ["meats", "دجاج", 0.80, "kg", "مزارع دواجن إربد"],
  ["meats", "حبش", 1.40, "kg", "مزارع دواجن"],
  ["meats", "مفروم", 1.88, "kg", "مزارع بلدية"],
  ["meats", "كفتة", 1.95, "kg", "مزارع بلدية"],
  ["meats", "كباب", 2.10, "kg", "مزارع بلدية"],
  ["meats", "ريش", 2.75, "kg", "مزارع بلدية"],
  ["meats", "موزات", 2.45, "kg", "مزارع بلدية"],
  ["meats", "كبدة", 1.50, "kg", "مزارع بلدية"],
  ["meats", "قلوب", 1.20, "kg", "مزارع دواجن إربد"],
  ["meats", "قوانص", 0.95, "kg", "مزارع دواجن إربد"],
  ["meats", "صدور", 1.20, "kg", "مزارع دواجن إربد"],
  ["meats", "أفخاذ", 0.95, "kg", "مزارع دواجن إربد"],
  ["meats", "أجنحة", 0.88, "kg", "مزارع دواجن إربد"],
  ["meats", "شاورما", 1.65, "kg", "مزارع دواجن إربد"],
  ["meats", "نقانق", 1.35, "kg", "مزارع بلدية"],
  ["meats", "سجق", 1.45, "kg", "مزارع بلدية"],
  ["meats", "ستيك", 3.00, "kg", "مزارع بلدية"],
  ["meats", "فيليه", 1.70, "kg", "مزارع دواجن إربد"],

  // Dairy — ألبان
  ["dairy-cheeses", "حليب", 0.38, "bottle", "ألبان جرش"],
  ["dairy-cheeses", "لبن", 0.40, "kg", "ألبان جرش"],
  ["dairy-cheeses", "لبنة", 0.70, "kg", "ألبان جرش"],
  ["dairy-cheeses", "شنينة", 0.35, "bottle", "ألبان الكرك"],
  ["dairy-cheeses", "جميد", 1.38, "kg", "ألبان الكرك"],
  ["dairy-cheeses", "نابلسية", 1.63, "kg", "ألبان بلدية"],
  ["dairy-cheeses", "عكاوي", 1.50, "kg", "ألبان بلدية"],
  ["dairy-cheeses", "حلوم", 1.38, "kg", "ألبان بلدية"],
  ["dairy-cheeses", "قريشة", 0.75, "kg", "ألبان جرش"],
  ["dairy-cheeses", "زبدة", 1.75, "kg", "ألبان الكرك"],
  ["dairy-cheeses", "قشطة", 0.65, "pack", "ألبان جرش"],
  ["dairy-cheeses", "كريمة", 0.80, "pack", "ألبان جرش"],
  ["dairy-cheeses", "موزاريلا", 1.55, "kg", "ألبان بلدية"],
  ["dairy-cheeses", "شيدر", 1.60, "kg", "ألبان بلدية"],
  ["dairy-cheeses", "بارميزان", 2.10, "kg", "ألبان بلدية"],
  ["dairy-cheeses", "فيتا", 1.35, "kg", "ألبان بلدية"],
  ["dairy-cheeses", "بيض", 1.20, "dozen", "مزارع دواجن إربد"],
  ["dairy-cheeses", "زبادي", 0.42, "kg", "ألبان جرش"],
  ["dairy-cheeses", "سمنة", 1.90, "pack", "ألبان الكرك"],
  ["dairy-cheeses", "جبنة", 1.25, "kg", "ألبان بلدية"],

  // Juices — عصاير
  ["fresh-juices", "برتقال", 2.00, "bottle", "عصائر راكان"],
  ["fresh-juices", "ليمون", 1.80, "bottle", "عصائر راكان"],
  ["fresh-juices", "رمان", 3.00, "bottle", "عصائر راكان"],
  ["fresh-juices", "تفاح", 2.20, "bottle", "عصائر راكان"],
  ["fresh-juices", "جزر", 2.00, "bottle", "عصائر راكان"],
  ["fresh-juices", "مانجا", 2.50, "bottle", "عصائر راكان"],
  ["fresh-juices", "فراولة", 2.60, "bottle", "عصائر راكان"],
  ["fresh-juices", "موز", 2.30, "bottle", "عصائر راكان"],
  ["fresh-juices", "جوافة", 2.40, "bottle", "عصائر راكان"],
  ["fresh-juices", "أناناس", 2.70, "bottle", "عصائر راكان"],
  ["fresh-juices", "شمام", 1.90, "bottle", "عصائر راكان"],
  ["fresh-juices", "بطيخ", 1.90, "bottle", "عصائر راكان"],
  ["fresh-juices", "كيوي", 2.80, "bottle", "عصائر راكان"],
  ["fresh-juices", "خوخ", 2.30, "bottle", "عصائر راكان"],
  ["fresh-juices", "عنب", 2.40, "bottle", "عصائر راكان"],
  ["fresh-juices", "كرز", 2.90, "bottle", "عصائر راكان"],
  ["fresh-juices", "تمرهندي", 2.10, "bottle", "عصائر راكان"],
  ["fresh-juices", "أفوكادو", 3.20, "bottle", "عصائر راكان"],
  ["fresh-juices", "قصب", 2.00, "bottle", "عصائر راكان"],
  ["fresh-juices", "مشمش", 2.40, "bottle", "عصائر راكان"],

  // Supermarket — تموين
  ["supermarket", "رز", 0.45, "kg", "تموين راكان"],
  ["supermarket", "سكر", 0.23, "kg", "تموين راكان"],
  ["supermarket", "ملح", 0.12, "kg", "تموين راكان"],
  ["supermarket", "طحين", 0.20, "kg", "تموين راكان"],
  ["supermarket", "عدس", 0.30, "kg", "تموين راكان"],
  ["supermarket", "حمص", 0.33, "kg", "تموين راكان"],
  ["supermarket", "فاصوليا", 0.38, "kg", "تموين راكان"],
  ["supermarket", "برغل", 0.25, "kg", "تموين راكان"],
  ["supermarket", "فريكة", 0.75, "kg", "تموين راكان"],
  ["supermarket", "معكرونة", 0.35, "pack", "تموين راكان"],
  ["supermarket", "شعيرية", 0.25, "pack", "تموين راكان"],
  ["supermarket", "زيت", 1.80, "bottle", "مطاحن الكفارات"],
  ["supermarket", "زيتون", 0.90, "kg", "مطاحن الكفارات"],
  ["supermarket", "زعتر", 1.20, "pack", "بيت البهارات"],
  ["supermarket", "سماق", 1.30, "pack", "بيت البهارات"],
  ["supermarket", "طحينية", 1.60, "pack", "بيت البهارات"],
  ["supermarket", "دبس", 1.40, "bottle", "تموين راكان"],
  ["supermarket", "قهوة", 2.50, "pack", "تموين راكان"],
  ["supermarket", "شاي", 1.75, "pack", "تموين راكان"],
  ["supermarket", "مربى", 1.20, "bottle", "تموين راكان"],
];

async function translateInBatches(values, batchSize = 100) {
  const output = [];
  for (let i = 0; i < values.length; i += batchSize) {
    output.push(...await translateTexts(values.slice(i, i + batchSize), "ar", "en"));
  }
  return output;
}

try {
  if (products.length !== categories.length * 20) {
    throw new Error(`Expected 20 products per category; found ${products.length} total products.`);
  }
  for (const category of categories) {
    const count = products.filter(([categoryId]) => categoryId === category.id).length;
    if (count !== 20) throw new Error(`Category ${category.id} has ${count} products instead of 20.`);
  }
  for (const [, name] of products) {
    if (/\s/.test(name.trim())) throw new Error(`Product name must be one word: ${name}`);
  }
  const existingUntranslated = await prisma.product.count({ where: { isArchived: false, nameAr: "" } });
  if (existingUntranslated > 0) {
    console.warn(`Warning: ${existingUntranslated} existing active product(s) have no Arabic name. They will be left untouched; use a clean test database if you want to see only this 120-product Arabic test catalog.`);
  }

  // Translate all 126 category/product labels in just two Azure Translator requests.
  const labels = [...categories.map((item) => item.nameAr), ...products.map((item) => item[1])];
  const englishLabels = await translateInBatches(labels);

  for (let i = 0; i < categories.length; i += 1) {
    const category = categories[i];
    const bilingual = { name: englishLabels[i], nameAr: category.nameAr };
    await prisma.category.upsert({
      where: { id: category.id },
      update: { ...bilingual, icon: category.icon, color: category.color, tint: category.tint },
      create: { id: category.id, ...bilingual, icon: category.icon, color: category.color, tint: category.tint },
    });
  }
  console.log(`Seeded ${categories.length} bilingual categories from Jordanian Arabic.`);

  let added = 0;
  let updated = 0;
  for (let i = 0; i < products.length; i += 1) {
    const [categoryId, nameAr, price, unit, farm] = products[i];
    const data = { name: englishLabels[categories.length + i], nameAr, categoryId, price, unit, farm };
    const existing = await prisma.product.findFirst({ where: { categoryId, nameAr } });
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data });
      updated += 1;
    } else {
      await prisma.product.create({ data });
      added += 1;
    }
  }
  console.log(`Seeded ${products.length} Jordanian Arabic products: ${added} added, ${updated} updated.`);
  console.log("Original Arabic is stored in nameAr; Azure Translator English output is stored in name.");
} catch (error) {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
