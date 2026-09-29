const dashboardService = require('../services/dashboard.service');

class DashboardController {
  // Shop Owner
  async getOwnerDashboard(req, res, next) {
    try {
      const data = await dashboardService.getOwnerDashboard(req.user.id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getOwnerOrders(req, res, next) {
    try {
      const orders = await dashboardService.getOwnerOrders(req.user.id, req.query);
      return res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
      next(error);
    }
  }

  // Admin
  async getAdminDashboard(req, res, next) {
    try {
      const data = await dashboardService.getAdminDashboard();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getAdminOrders(req, res, next) {
    try {
      const orders = await dashboardService.getAdminOrders(req.query);
      return res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
      next(error);
    }
  }

  async getAdminUsers(req, res, next) {
    try {
      const users = await dashboardService.getAdminUsers(req.query);
      return res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
      next(error);
    }
  }

  async toggleUserActive(req, res, next) {
    try {
      const updated = await dashboardService.toggleUserActive(req.params.id);
      return res.status(200).json({
        success: true,
        message: `User ${updated.isActive ? 'activated' : 'deactivated'} successfully.`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
