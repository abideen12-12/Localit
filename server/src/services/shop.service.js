const prisma = require('../config/prisma');

class ShopService {
  /**
   * Helper to calculate Haversine distance in kilometers between two geo-coordinates
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  }

  /**
   * Public discovery for customers.
   * CRITICAL RULE 1: Only shops with verificationStatus = 'APPROVED' are returned to customers.
   */
  async getPublicShops({ search, categoryId, openOnly, userLat, userLng }) {
    const where = {
      verificationStatus: 'APPROVED',
      ...(openOnly === 'true' && { status: 'OPEN' }),
      ...(search && {
        OR: [
          { shopName: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && {
        products: {
          some: {
            categoryId,
            status: 'AVAILABLE',
          },
        },
      }),
    };

    const shops = await prisma.shop.findMany({
      where,
      include: {
        _count: {
          select: { products: true, reviews: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const parsedUserLat = userLat ? parseFloat(userLat) : 12.9716;
    const parsedUserLng = userLng ? parseFloat(userLng) : 77.5946;

    // Enrich with calculated distance, average rating, and delivery eligibility
    return shops.map((shop) => {
      const distance = this.calculateDistance(
        parsedUserLat,
        parsedUserLng,
        shop.latitude,
        shop.longitude
      );

      const isDeliverable = distance <= shop.deliveryRadius;
      const avgRating =
        shop.reviews.length > 0
          ? parseFloat((shop.reviews.reduce((acc, r) => acc + r.rating, 0) / shop.reviews.length).toFixed(1))
          : 4.8; // Default initial rating

      // Estimated delivery time: 15 mins base + 5 mins per km
      const estimatedDeliveryMins = Math.max(15, Math.round(15 + distance * 5));

      return {
        id: shop.id,
        shopName: shop.shopName,
        description: shop.description,
        address: shop.address,
        phone: shop.phone,
        email: shop.email,
        imageUrl: shop.imageUrl,
        openingTime: shop.openingTime,
        closingTime: shop.closingTime,
        status: shop.status,
        deliveryRadius: shop.deliveryRadius,
        deliveryFee: shop.deliveryFee,
        minOrderAmount: shop.minOrderAmount,
        distanceKm: distance,
        isDeliverable,
        estimatedDeliveryTime: `${estimatedDeliveryMins}-${estimatedDeliveryMins + 10} mins`,
        totalProducts: shop._count.products,
        totalReviews: shop._count.reviews,
        avgRating,
      };
    });
  }

  /**
   * Get single shop details for public view
   */
  async getShopById(shopId) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        reviews: {
          include: {
            customer: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { products: true, reviews: true },
        },
      },
    });

    if (!shop) {
      const error = new Error('Shop not found.');
      error.statusCode = 404;
      throw error;
    }

    if (shop.verificationStatus !== 'APPROVED') {
      const error = new Error('This shop is currently undergoing verification or has been suspended.');
      error.statusCode = 403;
      throw error;
    }

    const avgRating =
      shop.reviews.length > 0
        ? parseFloat((shop.reviews.reduce((acc, r) => acc + r.rating, 0) / shop.reviews.length).toFixed(1))
        : 4.8;

    return {
      ...shop,
      avgRating,
      estimatedDeliveryTime: '20-30 mins',
    };
  }

  /**
   * Get shop owned by the current authenticated Shop Owner
   */
  async getOwnerShop(ownerId) {
    return prisma.shop.findFirst({
      where: { ownerId },
      include: {
        _count: {
          select: { products: true, orders: true },
        },
      },
    });
  }

  /**
   * Create or update shop for a Shop Owner
   */
  async createOrUpdateOwnerShop(ownerId, data) {
    const existing = await prisma.shop.findFirst({
      where: { ownerId },
    });

    const shopData = {
      shopName: data.shopName,
      description: data.description,
      phone: data.phone,
      email: data.email,
      address: data.address,
      latitude: data.latitude ? parseFloat(data.latitude) : 12.9716,
      longitude: data.longitude ? parseFloat(data.longitude) : 77.5946,
      openingTime: data.openingTime || '08:00 AM',
      closingTime: data.closingTime || '10:00 PM',
      deliveryRadius: data.deliveryRadius ? parseFloat(data.deliveryRadius) : 5.0,
      deliveryFee: data.deliveryFee !== undefined ? parseFloat(data.deliveryFee) : 25.0,
      minOrderAmount: data.minOrderAmount !== undefined ? parseFloat(data.minOrderAmount) : 0.0,
      imageUrl: data.imageUrl,
      ...(data.status && { status: data.status }),
    };

    if (existing) {
      return prisma.shop.update({
        where: { id: existing.id },
        data: shopData,
      });
    }

    // New shop creation starts as PENDING verification
    return prisma.shop.create({
      data: {
        ...shopData,
        ownerId,
        verificationStatus: 'PENDING',
      },
    });
  }

  /**
   * Shop Owner updates their operational status (OPEN / CLOSED / TEMPORARILY_UNAVAILABLE)
   */
  async updateOwnerShopStatus(ownerId, status) {
    const shop = await prisma.shop.findFirst({
      where: { ownerId },
    });

    if (!shop) {
      const error = new Error('Shop not found for this owner.');
      error.statusCode = 404;
      throw error;
    }

    return prisma.shop.update({
      where: { id: shop.id },
      data: { status },
    });
  }

  /**
   * Admin: List all shops with filters
   */
  async getAllShopsForAdmin({ status, verificationStatus, search }) {
    return prisma.shop.findMany({
      where: {
        ...(status && { status }),
        ...(verificationStatus && { verificationStatus }),
        ...(search && {
          OR: [
            { shopName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
        _count: {
          select: { products: true, orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin: Update shop verification status (APPROVED, REJECTED, SUSPENDED)
   */
  async updateVerificationStatus(shopId, verificationStatus) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: { owner: true },
    });

    if (!shop) {
      const error = new Error('Shop not found.');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.shop.update({
      where: { id: shopId },
      data: { verificationStatus },
    });

    // Create system notification for shop owner
    await prisma.notification.create({
      data: {
        userId: shop.ownerId,
        title: `Shop Verification Status: ${verificationStatus}`,
        message: `Your shop "${shop.shopName}" verification status has been updated to ${verificationStatus} by the platform administrator.`,
        type: 'SYSTEM',
      },
    });

    return updated;
  }
}

module.exports = new ShopService();
