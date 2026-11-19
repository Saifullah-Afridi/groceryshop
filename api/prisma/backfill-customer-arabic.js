import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { translateCustomerField } from "../src/lib/translate.js";

const prisma = new PrismaClient();
const hasArabic = (value) => /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(value || "");

async function fillPair(english, arabic) {
  const en = (english || "").trim();
  const ar = (arabic || "").trim();
  if (!en && !ar) return { en, ar };
  if (en && ar) return { en, ar };
  const source = hasArabic(en) ? en : ar || en;
  const language = hasArabic(source) ? "ar" : "en";
  const pair = await translateCustomerField(source, language);
  return { en: en && !hasArabic(en) ? en : pair.en, ar: ar || pair.ar };
}

async function run() {
  if (!process.env.AZURE_TRANSLATOR_KEY || !process.env.AZURE_TRANSLATOR_REGION || !process.env.AZURE_TRANSLATOR_ENDPOINT) {
    throw new Error("Configure AZURE_TRANSLATOR_KEY, AZURE_TRANSLATOR_REGION, and AZURE_TRANSLATOR_ENDPOINT in api/.env.");
  }
  const customers = await prisma.customer.findMany({ select: { id: true, address: true, addressAr: true } });
  let customerCount = 0;
  for (const customer of customers) {
    const pair = await fillPair(customer.address, customer.addressAr);
    if (pair.en !== customer.address || pair.ar !== customer.addressAr) {
      await prisma.customer.update({ where: { id: customer.id }, data: { address: pair.en, addressAr: pair.ar } });
      customerCount += 1;
    }
  }
  const orders = await prisma.order.findMany({ select: { id: true, address: true, addressAr: true, note: true, noteAr: true } });
  let orderCount = 0;
  for (const order of orders) {
    const [address, note] = await Promise.all([fillPair(order.address, order.addressAr), fillPair(order.note, order.noteAr)]);
    const data = { address: address.en, addressAr: address.ar, note: note.en, noteAr: note.ar };
    if (data.address !== order.address || data.addressAr !== order.addressAr || data.note !== order.note || data.noteAr !== order.noteAr) {
      await prisma.order.update({ where: { id: order.id }, data });
      orderCount += 1;
    }
  }
  console.log(`Customer address translations updated: ${customerCount}; order delivery translations updated: ${orderCount}.`);
}

try { await run(); }
catch (error) { console.error("Customer translation backfill failed:", error.message); process.exitCode = 1; }
finally { await prisma.$disconnect(); }
