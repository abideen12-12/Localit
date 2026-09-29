const prisma = require('../config/prisma');

class AddressService {
  async getAddresses(userId) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async addAddress(userId, data) {
    const { recipientName, phone, street, landmark, city, state, pincode, latitude, longitude, isDefault } = data;

    // If marked as default, unset existing default
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Check if this is user's first address; if so, make default automatically
    const count = await prisma.address.count({ where: { userId } });
    const shouldBeDefault = isDefault || count === 0;

    return prisma.address.create({
      data: {
        userId,
        recipientName,
        phone,
        street,
        landmark,
        city,
        state,
        pincode,
        latitude: latitude ? parseFloat(latitude) : 12.9716, // Default to Bengaluru coordinates if not provided
        longitude: longitude ? parseFloat(longitude) : 77.5946,
        isDefault: shouldBeDefault,
      },
    });
  }

  async updateAddress(userId, addressId, data) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existing) {
      const error = new Error('Address not found or unauthorized.');
      error.statusCode = 404;
      throw error;
    }

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: { id: addressId },
      data: {
        recipientName: data.recipientName,
        phone: data.phone,
        street: data.street,
        landmark: data.landmark,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        latitude: data.latitude ? parseFloat(data.latitude) : existing.latitude,
        longitude: data.longitude ? parseFloat(data.longitude) : existing.longitude,
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
    });
  }

  async deleteAddress(userId, addressId) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existing) {
      const error = new Error('Address not found.');
      error.statusCode = 404;
      throw error;
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    // If the deleted address was default, set the latest remaining address as default
    if (existing.isDefault) {
      const remaining = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (remaining) {
        await prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return { message: 'Address removed successfully.' };
  }

  async setDefaultAddress(userId, addressId) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existing) {
      const error = new Error('Address not found.');
      error.statusCode = 404;
      throw error;
    }

    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    return prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  }
}

module.exports = new AddressService();
