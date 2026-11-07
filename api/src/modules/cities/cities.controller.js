import { asyncHandler } from "../../lib/asyncHandler.js";
import { readId } from "../../lib/readId.js";
import { createCity, deleteCity, listCities, updateCity } from "./cities.service.js";
import { createCitySchema, updateCitySchema } from "./cities.validation.js";

export const listActive = asyncHandler(async (_req, res) => {
  res.json(await listCities({ onlyActive: true }));
});

export const listAll = asyncHandler(async (_req, res) => {
  res.json(await listCities({ onlyActive: false }));
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
