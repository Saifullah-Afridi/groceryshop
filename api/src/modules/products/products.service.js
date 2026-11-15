import { httpError } from "../../lib/httpError.js";
import { prisma } from "../../lib/prisma.js";
import { deleteImage, uploadImage } from "../../lib/storage.js";
import { buildBilingualContent } from "../../lib/translate.js";

// The shape the React app expects. Prisma returns price as a Decimal, so it is turned into a number.
const toDto = (p) => ({
  id: p.id,
  categoryId: p.categoryId,
  name: p.name,
  nameAr: p.nameAr,
  description: p.description,
  descriptionAr: p.descriptionAr,
  stockQuantity: Number(p.stockQuantity),
  discount: Number(p.discount ?? 0),
  isOutOfStock: Number(p.stockQuantity) <= 0,
  farm: p.farm,
  price: Number(p.price),
  unit: p.unit,
  minQuantity: Number(p.minQuantity ?? 0),
  image: p.image ?? "",
});

const ORDER = { newest: { id: "desc" }, "price-asc": { price: "asc" }, "price-desc": { price: "desc" } };

const normalizeSearch = (value = "") => String(value)
  .normalize("NFKD")
  .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
  .replace(/[أإآٱ]/g, "ا")
  .replace(/ى/g, "ي")
  .toLocaleLowerCase()
  .replace(/[^\p{L}\p{N}]+/gu, " ")
  .trim();

function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[b.length];
}

function scoreSearch(query, values) {
  const normalizedQuery = normalizeSearch(query);
  const queryTokens = normalizedQuery.split(" ").filter(Boolean);
  if (!queryTokens.length) return 0;
  const fields = values.map(normalizeSearch).filter(Boolean);
  if (fields.some((field) => field.includes(normalizedQuery))) return 120;

  let total = 0;
  for (const queryToken of queryTokens) {
    let best = 0;
    for (const field of fields) {
      for (const token of field.split(" ")) {
        if (token === queryToken) best = Math.max(best, 30);
        else if (token.startsWith(queryToken) || queryToken.startsWith(token)) best = Math.max(best, 22);
        else if (token.includes(queryToken) || queryToken.includes(token)) best = Math.max(best, 16);
        else {
          const distance = editDistance(queryToken, token);
          const allowed = queryToken.length >= 7 ? 2 : queryToken.length >= 4 ? 1 : 0;
          if (distance <= allowed) best = Math.max(best, 10 - distance);
        }
      }
    }
    if (!best) return 0;
    total += best;
  }
  return total;
}

function scoreCategorySearch(query, category) {
  if (!category) return 0;
  const fields = [category.name, category.nameAr];
  const fullScore = scoreSearch(query, fields);
  if (fullScore) return fullScore;
  // A multi-word query such as "fresh vegetables" should still surface the
  // Vegetables category even when "fresh" is not part of its category name.
  return normalizeSearch(query).split(" ")
    .reduce((best, token) => Math.max(best, scoreSearch(token, fields)), 0);
}

function productSearchScore(product, query) {
  const nameScore = scoreSearch(query, [product.name, product.nameAr]);
  const categoryScore = scoreCategorySearch(query, product.category);
  const detailScore = scoreSearch(query, [product.description, product.descriptionAr, product.farm]);
  // Product-name matches rank first, followed by category matches, then descriptions/farm text.
  return Math.max(nameScore ? nameScore + 30 : 0, categoryScore ? categoryScore + 10 : 0, detailScore);
}

async function findOrFail(id) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw httpError(404, "Product not found.");
  return product;
}

async function assertCategoryExists(categoryId) {
  if (!(await prisma.category.findUnique({ where: { id: categoryId } }))) {
    throw httpError(400, "categoryId: that category does not exist.");
  }
}

export async function listProducts({ category, q, sort, offers }) {
  const rows = await prisma.product.findMany({
    where: {
      ...(category && { categoryId: category }),
      ...(offers && { discount: { gt: 0 } }),
    },
    include: q ? { category: true } : undefined,
    orderBy: ORDER[sort] ?? { id: "asc" },
  });

  if (!q) return rows.map(toDto);

  return rows
    .map((row) => ({ row, score: productSearchScore(row, q) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ row }) => toDto(row));
}

export async function getSearchSuggestions(query) {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ include: { category: true } }),
    prisma.category.findMany(),
  ]);

  const matchedCategories = categories
    .map((category) => ({ category, score: scoreCategorySearch(query, category) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ category }) => ({
      id: category.id, name: category.name, nameAr: category.nameAr,
      image: category.image ?? "",
    }));

  const matchedProducts = products
    .map((product) => ({ product, score: productSearchScore(product, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ product }) => ({
      ...toDto(product),
      categoryName: product.category?.name ?? "",
      categoryNameAr: product.category?.nameAr ?? "",
    }));

  return { products: matchedProducts, categories: matchedCategories };
}

export async function getProduct(id) {
  return toDto(await findOrFail(id));
}

export async function createProduct(data, file) {
  await assertCategoryExists(data.categoryId);
  const bilingual = await buildBilingualContent(data, data.language ?? "en");
  const { language, name, description, removeImage, ...rest } = data;
  const image = file ? await uploadImage(file, "products") : null;
  try {
    return toDto(await prisma.product.create({ data: { ...rest, ...bilingual, image } }));
  } catch (error) {
    await deleteImage(image);
    throw error;
  }
}

export async function updateProduct(id, data, file) {
  const current = await findOrFail(id);
  if (data.categoryId) await assertCategoryExists(data.categoryId);
  const language = data.language ?? "en";
  const bilingual = await buildBilingualContent(data, language, current);
  const { language: _language, name, description, removeImage, ...rest } = data;
  const image = file ? await uploadImage(file, "products") : undefined;
  const shouldRemoveImage = Boolean(removeImage) && !file;
  try {
    const row = await prisma.product.update({
      where: { id },
      data: { ...rest, ...bilingual, ...(image ? { image } : shouldRemoveImage ? { image: null } : {}) },
    });
    if (image || shouldRemoveImage) await deleteImage(current.image);
    return toDto(row);
  } catch (error) {
    await deleteImage(image);
    throw error;
  }
}

export async function deleteProduct(id) {
  const current = await findOrFail(id);
  await prisma.product.delete({ where: { id } });
  await deleteImage(current.image);
}
