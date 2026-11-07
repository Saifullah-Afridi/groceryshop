import { httpError } from "../../lib/httpError.js";
import { prisma } from "../../lib/prisma.js";

const toDto = (c) => ({ id: c.id, name: c.name, fee: Number(c.fee), active: c.active });

async function findOrFail(id) {
  const city = await prisma.city.findUnique({ where: { id } });
  if (!city) throw httpError(404, "City not found.");
  return city;
}

async function assertNameFree(name, exceptId) {
  const same = (await prisma.city.findMany({ where: {} })).find(
    (c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== exceptId,
  );
  if (same) throw httpError(409, "A city with this name already exists.");
}

// Shoppers only see active cities. The admin sees all of them.
export async function listCities({ onlyActive }) {
  const rows = await prisma.city.findMany({ where: onlyActive ? { active: true } : {}, orderBy: { id: "asc" } });
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
