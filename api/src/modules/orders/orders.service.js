import { httpError } from "../../lib/httpError.js";
import { fromCents, toCents } from "../../lib/money.js";
import { prisma } from "../../lib/prisma.js";
import { translateCustomerField } from "../../lib/translate.js";
import { MAX_QUANTITY } from "./orders.validation.js";

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
  ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"].includes(status) ? "ON_THE_WAY" : status;

const toDto = (o) => ({
  id: o.id,
  status: normalizeOrderStatus(o.status),
  name: o.name,
  phone: o.phone,
  address: o.address,
  addressAr: o.addressAr ?? "",
  city: o.city,
  note: o.note,
  noteAr: o.noteAr ?? "",
  subtotal: Number(o.subtotal),
  deliveryFee: Number(o.deliveryFee),
  total: Number(o.total),
  createdAt: o.createdAt.toISOString(),
  items: (o.items ?? []).map(itemDto),
});

// A product's price is for 0.25 kg when sold by weight, otherwise for one selected selling unit.
// This turns the quantity into the number of price units, and refuses anything that does not fit.
function priceUnits(product, quantity) {
  const step = product.unit === "kg" ? 0.25 : 1;
  const units = quantity / step;
  if (quantity <= 0 || Math.abs(units - Math.round(units)) > 1e-9) {
    throw httpError(400, `${product.name}: the quantity must go up in steps of ${step}${product.unit === "kg" ? " kg" : ""}.`);
  }
  if (quantity > MAX_QUANTITY) throw httpError(400, `${product.name}: the most you can order is ${MAX_QUANTITY}.`);
  return Math.round(units);
}

// Everything that costs money is read from the database here. The request only says WHAT and HOW MUCH.
export async function createOrder(customerId, input) {
  // Translate only delivery address and instructions. Names and phone numbers are never sent.
  let addressPair;
  let notePair;
  try {
    [addressPair, notePair] = await Promise.all([
      translateCustomerField(input.address, input.language),
      translateCustomerField(input.note, input.language),
    ]);
  } catch (error) {
    console.error("Checkout delivery translation failed:", error.message);
    throw httpError(503, "Delivery detail translation is temporarily unavailable. Please try again in a moment.");
  }
  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw httpError(401, "Please sign in again.");

    const wanted = new Map(); // repeated cart lines are combined before stock is reserved
    for (const { productId, quantity } of input.items) {
      wanted.set(productId, Math.round(((wanted.get(productId) ?? 0) + quantity) * 100) / 100);
    }

    const products = await tx.product.findMany({ where: { id: { in: [...wanted.keys()] } } });
    if (products.length !== wanted.size || products.some((product) => product.isArchived)) {
      throw httpError(400, "A product in your cart is no longer available. Remove it and try again.");
    }
    const city = await tx.city.findFirst({ where: { id: input.cityId, active: true } });
    if (!city) throw httpError(400, "We do not deliver to that city.");

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

    // Reserve stock with a conditional decrement. The database condition prevents
    // concurrent checkouts from selling the same remaining units twice.
    for (const line of lines) {
      const reserved = await tx.product.updateMany({
        where: { id: line.productId, stockQuantity: { gte: line.quantity } },
        data: { stockQuantity: { decrement: line.quantity } },
      });
      if (reserved.count !== 1) {
        const product = products.find((item) => item.id === line.productId);
        throw httpError(409, `${product?.name ?? "A product"} does not have enough stock. Please update your cart.`);
      }
    }

    const subtotalCents = lines.reduce((sum, line) => sum + line.cents, 0);
    const feeCents = toCents(city.fee);
    const order = await tx.order.create({
      data: {
        customerId,
        name: input.name,
        phone: input.phone,
        address: addressPair.en,
        addressAr: addressPair.ar,
        city: city.name,
        note: notePair.en,
        noteAr: notePair.ar,
        subtotal: fromCents(subtotalCents),
        deliveryFee: fromCents(feeCents),
        total: fromCents(subtotalCents + feeCents),
        stockReserved: true,
        items: { create: lines.map(({ cents, ...line }) => line) },
      },
      include: { items: true },
    });
    await tx.notification.create({ data: { audience: "ADMIN", title: "New order received", message: `Order #${order.id} was placed by ${order.name}.`, orderId: order.id } });
    return toDto(order);
  });
}

export async function listMyOrders(customerId) {
  const rows = await prisma.order.findMany({ where: { customerId }, orderBy: { id: "desc" }, include: { items: true } });
  return rows.map(toDto);
}

export async function cancelMyOrder(customerId, id) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!order || order.customerId !== customerId) throw httpError(404, "Order not found.");
    if (order.status !== "PENDING") throw httpError(409, "This order can no longer be cancelled. Please call us.");

    const changed = await tx.order.updateMany({
      where: { id, customerId, status: "PENDING" },
      data: { status: "CANCELLED", stockReserved: false },
    });
    if (changed.count !== 1) throw httpError(409, "This order has already changed. Refresh and try again.");

    // Older orders have stockReserved=false, so cancelling them won't incorrectly
    // add stock that was never deducted before this inventory fix was deployed.
    if (order.stockReserved) {
      for (const item of order.items) {
        if (item.productId == null) continue;
        await tx.product.updateMany({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }
    }

    await tx.notification.create({ data: { audience: "CUSTOMER", customerId, title: "Your order was cancelled", message: `Order #${id} was cancelled successfully.`, orderId: id } });
    return toDto(await tx.order.findUnique({ where: { id }, include: { items: true } }));
  });
}

// ---------- admin ----------
export async function listOrders({ status, q, search, page = 1, limit = 20, sort = "newest" }) {
  const term = String(search ?? q ?? "").trim();
  const asNumber = Number(term);
  const where = {
    ...(status === "ON_THE_WAY"
      ? { status: { in: ["ON_THE_WAY", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"] } }
      : status && { status }),
    ...(term && { OR: [
      { name: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } },
      { city: { contains: term, mode: "insensitive" } },
      ...(Number.isInteger(asNumber) && asNumber > 0 ? [{ id: asNumber }] : []),
    ] }),
  };
  const orderBy = sort === "oldest" ? [{ createdAt: "asc" }, { id: "asc" }] : [{ createdAt: "desc" }, { id: "desc" }];
  const skip = (page - 1) * limit;
  const countWhere = { ...(term && where.OR ? { OR: where.OR } : {}) };
  const [rows, total, grouped] = await prisma.$transaction([
    prisma.order.findMany({ where, skip, take: limit, orderBy, include: { items: true } }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ["status"], where: countWhere, _count: { _all: true } }),
  ]);
  const statusCounts = { PENDING: 0, ON_THE_WAY: 0, DELIVERED: 0, CANCELLED: 0 };
  for (const group of grouped) {
    const key = normalizeOrderStatus(group.status);
    statusCounts[key] = (statusCounts[key] ?? 0) + group._count._all;
  }
  const totalPages = Math.ceil(total / limit);
  return { data: rows.map(toDto), statusCounts, pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 && totalPages > 0 } };
}

export async function getOrder(id) {
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) throw httpError(404, "Order not found.");
  return toDto(order);
}

export async function setOrderStatus(id, status) {
  if (!["PENDING", "ON_THE_WAY", "DELIVERED", "CANCELLED"].includes(status)) {
    throw httpError(400, "Invalid order status.");
  }

  return prisma.$transaction(async (tx) => {
    const current = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!current) throw httpError(404, "Order not found.");
    const currentStatus = normalizeOrderStatus(current.status);
    if (currentStatus === "CANCELLED" && status !== "CANCELLED") {
      throw httpError(409, "A cancelled order cannot be reopened. Create a new order instead.");
    }
    if (currentStatus === "DELIVERED" && status !== "DELIVERED") {
      throw httpError(409, "A delivered order cannot be changed. Handle any issue as a return instead.");
    }
    if (currentStatus === status) return toDto(current);

    const allowedNext = {
      PENDING: ["ON_THE_WAY", "CANCELLED"],
      ON_THE_WAY: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: [],
    };
    if (!allowedNext[currentStatus]?.includes(status)) {
      throw httpError(409, `Cannot change an order from ${currentStatus} to ${status}.`);
    }

    const changed = await tx.order.updateMany({
      where: { id, status: current.status },
      data: { status, ...(status === "CANCELLED" ? { stockReserved: false } : {}) },
    });
    if (changed.count !== 1) throw httpError(409, "This order has already changed. Refresh and try again.");

    if (status === "CANCELLED" && current.stockReserved) {
      for (const item of current.items) {
        if (item.productId == null) continue;
        await tx.product.updateMany({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }
    }

    if (current.customerId) {
      const labels = { ON_THE_WAY: "Your order is on the way", DELIVERED: "Your order has been delivered", CANCELLED: "Your order was cancelled" };
      await tx.notification.create({ data: { audience: "CUSTOMER", customerId: current.customerId, title: labels[status] ?? "Order update", message: `The status of order #${id} changed to ${status.replaceAll("_", " ").toLowerCase()}.`, orderId: id } });
    }
    return toDto(await tx.order.findUnique({ where: { id }, include: { items: true } }));
  });
}

