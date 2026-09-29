const addressService = require('../services/address.service');

class AddressController {
  async getAddresses(req, res, next) {
    try {
      const addresses = await addressService.getAddresses(req.user.id);
      return res.status(200).json({ success: true, data: addresses });
    } catch (error) {
      next(error);
    }
  }

  async addAddress(req, res, next) {
    try {
      const { recipientName, phone, street, city, state, pincode } = req.body;
      if (!recipientName || !phone || !street || !city || !state || !pincode) {
        return res.status(400).json({
          success: false,
          message: 'Recipient name, phone, street, city, state, and pincode are required.',
        });
      }

      const address = await addressService.addAddress(req.user.id, req.body);
      return res.status(201).json({
        success: true,
        message: 'Address added successfully.',
        data: address,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAddress(req, res, next) {
    try {
      const updated = await addressService.updateAddress(req.user.id, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Address updated successfully.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAddress(req, res, next) {
    try {
      const result = await addressService.deleteAddress(req.user.id, req.params.id);
      return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  async setDefaultAddress(req, res, next) {
    try {
      const updated = await addressService.setDefaultAddress(req.user.id, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Default address updated.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AddressController();
