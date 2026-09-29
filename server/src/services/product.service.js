const prisma = require('../config/prisma');

class ProductService {
  /**
   * Helper to calculate Haversine distance in km
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371;
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
   * Customer: Get all products belonging to a specific shop
   */
  async getShopProducts(shopId, { categoryId, search, inStockOnly }) {
    // Verify shop is approved
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { id: true, shopName: true, status: true, verificationStatus: true },
    });

    if (!shop || shop.verificationStatus !== 'APPROVED') {
      const error = new Error('Shop not found or not currently active.');
      error.statusCode = 404;
      throw error;
    }

    const where = {
      shopId,
      status: inStockOnly === 'true' ? 'AVAILABLE' : { not: 'DISCONTINUED' },
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Customer: Global Product Search with Multi-Shop Price Comparison.
   * Search "Milk" -> returns list showing:
   * Shop A - Milk ₹50
   * Shop B - Milk ₹54
   * Shop C - Milk ₹48
   */
  async searchProductsGlobal({ query, categoryId, minPrice, maxPrice, sortBy, userLat, userLng }) {
    if (!query && !categoryId) {
      return [];
    }

    const where = {
      // Must belong to APPROVED shop
      shop: {
        verificationStatus: 'APPROVED',
      },
      status: { not: 'DISCONTINUED' },
      ...(query && {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
    };

    let orderBy = [{ name: 'asc' }];
    if (sortBy === 'price_asc') orderBy = [{ price: 'asc' }];
    if (sortBy === 'price_desc') orderBy = [{ price: 'desc' }];

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true },
        },
        shop: {
          select: {
            id: true,
            shopName: true,
            address: true,
            status: true,
            latitude: true,
            longitude: true,
            deliveryFee: true,
            deliveryRadius: true,
          },
        },
      },
      orderBy,
      take: 50,
    });

    const parsedUserLat = userLat ? parseFloat(userLat) : 12.9716;
    const parsedUserLng = userLng ? parseFloat(userLng) : 77.5946;

    // Attach calculated distance to each product's shop
    const enriched = products.map((prod) => {
      const distance = this.calculateDistance(
        parsedUserLat,
        parsedUserLng,
        prod.shop.latitude,
        prod.shop.longitude
      );

      return {
        id: prod.id,
        name: prod.name,
        description: prod.description,
        imageUrl: prod.imageUrl,
        price: prod.price,
        unit: prod.unit,
        stockQuantity: prod.stockQuantity,
        status: prod.status,
        category: prod.category,
        shop: {
          id: prod.shop.id,
          shopName: prod.shop.shopName,
          address: prod.shop.address,
          status: prod.shop.status,
          deliveryFee: prod.shop.deliveryFee,
          distanceKm: distance,
          isDeliverable: distance <= prod.shop.deliveryRadius,
        },
      };
    });

    if (sortBy === 'distance') {
      enriched.sort((a, b) => a.shop.distanceKm - b.shop.distanceKm);
    }

    return enriched;
  }

  /**
   * Shop Owner: Get products strictly belonging to the authenticated owner's shop
   */
  async getOwnerProducts(ownerId, { search, categoryId, status }) {
    const shop = await prisma.shop.findFirst({
      where: { ownerId },
    });

    if (!shop) {
      const error = new Error('You must configure your shop profile before managing products.');
      error.statusCode = 400;
      throw error;
    }

    const where = {
      shopId: shop.id,
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ updatedAt: 'desc' }],
    });
  }

  /**
   * Shop Owner: Create a new product in their store
   */
  async createProduct(ownerId, data) {
    const shop = await prisma.shop.findFirst({
      where: { ownerId },
    });

    if (!shop) {
      const error = new Error('You must set up your shop profile first.');
      error.statusCode = 400;
      throw error;
    }

    const stockQuantity = parseInt(data.stockQuantity) || 0;
    // Automatic stock status determination
    const status = stockQuantity <= 0 ? 'OUT_OF_STOCK' : data.status || 'AVAILABLE';

    return prisma.product.create({
      data: {
        shopId: shop.id,
        categoryId: data.categoryId,
        name: data.name.trim(),
        description: data.description,
        imageUrl: data.imageUrl,
        price: parseFloat(data.price),
        stockQuantity,
        unit: data.unit || '1 item',
        status,
      },
      include: {
        category: true,
      },
    });
  }

  /**
   * Shop Owner: Update product
   * Automatically marks OUT_OF_STOCK if stock hits 0
   */
  async updateProduct(ownerId, productId, data) {
    const shop = await prisma.shop.findFirst({
      where: { ownerId },
    });

    if (!shop) {
      const error = new Error('Shop not found.');
      error.statusCode = 404;
      throw error;
    }

    const existing = await prisma.product.findFirst({
      where: { id: productId, shopId: shop.id },
    });

    if (!existing) {
      const error = new Error('Product not found or not owned by your shop.');
      error.statusCode = 404;
      throw error;
    }

    let stockQuantity = existing.stockQuantity;
    if (data.stockQuantity !== undefined) {
      stockQuantity = parseInt(data.stockQuantity);
    }

    let status = data.status || existing.status;
    if (stockQuantity <= 0) {
      status = 'OUT_OF_STOCK';
    } else if (status === 'OUT_OF_STOCK' && stockQuantity > 0) {
      status = 'AVAILABLE';
    }

    return prisma.product.update({
      where: { id: productId },
      data: {
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.name && { name: data.name.trim() }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.price !== undefined && { price: parseFloat(data.price) }),
        ...(data.unit && { unit: data.unit }),
        stockQuantity,
        status,
      },
      include: {
        category: true,
      },
    });
  }

  /**
   * Shop Owner: Delete or deactivate product
   */
  async deleteProduct(ownerId, productId) {
    const shop = await prisma.shop.findFirst({
      where: { ownerId },
    });

    if (!shop) {
      const error = new Error('Shop not found.');
      error.statusCode = 404;
      throw error;
    }

    const existing = await prisma.product.findFirst({
      where: { id: productId, shopId: shop.id },
    });

    if (!existing) {
      const error = new Error('Product not found.');
      error.statusCode = 404;
      throw error;
    }

    // Check if product was previously purchased in orders
    const orderedCount = await prisma.orderItem.count({
      where: { productId },
    });

    if (orderedCount > 0) {
      // Soft-delete to preserve order history integrity
      return prisma.product.update({
        where: { id: productId },
        data: { status: 'DISCONTINUED', stockQuantity: 0 },
      });
    }

    return prisma.product.delete({
      where: { id: productId },
    });
  }
}

module.exports = new ProductService();
