import { readPagination } from "../../lib/pagination.js";
import { httpError } from "../../lib/httpError.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { readId } from "../../lib/readId.js";
import { createCity, deleteCity, listCities, updateCity } from "./cities.service.js";
import { createCitySchema, updateCitySchema } from "./cities.validation.js";

export const listActive = asyncHandler(async (_req, res) => {
  res.json(await listCities({ onlyActive: true }));
});

export const listAll = asyncHandler(async (req, res) => {
  const query = readPagination(req.query);
  const allowedSorts = ["oldest", "name-asc", "name-desc", "fee-asc", "fee-desc"];
  if (query.sort && !allowedSorts.includes(query.sort)) throw httpError(400, "Invalid city sort option.");
  res.json(await listCities({ onlyActive: false, ...query }));
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await createCity(createCitySchema.parse(req.body)));
});

export const update = asyncHandler(async (req, res) => {
  res.json(await updateCity(readId(req), updateCitySchema.parse(req.body)));
});

export const remove = asyncHandler(async (req, res) => {
  await deleteCity(readId(req));
  res.status(204).end();
});
