import { httpError } from "../../lib/httpError.js";
import { fromCents, toCents } from "../../lib/money.js";
import { prisma } from "../../lib/prisma.js";
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

const toDto = (o) => ({
  id: o.id,
  status: o.status,
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
  // Combine duplicate cart rows before checking or reserving inventory.
  const wanted = new Map();
  for (const { productId, quantity } of input.items) {
    wanted.set(productId, (wanted.get(productId) ?? 0) + quantity);
  }

  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({ where: { id: customerId }, select: { id: true } });
    if (!customer) throw httpError(401, "Please sign in again.");

    const products = await tx.product.findMany({ where: { id: { in: [...wanted.keys()] } } });
    if (products.length !== wanted.size) {
      throw httpError(400, "A product in your cart is no longer available. Remove it and try again.");
    }
    const city = await tx.city.findFirst({ where: { id: input.cityId, active: true } });
    if (!city) throw httpError(400, "We do not deliver to that city.");

    const lines = products.map((product) => {
      const quantity = Math.round(wanted.get(product.id) * 100) / 100;
      const units = priceUnits(product, quantity);
      if (quantity > Number(product.stockQuantity)) {
        throw httpError(409, `${product.name}: only ${Number(product.stockQuantity)} ${product.unit} currently available.`);
      }
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

    // Atomic conditional decrements prevent two concurrent checkouts from overselling stock.
    for (const line of lines) {
      const reserved = await tx.product.updateMany({
        where: { id: line.productId, stockQuantity: { gte: line.quantity } },
        data: { stockQuantity: { decrement: line.quantity } },
      });
      if (reserved.count !== 1) {
        const product = products.find((p) => p.id === line.productId);
        throw httpError(409, `${line.productName}: stock has changed. Available quantity is ${Number(product?.stockQuantity ?? 0)} ${line.unit}. Please update your cart.`);
      }
    }

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
        status: "PENDING",
        subtotal: fromCents(subtotalCents),
        deliveryFee: fromCents(feeCents),
        total: fromCents(subtotalCents + feeCents),
        items: { create: lines.map(({ cents, ...line }) => line) },
      },
      include: { items: true },
    });
    return toDto(order);
  }, { maxWait: 10000, timeout: 20000 });
}

export async function listMyOrders(customerId) {
  const rows = await prisma.order.findMany({ where: { customerId }, orderBy: { id: "desc" }, include: { items: true } });
  return rows.map(toDto);
}

export async function cancelMyOrder(customerId, id) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.customerId !== customerId) throw httpError(404, "Order not found.");
  if (order.status !== "PENDING") throw httpError(409, "This order can no longer be cancelled. Please call us.");
  return prisma.$transaction(async (tx) => {
    const current = await tx.order.findFirst({ where: { id, customerId, status: "PENDING" }, include: { items: true } });
    if (!current) throw httpError(409, "This order can no longer be cancelled. Please call us.");
    const changed = await tx.order.updateMany({ where: { id, customerId, status: "PENDING" }, data: { status: "CANCELLED" } });
    if (changed.count !== 1) throw httpError(409, "This order can no longer be cancelled. Please call us.");
    for (const item of current.items) {
      if (item.productId != null) await tx.product.updateMany({ where: { id: item.productId }, data: { stockQuantity: { increment: item.quantity } } });
    }
    return toDto({ ...current, status: "CANCELLED" });
  }, { maxWait: 10000, timeout: 20000 });
}

// ---------- admin ----------
export async function listOrders({ status, q }) {
  const asNumber = Number(q);
  const rows = await prisma.order.findMany({
    where: {
      ...(status && { status }),
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
    take: 100,
    include: { items: true },
  });
  return rows.map(toDto);
}

export async function getOrder(id) {
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) throw httpError(404, "Order not found.");
  return toDto(order);
}

export async function setOrderStatus(id, status) {
  await getOrder(id);
  return toDto(await prisma.order.update({ where: { id }, data: { status }, include: { items: true } }));
}
