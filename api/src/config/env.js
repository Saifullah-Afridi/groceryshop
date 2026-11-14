import "dotenv/config";

// Every setting the app reads comes from here, so there is one place to look.
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

const isProduction = process.env.NODE_ENV === "production";

const missing = [
  "DATABASE_URL",
  "JWT_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "SUPABASE_URL",
].filter((key) => !process.env[key]);

if (!supabaseKey) {
  missing.push("SUPABASE_SECRET_KEY");
}

if (isProduction && !process.env.SMTP_HOST) {
  missing.push("SMTP_HOST (needed to email verification codes)");
}

if (missing.length > 0) {
  console.error(
    `Missing environment variables: ${missing.join(", ")}\nCopy .env.example to .env and fill them in.`,
  );
  process.exit(1);
}

// The database and storage must belong to the same Supabase project.
const databaseRef = process.env.DATABASE_URL.match(
  /postgres\.([a-z0-9]+):/,
)?.[1];

const storageRef = process.env.SUPABASE_URL.match(
  /https:\/\/([a-z0-9]+)\.supabase\.co/,
)?.[1];

if (databaseRef && storageRef && databaseRef !== storageRef) {
  console.error(
    `SUPABASE_URL (project ${storageRef}) and DATABASE_URL (project ${databaseRef}) are from different Supabase projects.\nCopy both from the same project (see .env.example).`,
  );
  process.exit(1);
}

// Parse and normalize allowed frontend origins.
const clientOrigins = (process.env.CLIENT_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

export const env = {
  isProduction,
  port: Number(process.env.PORT ?? 4000),

  clientOrigins,

  jwtSecret: process.env.JWT_SECRET,

  adminEmail: process.env.ADMIN_EMAIL.trim().toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD,

  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey,

  bucket: process.env.SUPABASE_BUCKET ?? "rakan",

  // Email configuration.
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER?.trim(),
    pass: process.env.SMTP_PASS?.replace(/\s+/g, ""),
  },

  mailFrom: process.env.MAIL_FROM ?? "Rakan <no-reply@rakan.local>",
};
