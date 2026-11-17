import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { env } from "../config/env.js";
import { httpError } from "./httpError.js";

// Supabase Storage API endpoint.
const objectUrl = `${env.supabaseUrl.replace(/\/$/, "")}/storage/v1/object`;

// Authentication headers for both old and new Supabase keys.
const authHeaders = () => ({
  apikey: env.supabaseKey,

  // Only legacy JWT-based service_role keys should be sent as Bearer tokens.
  ...(env.supabaseKey.startsWith("eyJ")
    ? { Authorization: `Bearer ${env.supabaseKey}` }
    : {}),
});

// Upload an image to Supabase Storage and return its public URL.
export async function uploadImage(file, folder) {
  // Re-validate and normalize every accepted upload on the server. Never trust
  // the browser MIME type or file extension as proof of image content.
  let optimized;
  try {
    const image = sharp(file.buffer, { failOn: "error", limitInputPixels: 40_000_000 });
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height || metadata.width < 300 || metadata.height < 300) {
      throw httpError(400, "Image dimensions must be at least 300 × 300 pixels.");
    }
    if (!["jpeg", "png", "webp"].includes(metadata.format)) {
      throw httpError(400, "Only JPG, PNG, and WebP images are supported.");
    }
    optimized = await sharp(file.buffer, { failOn: "error", limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 87, effort: 4 })
      .toBuffer();
  } catch (error) {
    if (error?.status) throw error;
    throw httpError(400, "The uploaded file is not a valid image or could not be processed.");
  }

  const filePath = `${folder}/${randomUUID()}.webp`;

  let response;

  try {
    response = await fetch(`${objectUrl}/${env.bucket}/${filePath}`, {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "image/webp",
        "Cache-Control": "max-age=31536000",
        "x-upsert": "false",
      },
      body: optimized,
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
