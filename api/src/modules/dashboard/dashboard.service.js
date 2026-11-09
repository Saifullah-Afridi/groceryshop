import { prisma } from "../../lib/prisma.js";

export async function getDashboard() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [products, categories, todaysOrders, monthOrders, pendingOrders, recentOrders, customers] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.category.count(),
    prisma.order.findMany({ where: { createdAt: { gte: start }, status: { not: "CANCELLED" } }, include: { items: true } }),
    prisma.order.findMany({ where: { createdAt: { gte: monthStart }, status: { not: "CANCELLED" } } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({ take: 8, orderBy: { createdAt: "desc" }, include: { items: true } }),
    prisma.customer.count({ where: { createdAt: { gte: start } } }),
  ]);
  const lowStock = products.filter(p => Number(p.stockQuantity) > 0 && Number(p.minQuantity) > 0 && Number(p.stockQuantity) <= Number(p.minQuantity));
  const outOfStock = products.filter(p => Number(p.stockQuantity) <= 0);
  const sold = new Map();
  for (const order of monthOrders) {
    const items = await prisma.orderItem.findMany({ where: { orderId: order.id } });
    for (const item of items) {
      const key = item.productName;
      const current = sold.get(key) || { name: key, quantity: 0, revenue: 0 };
      current.quantity += Number(item.quantity);
      current.revenue += Number(item.lineTotal);
      sold.set(key, current);
    }
  }
  const sum = rows => rows.reduce((n, row) => n + Number(row.total), 0);
  return {
    todayRevenue: sum(todaysOrders),
    todayOrders: todaysOrders.length,
    averageOrderValue: todaysOrders.length ? sum(todaysOrders) / todaysOrders.length : 0,
    monthRevenue: sum(monthOrders),
    pendingOrders,
    productsCount: products.length,
    categoriesCount: categories,
    newCustomersToday: customers,
    lowStock: lowStock.map(p => ({ id:p.id, name:p.name, nameAr:p.nameAr, stockQuantity:p.stockQuantity, minQuantity:p.minQuantity, unit:p.unit })),
    outOfStock: outOfStock.map(p => ({ id:p.id, name:p.name, nameAr:p.nameAr, stockQuantity:p.stockQuantity, unit:p.unit })),
    bestSellers: [...sold.values()].sort((a,b) => b.quantity-a.quantity).slice(0,5),
    recentOrders: recentOrders.map(o => ({ id:o.id, name:o.name, total:Number(o.total), status:o.status, createdAt:o.createdAt.toISOString(), itemsCount:o.items.length })),
  };
}
