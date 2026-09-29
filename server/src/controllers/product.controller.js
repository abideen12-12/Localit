const productService = require('../services/product.service');

class ProductController {
  // Public
  async getShopProducts(req, res, next) {
    try {
      const products = await productService.getShopProducts(req.params.shopId, req.query);
      return res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
      next(error);
    }
  }

  async searchProductsGlobal(req, res, next) {
    try {
      const results = await productService.searchProductsGlobal(req.query);
      return res.status(200).json({ success: true, count: results.length, data: results });
    } catch (error) {
      next(error);
    }
  }

  // Shop Owner
  async getOwnerProducts(req, res, next) {
    try {
      const products = await productService.getOwnerProducts(req.user.id, req.query);
      return res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
      next(error);
    }
  }

  async createOwnerProduct(req, res, next) {
    try {
      const { name, categoryId, price } = req.body;
      if (!name || !categoryId || price === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Product name, category, and price are required.',
        });
      }

      const product = await productService.createProduct(req.user.id, req.body);
      return res.status(201).json({
        success: true,
        message: 'Product added to inventory.',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOwnerProduct(req, res, next) {
    try {
      const updated = await productService.updateProduct(req.user.id, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Product updated.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteOwnerProduct(req, res, next) {
    try {
      await productService.deleteProduct(req.user.id, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Product removed/discontinued successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
