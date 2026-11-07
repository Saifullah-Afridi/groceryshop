import { createHmac, randomInt } from "node:crypto";
import { env } from "../config/env.js";

export const generateOtp = () => String(randomInt(100000, 1000000)); // 6 digits

// Only the hash is saved, never the code itself.
export const hashOtp = (code, customerId) =>
  createHmac("sha256", env.jwtSecret).update(`${customerId}:${code}`).digest("hex");
