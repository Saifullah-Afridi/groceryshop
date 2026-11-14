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
      ...(q && { OR: [{ name: { contains: q, mode: "insensitive" } }, { nameAr: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }, { descriptionAr: { contains: q, mode: "insensitive" } }] }),
    },
    orderBy: ORDER[sort] ?? { id: "asc" },
  });
  return rows.map(toDto);
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
