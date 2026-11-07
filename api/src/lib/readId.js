import { httpError } from "./httpError.js";

// Reads :id from the URL and makes sure it is a whole number.
export function readId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw httpError(400, "Invalid id.");
  return id;
}
