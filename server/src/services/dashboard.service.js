const prisma = require('../config/prisma');

class DashboardService {
  /**
   * Shop Owner Dashboard metrics and incoming orders
   */
  async getOwnerDashboard(ownerId) {
    const shop = await prisma.shop.findFirst({
      where: { ownerId },
    });

    if (!shop) {
      return {
        hasShop: false,
        message: 'Please complete your store profile to begin processing orders.',
      };
    }

    // 1. Order status counts
    const [totalOrders, pendingOrders, completedOrders, cancelledOrders] = await Promise.all([
      prisma.order.count({ where: { shopId: shop.id } }),
      prisma.order.count({
        where: {
          shopId: shop.id,
          orderStatus: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'] },
        },
      }),
      prisma.order.count({ where: { shopId: shop.id, orderStatus: 'DELIVERED' } }),
      prisma.order.count({ where: { shopId: shop.id, orderStatus: 'CANCELLED' } }),
    ]);

    // 2. Revenue calculations
    const deliveredOrders = await prisma.order.findMany({
      where: { shopId: shop.id, orderStatus: 'DELIVERED' },
      select: { totalAmount: true, createdAt: true },
    });

    const totalSales = deliveredOrders.reduce((acc, o) => acc + o.totalAmount, 0);

    // Today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySales = deliveredOrders
      .filter((o) => new Date(o.createdAt) >= today)
      .reduce((acc, o) => acc + o.totalAmount, 0);

    // 3. Inventory stock alerts
    const [lowStockCount, outOfStockCount, totalProducts] = await Promise.all([
      prisma.product.count({
        where: { shopId: shop.id, stockQuantity: { gt: 0, lte: 5 }, status: { not: 'DISCONTINUED' } },
      }),
      prisma.product.count({
        where: { shopId: shop.id, stockQuantity: 0, status: { not: 'DISCONTINUED' } },
      }),
      prisma.product.count({
        where: { shopId: shop.id, status: { not: 'DISCONTINUED' } },
      }),
    ]);

    // 4. Recent incoming orders for this shop
    const recentOrders = await prisma.order.findMany({
      where: { shopId: shop.id },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        address: true,
        items: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      hasShop: true,
      shop: {
        id: shop.id,
        shopName: shop.shopName,
        status: shop.status,
        verificationStatus: shop.verificationStatus,
      },
      metrics: {
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalSales: parseFloat(totalSales.toFixed(2)),
        todaySales: parseFloat(todaySales.toFixed(2)),
        lowStockCount,
        outOfStockCount,
        totalProducts,
      },
      recentOrders,
    };
  }

  /**
   * Shop Owner: Get all orders for this shop with filters
   */
  async getOwnerOrders(ownerId, { orderStatus, search }) {
    const shop = await prisma.shop.findFirst({ where: { ownerId } });
    if (!shop) return [];

    const where = {
      shopId: shop.id,
      ...(orderStatus && { orderStatus }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    return prisma.order.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        address: true,
        items: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin Dashboard Metrics & platform overview
   */
  async getAdminDashboard() {
    const [
      totalCustomers,
      totalShopOwners,
      totalShops,
      activeShops,
      pendingShops,
      totalProducts,
      totalOrders,
      cancelledOrders,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'SHOP_OWNER' } }),
      prisma.shop.count(),
      prisma.shop.count({ where: { verificationStatus: 'APPROVED' } }),
      prisma.shop.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.product.count({ where: { status: { not: 'DISCONTINUED' } } }),
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: 'CANCELLED' } }),
    ]);

    // Gross platform revenue from delivered orders
    const delivered = await prisma.order.findMany({
      where: { orderStatus: 'DELIVERED' },
      select: { totalAmount: true },
    });
    const totalRevenue = delivered.reduce((acc, o) => acc + o.totalAmount, 0);

    // Recent orders across platform
    const recentOrders = await prisma.order.findMany({
      include: {
        shop: { select: { id: true, shopName: true } },
        customer: { select: { id: true, name: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      metrics: {
        totalCustomers,
        totalShopOwners,
        totalShops,
        activeShops,
        pendingShops,
        totalProducts,
        totalOrders,
        cancelledOrders,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      },
      recentOrders,
    };
  }

  /**
   * Admin Platform Order Monitor with advanced filters
   */
  async getAdminOrders({ shopId, customerId, orderStatus, paymentStatus, search }) {
    const where = {
      ...(shopId && { shopId }),
      ...(customerId && { customerId }),
      ...(orderStatus && { orderStatus }),
      ...(paymentStatus && { paymentStatus }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { shop: { shopName: { contains: search, mode: 'insensitive' } } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    return prisma.order.findMany({
      where,
      include: {
        shop: { select: { id: true, shopName: true, phone: true } },
        customer: { select: { id: true, name: true, email: true, phone: true } },
        address: true,
        items: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin User Directory & search
   */
  async getAdminUsers({ role, search, isActive }) {
    const where = {
      ...(role && { role }),
      ...(isActive !== undefined && { isActive: isActive === 'true' }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { orders: true, shops: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin toggle user activation status
   */
  async toggleUserActive(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'ADMIN') {
      const error = new Error('Cannot deactivate administrator accounts.');
      error.statusCode = 400;
      throw error;
    }

    return prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, email: true, isActive: true },
    });
  }
}

module.exports = new DashboardService();
