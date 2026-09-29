const shopService = require('../services/shop.service');

class ShopController {
  // Public
  async getPublicShops(req, res, next) {
    try {
      const shops = await shopService.getPublicShops(req.query);
      return res.status(200).json({ success: true, count: shops.length, data: shops });
    } catch (error) {
      next(error);
    }
  }

  async getShopById(req, res, next) {
    try {
      const shop = await shopService.getShopById(req.params.id);
      return res.status(200).json({ success: true, data: shop });
    } catch (error) {
      next(error);
    }
  }

  // Shop Owner
  async getOwnerShop(req, res, next) {
    try {
      const shop = await shopService.getOwnerShop(req.user.id);
      return res.status(200).json({ success: true, data: shop });
    } catch (error) {
      next(error);
    }
  }

  async saveOwnerShop(req, res, next) {
    try {
      const { shopName, address, phone, email } = req.body;
      if (!shopName || !address || !phone || !email) {
        return res.status(400).json({
          success: false,
          message: 'Shop name, address, phone, and email are required.',
        });
      }

      const shop = await shopService.createOrUpdateOwnerShop(req.user.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Shop details saved successfully.',
        data: shop,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOwnerShopStatus(req, res, next) {
    try {
      const { status } = req.body;
      if (!['OPEN', 'CLOSED', 'TEMPORARILY_UNAVAILABLE'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid shop status.' });
      }

      const shop = await shopService.updateOwnerShopStatus(req.user.id, status);
      return res.status(200).json({
        success: true,
        message: `Shop status changed to ${status}.`,
        data: shop,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin
  async getAllShopsForAdmin(req, res, next) {
    try {
      const shops = await shopService.getAllShopsForAdmin(req.query);
      return res.status(200).json({ success: true, count: shops.length, data: shops });
    } catch (error) {
      next(error);
    }
  }

  async updateVerification(req, res, next) {
    try {
      const { verificationStatus } = req.body;
      if (!['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].includes(verificationStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid verification status.' });
      }

      const shop = await shopService.updateVerificationStatus(req.params.id, verificationStatus);
      return res.status(200).json({
        success: true,
        message: `Shop verification updated to ${verificationStatus}.`,
        data: shop,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ShopController();
