import { httpError } from "../../lib/httpError.js";
import { prisma } from "../../lib/prisma.js";

const toDto = (c) => ({ id: c.id, name: c.name, fee: Number(c.fee), active: c.active });

async function findOrFail(id) {
  const city = await prisma.city.findUnique({ where: { id } });
  if (!city) throw httpError(404, "City not found.");
  return city;
}

async function assertNameFree(name, exceptId) {
  const same = await prisma.city.findFirst({
    where: { name: { equals: name, mode: "insensitive" }, ...(exceptId ? { id: { not: exceptId } } : {}) },
    select: { id: true },
  });
  if (same) throw httpError(409, "A city with this name already exists.");
}

// Shoppers only see active cities. The admin sees all of them.
export async function listCities({ onlyActive, page, limit, search = "", sort = "oldest" }) {
  const where = { ...(onlyActive ? { active: true } : {}), ...(search ? { name: { contains: search, mode: "insensitive" } } : {}) };
  const orderBy = sort === "oldest" ? [{ id: "asc" }] : sort === "name-desc" ? [{ name: "desc" }, { id: "desc" }]
    : sort === "fee-asc" ? [{ fee: "asc" }, { id: "asc" }]
    : sort === "fee-desc" ? [{ fee: "desc" }, { id: "desc" }]
    : [{ name: "asc" }, { id: "asc" }];
  if (page && limit) {
    const skip = (page - 1) * limit;
    const [rows, total] = await prisma.$transaction([
      prisma.city.findMany({ where, skip, take: limit, orderBy }),
      prisma.city.count({ where }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: rows.map(toDto), pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 && totalPages > 0 } };
  }
  const rows = await prisma.city.findMany({ where, orderBy });
  return rows.map(toDto);
}

export async function createCity(data) {
  await assertNameFree(data.name);
  return toDto(await prisma.city.create({ data }));
}

export async function updateCity(id, data) {
  await findOrFail(id);
  if (data.name) await assertNameFree(data.name, id);
  return toDto(await prisma.city.update({ where: { id }, data }));
}

// Old orders keep the city name and fee they were placed with, so deleting is safe.
export async function deleteCity(id) {
  await findOrFail(id);
  await prisma.city.delete({ where: { id } });
}
