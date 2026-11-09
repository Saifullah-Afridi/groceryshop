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

app.use(helmet());
app.use(cors({ origin: env.clientOrigins }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// To add a feature: make a folder in src/modules and mount its routes here.
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/cities", citiesRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);
