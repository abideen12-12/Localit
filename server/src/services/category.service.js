const prisma = require('../config/prisma');

class CategoryService {
  async getCategories() {
    return prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getAllCategoriesForAdmin() {
    return prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCategory({ name, slug, description, imageUrl }) {
    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await prisma.category.findUnique({
      where: { slug: generatedSlug },
    });

    if (existing) {
      const error = new Error('A category with this slug/name already exists.');
      error.statusCode = 409;
      throw error;
    }

    return prisma.category.create({
      data: {
        name,
        slug: generatedSlug,
        description,
        imageUrl,
      },
    });
  }

  async updateCategory(id, data) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      const error = new Error('Category not found.');
      error.statusCode = 404;
      throw error;
    }

    return prisma.category.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async deleteCategory(id) {
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      const error = new Error(`Cannot delete category with ${count} existing products assigned to it.`);
      error.statusCode = 400;
      throw error;
    }

    return prisma.category.delete({ where: { id } });
  }
}

module.exports = new CategoryService();
