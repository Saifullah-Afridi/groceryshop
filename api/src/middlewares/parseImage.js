import multer from "multer";
import { httpError } from "../lib/httpError.js";

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function detectImage(buffer) {
  if (!buffer || buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { mime: "image/jpeg", extension: ".jpg" };
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { mime: "image/png", extension: ".png" };
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return { mime: "image/webp", extension: ".webp" };
  const signature = buffer.toString("ascii", 0, 6);
  if (signature === "GIF87a" || signature === "GIF89a") return { mime: "image/gif", extension: ".gif" };
  return null;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(httpError(400, "Only JPG, PNG, and WebP images are allowed (maximum 4 MB)."));
    }
    cb(null, true);
  },
}).single("image");

// Validate the actual file signature as well as the browser-supplied MIME type.
export function parseImage(req, res, next) {
  upload(req, res, (error) => {
    if (error) return next(error);
    if (!req.file) return next();
    const detected = detectImage(req.file.buffer);
    if (!detected || detected.mime !== req.file.mimetype) {
      return next(httpError(400, "The uploaded file is not a valid supported image."));
    }
    req.file.detectedExtension = detected.extension;
    req.file.mimetype = detected.mime;
    next();
  });
}
