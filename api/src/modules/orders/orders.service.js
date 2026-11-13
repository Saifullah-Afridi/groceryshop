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

const normalizeOrderStatus = (status) =>
  ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"].includes(status) ? "ON_THE_WAY" : status;

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
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw httpError(401, "Please sign in again.");

  const wanted = new Map(); // the same product listed twice becomes one line
  for (const { productId, quantity } of input.items) wanted.set(productId, (wanted.get(productId) ?? 0) + quantity);

  const products = await prisma.product.findMany({ where: { id: { in: [...wanted.keys()] } } });
  if (products.length !== wanted.size) {
    throw httpError(400, "A product in your cart is no longer available. Remove it and try again.");
  }
  const city = await prisma.city.findFirst({ where: { id: input.cityId, active: true } });
  if (!city) throw httpError(400, "We do not deliver to that city.");

  const lines = products.map((product) => {
    const quantity = Math.round(wanted.get(product.id) * 100) / 100;
    const units = priceUnits(product, quantity);
    // One price per 0.25 kg (or per piece) and one percentage discount on the whole line.
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
  const subtotalCents = lines.reduce((sum, line) => sum + line.cents, 0);
  const feeCents = toCents(city.fee);

  const order = await prisma.order.create({
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
      items: { create: lines.map(({ cents, ...line }) => line) },
    },
    include: { items: true },
  });
  return toDto(order);
}

export async function listMyOrders(customerId) {
  const rows = await prisma.order.findMany({ where: { customerId }, orderBy: { id: "desc" }, include: { items: true } });
  return rows.map(toDto);
}

export async function cancelMyOrder(customerId, id) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.customerId !== customerId) throw httpError(404, "Order not found.");
  if (order.status !== "PENDING") throw httpError(409, "This order can no longer be cancelled. Please call us.");
  return toDto(await prisma.order.update({ where: { id }, data: { status: "CANCELLED" }, include: { items: true } }));
}

// ---------- admin ----------
export async function listOrders({ status, q }) {
  const asNumber = Number(q);
  const rows = await prisma.order.findMany({
    where: {
      ...(status === "ON_THE_WAY"
        ? { status: { in: ["ON_THE_WAY", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"] } }
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
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) throw httpError(404, "Order not found.");
  return toDto(order);
}

export async function setOrderStatus(id, status) {
  if (!["PENDING", "ON_THE_WAY", "DELIVERED", "CANCELLED"].includes(status)) {
    throw httpError(400, "Invalid order status.");
  }
  await getOrder(id);
  return toDto(await prisma.order.update({ where: { id }, data: { status }, include: { items: true } }));
}
