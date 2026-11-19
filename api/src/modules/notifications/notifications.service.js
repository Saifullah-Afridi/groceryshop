import { prisma } from "../../lib/prisma.js";
import { httpError } from "../../lib/httpError.js";

const dto = (n) => ({ id: n.id, title: n.title, message: n.message, orderId: n.orderId, isRead: n.isRead, createdAt: n.createdAt.toISOString() });

export async function listNotifications(audience, customerId) {
  const rows = await prisma.notification.findMany({
    where: audience === "ADMIN" ? { audience: "ADMIN" } : { audience: "CUSTOMER", customerId },
    orderBy: { createdAt: "desc" }, take: 50,
  });
  return rows.map(dto);
}

export async function markNotificationRead(id, audience, customerId) {
  // Keep the audience/customer condition in the write itself, not only in a prior read.
  const where = audience === "ADMIN"
    ? { id, audience: "ADMIN" }
    : { id, audience: "CUSTOMER", customerId };
  const result = await prisma.notification.updateMany({ where, data: { isRead: true } });
  if (result.count !== 1) throw httpError(404, "Notification not found.");
  return dto(await prisma.notification.findUnique({ where: { id } }));
}

export async function markAllNotificationsRead(audience, customerId) {
  await prisma.notification.updateMany({ where: audience === "ADMIN" ? { audience: "ADMIN", isRead: false } : { audience: "CUSTOMER", customerId, isRead: false }, data: { isRead: true } });
  return { success: true };
}
