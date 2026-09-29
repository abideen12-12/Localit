const prisma = require('../config/prisma');

class CartService {
  /**
   * Fetch customer's active cart with item calculations
   */
  async getCart(userId) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        shop: {
          select: {
            id: true,
            shopName: true,
            address: true,
            deliveryFee: true,
            minOrderAmount: true,
            status: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stockQuantity: true,
                unit: true,
                imageUrl: true,
                status: true,
                shopId: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          shop: true,
          items: { include: { product: true } },
        },
      });
    }

    // Calculate subtotal
    const subtotal = cart.items.reduce((acc, item) => {
      return acc + item.product.price * item.quantity;
    }, 0);

    const deliveryFee = cart.shop ? cart.shop.deliveryFee : 0;
    const totalAmount = subtotal > 0 ? subtotal + deliveryFee : 0;
    const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

    return {
      ...cart,
      subtotal: parseFloat(subtotal.toFixed(2)),
      deliveryFee: parseFloat(deliveryFee.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      totalItems,
    };
  }

  /**
   * Add item to cart.
   * CRITICAL RULE: Single Shop Cart only.
   * If adding from another shop, prompts user to clear existing cart.
   */
  async addToCart(userId, { productId, quantity = 1, clearExistingIfDifferentShop = false }) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { shop: true },
    });

    if (!product) {
      const error = new Error('Product not found.');
      error.statusCode = 404;
      throw error;
    }

    if (product.status !== 'AVAILABLE' || product.stockQuantity <= 0) {
      const error = new Error('This product is currently out of stock.');
      error.statusCode = 400;
      throw error;
    }

    if (quantity > product.stockQuantity) {
      const error = new Error(`Only ${product.stockQuantity} units available in stock.`);
      error.statusCode = 400;
      throw error;
    }

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { shop: true, items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId, shopId: product.shopId },
        include: { shop: true, items: true },
      });
    }

    // MULTI-SHOP CONFLICT CHECK
    if (cart.shopId && cart.shopId !== product.shopId && cart.items.length > 0) {
      if (!clearExistingIfDifferentShop) {
        return {
          conflict: true,
          currentShop: { id: cart.shop.id, name: cart.shop.shopName },
          newShop: { id: product.shop.id, name: product.shop.shopName },
          message: `Your cart contains products from ${cart.shop.shopName}. Clear your existing cart to add products from ${product.shop.shopName}?`,
        };
      }

      // If customer confirmed, clear previous shop's items and re-bind cart to new shop
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      await prisma.cart.update({
        where: { id: cart.id },
        data: { shopId: product.shopId },
      });
    } else if (!cart.shopId) {
      // First item in cart binds the shop
      await prisma.cart.update({
        where: { id: cart.id },
        data: { shopId: product.shopId },
      });
    }

    // Check if product is already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: product.id,
        },
      },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.stockQuantity) {
        const error = new Error(`Cannot add more. Only ${product.stockQuantity} units available.`);
        error.statusCode = 400;
        throw error;
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  /**
   * Update quantity of an existing cart item
   */
  async updateCartItem(userId, itemId, quantity) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      const error = new Error('Cart not found.');
      error.statusCode = 404;
      throw error;
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true },
    });

    if (!item) {
      const error = new Error('Item not found in cart.');
      error.statusCode = 404;
      throw error;
    }

    if (quantity <= 0) {
      return this.removeCartItem(userId, itemId);
    }

    if (quantity > item.product.stockQuantity) {
      const error = new Error(`Only ${item.product.stockQuantity} units available.`);
      error.statusCode = 400;
      throw error;
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return this.getCart(userId);
  }

  /**
   * Remove item from cart
   */
  async removeCartItem(userId, itemId) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      const error = new Error('Cart not found.');
      error.statusCode = 404;
      throw error;
    }

    await prisma.cartItem.deleteMany({
      where: { id: itemId, cartId: cart.id },
    });

    // Check if cart is now empty; if so, clear shopId lock
    const remaining = await prisma.cartItem.count({ where: { cartId: cart.id } });
    if (remaining === 0) {
      await prisma.cart.update({
        where: { id: cart.id },
        data: { shopId: null },
      });
    }

    return this.getCart(userId);
  }

  /**
   * Clear all items in cart
   */
  async clearCart(userId) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      await prisma.cart.update({
        where: { id: cart.id },
        data: { shopId: null },
      });
    }
    return this.getCart(userId);
  }
}

module.exports = new CartService();
