import { Prisma } from "@prisma/client";
import { httpError } from "../../lib/httpError.js";
import { fromCents, toCents } from "../../lib/money.js";
import { prisma } from "../../lib/prisma.js";
import { MAX_QUANTITY } from "./orders.validation.js";
import { publishNotification } from "../notifications/notifications.realtime.js";

const itemDto = (i) => ({
  id: i.id,
  productId: i.productId,
  productName: i.productName,
  unit: i.unit,
  unitPrice: Number(i.unitPrice),
  quantity: i.quantity,
  lineTotal: Number(i.lineTotal),
});

const normalizeOrderStatus = (status) =>
  ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"].includes(status)
    ? "ON_THE_WAY"
    : status;

const toDto = (o) => ({
  id: o.id,
  status: normalizeOrderStatus(o.status),
  name: o.name,
  phone: o.phone,
  address: o.address,
  city: o.city,
  note: o.note,
  subtotal: Number(o.subtotal),
  deliveryFee: Number(o.deliveryFee),
  total: Number(o.total),
  createdAt: o.createdAt.toISOString(),
  items: (o.items ?? []).map(itemDto),
});

// Publish only after the database transaction commits.
// Realtime failures must never undo a successful order operation.
function publishAfterCommit(notifications) {
  for (const notification of notifications) {
    if (!notification) continue;

    try {
      publishNotification(notification);
    } catch (error) {
      console.error("Failed to publish notification event:", error);
    }
  }
}

/**
 * Reserve stock for all order lines in one SQL statement.
 * This keeps the stock check and decrement atomic.
 */
async function reserveStock(tx, lines, products) {
  if (lines.length === 0) return;

  const values = lines.map(
    (line) => Prisma.sql`(${line.productId}, ${line.quantity})`,
  );

  const updated = await tx.$queryRaw(Prisma.sql`
    UPDATE "Product" AS product
    SET "stockQuantity" = product."stockQuantity" - requested.quantity
    FROM (VALUES ${Prisma.join(values)}) AS requested(id, quantity)
    WHERE product.id = requested.id
      AND product."stockQuantity" >= requested.quantity
    RETURNING product.id
  `);

  if (updated.length !== lines.length) {
    const updatedIds = new Set(updated.map((row) => row.id));
    const unavailable = lines.find((line) => !updatedIds.has(line.productId));
    const product = products.find((item) => item.id === unavailable?.productId);

    throw httpError(
      409,
      `${product?.name ?? "A product"} does not have enough stock. Please update your cart.`,
    );
  }
}

/** Restore stock for cancelled orders in one database round-trip. */
async function restoreStock(tx, items) {
  const restockable = items.filter((item) => item.productId != null);

  if (restockable.length === 0) return;

  const values = restockable.map(
    (item) => Prisma.sql`(${item.productId}, ${item.quantity})`,
  );

  await tx.$queryRaw(Prisma.sql`
    UPDATE "Product" AS product
    SET "stockQuantity" = product."stockQuantity" + requested.quantity
    FROM (VALUES ${Prisma.join(values)}) AS requested(id, quantity)
    WHERE product.id = requested.id
    RETURNING product.id
  `);
}

function priceUnits(product, quantity) {
  const step = product.unit === "kg" ? 0.25 : 1;
  const units = quantity / step;

  if (quantity <= 0 || Math.abs(units - Math.round(units)) > 1e-9) {
    throw httpError(
      400,
      `${product.name}: the quantity must go up in steps of ${step}${product.unit === "kg" ? " kg" : ""}.`,
    );
  }

  if (quantity > MAX_QUANTITY) {
    throw httpError(
      400,
      `${product.name}: the most you can order is ${MAX_QUANTITY}.`,
    );
  }

  return Math.round(units);
}

// Everything that costs money is read from the database here.
export async function createOrder(customerId, input) {
  const result = await prisma.$transaction(
    async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        throw httpError(401, "Please sign in again.");
      }

      const wanted = new Map();

      for (const { productId, quantity } of input.items) {
        wanted.set(
          productId,
          Math.round(((wanted.get(productId) ?? 0) + quantity) * 100) / 100,
        );
      }

      const products = await tx.product.findMany({
        where: { id: { in: [...wanted.keys()] } },
      });

      if (
        products.length !== wanted.size ||
        products.some((product) => product.isArchived)
      ) {
        throw httpError(
          400,
          "A product in your cart is no longer available. Remove it and try again.",
        );
      }

      const city = await tx.city.findFirst({
        where: { id: input.cityId, active: true },
      });

      if (!city) {
        throw httpError(400, "We do not deliver to that city.");
      }

      const lines = products.map((product) => {
        const quantity = wanted.get(product.id);
        const units = priceUnits(product, quantity);
        const baseCents = toCents(product.price) * units;
        const discountPercent = Number(product.discount ?? 0);
        const lineCents = Math.round(baseCents * (1 - discountPercent / 100));
        const unitCents = units ? Math.round(lineCents / units) : lineCents;

        return {
          productId: product.id,
          productName: product.name,
          unit: product.unit,
          unitPrice: fromCents(unitCents),
          quantity,
          lineTotal: fromCents(lineCents),
          cents: lineCents,
        };
      });

      // Reserve stock atomically.
      await reserveStock(tx, lines, products);

      const subtotalCents = lines.reduce((sum, line) => sum + line.cents, 0);

      const feeCents = toCents(city.fee);

      const order = await tx.order.create({
        data: {
          customerId,
          name: input.name,
          phone: input.phone,
          address: input.address,
          city: city.name,
          note: input.note,
          subtotal: fromCents(subtotalCents),
          deliveryFee: fromCents(feeCents),
          total: fromCents(subtotalCents + feeCents),
          stockReserved: true,
          items: {
            create: lines.map(({ cents, ...line }) => line),
          },
        },
        include: { items: true },
      });

      const notification = await tx.notification.create({
        data: {
          audience: "ADMIN",
          title: "New order received",
          message: `Order #${order.id} was placed by ${order.name}.`,
          orderId: order.id,
        },
      });

      return {
        order: toDto(order),
        notification,
      };
    },
    { maxWait: 10000, timeout: 15000 },
  );

  // Publish after successful transaction commit.
  publishAfterCommit([result.notification]);

  return result.order;
}

export async function listMyOrders(customerId) {
  const rows = await prisma.order.findMany({
    where: { customerId },
    orderBy: { id: "desc" },
    include: { items: true },
  });

  return rows.map(toDto);
}

export async function cancelMyOrder(customerId, id) {
  const result = await prisma.$transaction(
    async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order || order.customerId !== customerId) {
        throw httpError(404, "Order not found.");
      }

      if (order.status !== "PENDING") {
        throw httpError(
          409,
          "This order can no longer be cancelled. Please call us.",
        );
      }

      const changed = await tx.order.updateMany({
        where: { id, customerId, status: "PENDING" },
        data: {
          status: "CANCELLED",
          stockReserved: false,
        },
      });

      if (changed.count !== 1) {
        throw httpError(
          409,
          "This order has already changed. Refresh and try again.",
        );
      }

      if (order.stockReserved) {
        await restoreStock(tx, order.items);
      }

      const customerNotification = await tx.notification.create({
        data: {
          audience: "CUSTOMER",
          customerId,
          title: "Your order was cancelled",
          message: `Order #${id} was cancelled successfully.`,
          orderId: id,
        },
      });

      const adminNotification = await tx.notification.create({
        data: {
          audience: "ADMIN",
          title: "Order cancelled by customer",
          message: `Order #${id} was cancelled by ${order.name}.`,
          orderId: id,
        },
      });

      return {
        order: toDto({
          ...order,
          status: "CANCELLED",
          stockReserved: false,
        }),
        notifications: [customerNotification, adminNotification],
      };
    },
    { maxWait: 10000, timeout: 15000 },
  );

  publishAfterCommit(result.notifications);

  return result.order;
}

// ---------- admin ----------

export async function listOrders({ status, q }) {
  const asNumber = Number(q);

  const rows = await prisma.order.findMany({
    where: {
      ...(status === "ON_THE_WAY"
        ? {
            status: {
              in: ["ON_THE_WAY", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"],
            },
          }
        : status && { status }),

      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
          ...(Number.isInteger(asNumber) ? [{ id: asNumber }] : []),
        ],
      }),
    },
    orderBy: { id: "desc" },
    take: 300,
    include: { items: true },
  });

  return rows.map(toDto);
}

export async function getOrder(id) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    throw httpError(404, "Order not found.");
  }

  return toDto(order);
}

export async function setOrderStatus(id, status) {
  if (!["PENDING", "ON_THE_WAY", "DELIVERED", "CANCELLED"].includes(status)) {
    throw httpError(400, "Invalid order status.");
  }

  const result = await prisma.$transaction(
    async (tx) => {
      const current = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!current) {
        throw httpError(404, "Order not found.");
      }

      const currentStatus = normalizeOrderStatus(current.status);

      if (currentStatus === "CANCELLED" && status !== "CANCELLED") {
        throw httpError(
          409,
          "A cancelled order cannot be reopened. Create a new order instead.",
        );
      }

      if (currentStatus === "DELIVERED" && status !== "DELIVERED") {
        throw httpError(
          409,
          "A delivered order cannot be changed. Handle any issue as a return instead.",
        );
      }

      if (currentStatus === status) {
        return {
          order: toDto(current),
          notification: null,
        };
      }

      const allowedNext = {
        PENDING: ["ON_THE_WAY", "CANCELLED"],
        ON_THE_WAY: ["DELIVERED"],
        DELIVERED: [],
        CANCELLED: [],
      };

      if (!allowedNext[currentStatus]?.includes(status)) {
        throw httpError(
          409,
          `Cannot change an order from ${currentStatus} to ${status}.`,
        );
      }

      const changed = await tx.order.updateMany({
        where: { id, status: current.status },
        data: {
          status,
          ...(status === "CANCELLED" ? { stockReserved: false } : {}),
        },
      });

      if (changed.count !== 1) {
        throw httpError(
          409,
          "This order has already changed. Refresh and try again.",
        );
      }

      if (status === "CANCELLED" && current.stockReserved) {
        await restoreStock(tx, current.items);
      }

      let notification = null;

      if (current.customerId) {
        const labels = {
          ON_THE_WAY: "Your order is on the way",
          DELIVERED: "Your order has been delivered",
          CANCELLED: "Your order was cancelled",
        };

        notification = await tx.notification.create({
          data: {
            audience: "CUSTOMER",
            customerId: current.customerId,
            title: labels[status] ?? "Order update",
            message: `The status of order #${id} changed to ${status
              .replaceAll("_", " ")
              .toLowerCase()}.`,
            orderId: id,
          },
        });
      }

      return {
        order: toDto({
          ...current,
          status,
          ...(status === "CANCELLED" ? { stockReserved: false } : {}),
        }),
        notification,
      };
    },
    { maxWait: 10000, timeout: 15000 },
  );

  publishAfterCommit([result.notification]);

  return result.order;
}
