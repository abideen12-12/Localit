const categoryService = require('../services/category.service');

class CategoryController {
  async getPublicCategories(req, res, next) {
    try {
      const categories = await categoryService.getCategories();
      return res.status(200).json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  async getAllCategoriesForAdmin(req, res, next) {
    try {
      const categories = await categoryService.getAllCategoriesForAdmin();
      return res.status(200).json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req, res, next) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Category name is required.' });
      }
      const category = await categoryService.createCategory(req.body);
      return res.status(201).json({ success: true, message: 'Category created.', data: category });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const updated = await categoryService.updateCategory(req.params.id, req.body);
      return res.status(200).json({ success: true, message: 'Category updated.', data: updated });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      await categoryService.deleteCategory(req.params.id);
      return res.status(200).json({ success: true, message: 'Category deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
