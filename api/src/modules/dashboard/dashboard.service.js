import { prisma } from "../../lib/prisma.js";

export async function getDashboard() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const activeOrderWhere = { createdAt: { gte: monthStart }, status: { not: "CANCELLED" } };

  const [productsCount, categoriesCount, today, month, pendingOrders, recentOrders, newCustomersToday, bestSellerGroups, lowStockCount, outOfStockCount, lowStock, outOfStock] = await Promise.all([
    prisma.product.count({ where: { isArchived: false } }),
    prisma.category.count(),
    prisma.order.aggregate({ where: { createdAt: { gte: start }, status: { not: "CANCELLED" } }, _sum: { total: true }, _count: { _all: true } }),
    prisma.order.aggregate({ where: activeOrderWhere, _sum: { total: true } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({ take: 8, orderBy: [{ createdAt: "desc" }, { id: "desc" }], select: { id: true, name: true, total: true, status: true, createdAt: true, _count: { select: { items: true } } } }),
    prisma.customer.count({ where: { createdAt: { gte: start } } }),
    prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      where: { order: { is: activeOrderWhere } },
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.$queryRaw`SELECT COUNT(*)::int AS count
      FROM "Product"
      WHERE "isArchived" = false AND "minQuantity" > 0
        AND "stockQuantity" > 0 AND "stockQuantity" <= "minQuantity"`,
    // Count every active out-of-stock product. This is deliberately separate
    // from the five-row preview below, so the dashboard number is never capped.
    prisma.product.count({
      where: { isArchived: false, stockQuantity: { lte: 0 } },
    }),
    prisma.$queryRaw`SELECT "id", "name", "nameAr", "stockQuantity", "minQuantity", "unit"
      FROM "Product"
      WHERE "isArchived" = false AND "minQuantity" > 0
        AND "stockQuantity" > 0 AND "stockQuantity" <= "minQuantity"
      ORDER BY "name" ASC, "id" ASC LIMIT 5`,
    prisma.product.findMany({
      where: { isArchived: false, stockQuantity: { lte: 0 } },
      select: { id: true, name: true, nameAr: true, stockQuantity: true, unit: true },
      orderBy: [{ id: "asc" }],
      take: 5,
    }),
  ]);

  const todayRevenue = Number(today._sum.total ?? 0);
  return {
    todayRevenue,
    todayOrders: today._count._all,
    averageOrderValue: today._count._all ? todayRevenue / today._count._all : 0,
    monthRevenue: Number(month._sum.total ?? 0),
    pendingOrders,
    productsCount,
    categoriesCount,
    newCustomersToday,
    lowStockCount: Number(lowStockCount[0]?.count ?? 0),
    outOfStockCount: Number(outOfStockCount),
    lowStock: lowStock.map((p) => ({ id: p.id, name: p.name, nameAr: p.nameAr, stockQuantity: Number(p.stockQuantity), minQuantity: Number(p.minQuantity), unit: p.unit })),
    outOfStock: outOfStock.map((p) => ({ id: p.id, name: p.name, nameAr: p.nameAr, stockQuantity: Number(p.stockQuantity), unit: p.unit })),
    bestSellers: bestSellerGroups.map((row) => ({ name: row.productName, quantity: Number(row._sum.quantity ?? 0), revenue: Number(row._sum.lineTotal ?? 0) })),
    recentOrders: recentOrders.map((o) => ({ id: o.id, name: o.name, total: Number(o.total), status: o.status, createdAt: o.createdAt.toISOString(), itemsCount: o._count.items })),
  };
}
