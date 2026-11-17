import imageCompression from "browser-image-compression";

const MAX_ORIGINAL_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Validate, compress and convert admin uploads to WebP before multipart upload. */
export async function prepareImageUpload(file: File): Promise<File> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Choose a JPG, PNG, or WebP image.");
  }
  if (file.size > MAX_ORIGINAL_BYTES) {
    throw new Error("The original image must not exceed 4 MB.");
  }
  const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve({ width: image.naturalWidth, height: image.naturalHeight }); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("The selected file is not a readable image.")); };
    image.src = url;
  });
  if (dimensions.width < 300 || dimensions.height < 300) {
    throw new Error("Image dimensions must be at least 300 × 300 pixels.");
  }
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.5, maxWidthOrHeight: 1600, useWebWorker: true,
    fileType: "image/webp", initialQuality: 0.88,
  });
  return new File([compressed], `${file.name.replace(/\.[^.]+$/, "")}.webp`, {
    type: "image/webp", lastModified: Date.now(),
  });
}
