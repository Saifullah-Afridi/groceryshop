import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

import authRoutes from "./modules/auth/auth.routes.js";
import categoriesRoutes from "./modules/categories/categories.routes.js";
import citiesRoutes from "./modules/cities/cities.routes.js";
import customersRoutes from "./modules/customers/customers.routes.js";
import ordersRoutes from "./modules/orders/orders.routes.js";
import productsRoutes from "./modules/products/products.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";

export const app = express();

// Security middleware.
app.use(helmet());

// CORS configuration.
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header (health checks, server-to-server).
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");

      if (env.clientOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// Handle JSON requests.
app.use(express.json({ limit: "1mb" }));

// Health check.
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// API routes.
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/cities", citiesRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);

// Error handling.
app.use(notFound);
app.use(errorHandler);

// Required for Vercel Express deployment.
export default app;
