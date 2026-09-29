const cartService = require('../services/cart.service');

class CartController {
  async getCart(req, res, next) {
    try {
      const cart = await cartService.getCart(req.user.id);
      return res.status(200).json({ success: true, data: cart });
    } catch (error) {
      next(error);
    }
  }

  async addToCart(req, res, next) {
    try {
      const { productId, quantity, clearExistingIfDifferentShop } = req.body;
      if (!productId) {
        return res.status(400).json({ success: false, message: 'Product ID is required.' });
      }

      const result = await cartService.addToCart(req.user.id, {
        productId,
        quantity: parseInt(quantity) || 1,
        clearExistingIfDifferentShop: !!clearExistingIfDifferentShop,
      });

      // Handle multi-shop conflict
      if (result.conflict) {
        return res.status(409).json({
          success: false,
          conflict: true,
          currentShop: result.currentShop,
          newShop: result.newShop,
          message: result.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Cart updated successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateItem(req, res, next) {
    try {
      const { quantity } = req.body;
      if (quantity === undefined) {
        return res.status(400).json({ success: false, message: 'Quantity is required.' });
      }

      const cart = await cartService.updateCartItem(req.user.id, req.params.id, parseInt(quantity));
      return res.status(200).json({ success: true, message: 'Cart item updated.', data: cart });
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req, res, next) {
    try {
      const cart = await cartService.removeCartItem(req.user.id, req.params.id);
      return res.status(200).json({ success: true, message: 'Item removed from cart.', data: cart });
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req, res, next) {
    try {
      const cart = await cartService.clearCart(req.user.id);
      return res.status(200).json({ success: true, message: 'Cart cleared.', data: cart });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartController();
