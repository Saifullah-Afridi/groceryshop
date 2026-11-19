import { createHash } from "node:crypto";
import { prisma } from "../lib/prisma.js";

let lastCleanupAt = 0;

/** Shared, database-backed rate limiter. It is consistent across Vercel instances. */
export function databaseRateLimit({ windowMs, limit, namespace, message = "Too many requests. Please try again later." }) {
  if (!windowMs || !limit || !namespace) throw new Error("Invalid database rate-limit configuration.");

  return async function rateLimitMiddleware(req, res, next) {
    try {
      const ip = req.ip || req.socket?.remoteAddress || "unknown";
      const identity = req.auth?.sub ? `customer:${req.auth.sub}:${ip}` : `ip:${ip}`;
      const key = createHash("sha256").update(`${namespace}:${identity}`).digest("hex");
      const now = new Date();
      const resetAt = new Date(now.getTime() + windowMs);

      const rows = await prisma.$queryRaw`
        INSERT INTO "RateLimitBucket" ("key", "count", "resetAt")
        VALUES (${key}, 1, ${resetAt})
        ON CONFLICT ("key") DO UPDATE SET
          "count" = CASE WHEN "RateLimitBucket"."resetAt" <= ${now}
                          THEN 1 ELSE "RateLimitBucket"."count" + 1 END,
          "resetAt" = CASE WHEN "RateLimitBucket"."resetAt" <= ${now}
                            THEN ${resetAt} ELSE "RateLimitBucket"."resetAt" END
        RETURNING "count", "resetAt"
      `;

      const bucket = rows[0];
      if (Date.now() - lastCleanupAt > 5 * 60 * 1000) {
        lastCleanupAt = Date.now();
        void prisma.$executeRaw`DELETE FROM "RateLimitBucket" WHERE "resetAt" < ${new Date(Date.now() - 24 * 60 * 60 * 1000)}`.catch((cleanupError) => {
          console.warn("Rate-limit bucket cleanup failed:", cleanupError?.message ?? cleanupError);
        });
      }
      res.setHeader("RateLimit-Limit", String(limit));
      res.setHeader("RateLimit-Remaining", String(Math.max(0, limit - Number(bucket.count))));
      res.setHeader("RateLimit-Reset", String(Math.ceil(new Date(bucket.resetAt).getTime() / 1000)));

      if (Number(bucket.count) > limit) {
        return res.status(429).json({ message });
      }
      return next();
    } catch (error) {
      // Fail closed: if the shared limiter is unavailable, do not silently
      // disable protection on one serverless instance.
      console.error("Database rate limiter unavailable:", error?.message ?? error);
      return res.status(503).json({ message: "Request protection is temporarily unavailable. Please retry shortly." });
    }
  };
}
