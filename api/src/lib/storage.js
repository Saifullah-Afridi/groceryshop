import { randomUUID } from "node:crypto";
import path from "node:path";
import { env } from "../config/env.js";
import { httpError } from "./httpError.js";

// We call Supabase Storage directly over HTTP instead of using the supabase-js library.
// The new sb_secret_... key must go in the "apikey" header only. supabase-js also sends it as
// "Authorization: Bearer ...", and Storage then fails with "JWS Protected Header is invalid".
const objectUrl = `${env.supabaseUrl.replace(/\/$/, "")}/storage/v1/object`;

const authHeaders = () => ({
  apikey: env.supabaseKey,
  // An old-style service_role key is a JWT and is sent in Authorization as well.
  ...(env.supabaseKey.startsWith("eyJ") && { Authorization: `Bearer ${env.supabaseKey}` }),
});

// Upload an image to the Supabase bucket and return its public URL.
export async function uploadImage(file, folder) {
  const extension = file.detectedExtension || path.extname(file.originalname).toLowerCase() || ".jpg";
  const filePath = `${folder}/${randomUUID()}${extension}`;

  let response;
  try {
    response = await fetch(`${objectUrl}/${env.bucket}/${filePath}`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": file.mimetype, "Cache-Control": "max-age=31536000", "x-upsert": "false" },
      body: file.buffer,
    });
  } catch {
    throw httpError(502, "Could not reach Supabase Storage. Check SUPABASE_URL and your internet connection.");
  }
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw httpError(502, `Could not upload the image: ${detail?.message ?? detail?.error ?? response.statusText}`);
  }
  return `${objectUrl}/public/${env.bucket}/${filePath}`;
}

// Remove an image we uploaded earlier. A failure here must never break the request.
export async function deleteImage(url) {
  if (!url) return;
  const marker = `/object/public/${env.bucket}/`;
  const start = url.indexOf(marker);
  if (start === -1) return;
  try {
    await fetch(`${objectUrl}/${env.bucket}/${url.slice(start + marker.length)}`, { method: "DELETE", headers: authHeaders() });
  } catch {
    /* ignore */
  }
}
