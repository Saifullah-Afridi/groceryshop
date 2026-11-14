import { randomUUID } from "node:crypto";
import path from "node:path";
import { env } from "../config/env.js";
import { httpError } from "./httpError.js";

const objectUrl = `${env.supabaseUrl.replace(/\/$/, "")}/storage/v1/object`;

// Configure authentication for both Supabase key formats.
const authHeaders = () => {
  const key = env.supabaseKey;

  if (!key) {
    throw httpError(500, "Supabase Storage key is not configured.");
  }

  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
};

// Upload an image to Supabase Storage and return its public URL.
export async function uploadImage(file, folder) {
  const extension =
    file.detectedExtension ||
    path.extname(file.originalname).toLowerCase() ||
    ".jpg";

  const filePath = `${folder}/${randomUUID()}${extension}`;

  let response;

  try {
    response = await fetch(`${objectUrl}/${env.bucket}/${filePath}`, {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": file.mimetype,
        "Cache-Control": "max-age=31536000",
        "x-upsert": "false",
      },
      body: file.buffer,
    });
  } catch {
    throw httpError(
      502,
      "Could not reach Supabase Storage. Check SUPABASE_URL and your internet connection.",
    );
  }

  if (!response.ok) {
    const detail = await response.json().catch(() => null);

    throw httpError(
      502,
      `Could not upload the image: ${
        detail?.message ?? detail?.error ?? response.statusText
      }`,
    );
  }

  return `${objectUrl}/public/${env.bucket}/${filePath}`;
}

// Delete an image previously uploaded to Supabase Storage.
// A deletion failure must never break the main request.
export async function deleteImage(url) {
  if (!url) return;

  const marker = `/object/public/${env.bucket}/`;
  const start = url.indexOf(marker);

  if (start === -1) return;

  try {
    await fetch(
      `${objectUrl}/${env.bucket}/${url.slice(start + marker.length)}`,
      {
        method: "DELETE",
        headers: authHeaders(),
      },
    );
  } catch {
    // Ignore deletion failures.
  }
}
