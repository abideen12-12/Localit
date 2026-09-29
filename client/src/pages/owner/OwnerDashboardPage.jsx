import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Store,
  DollarSign,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Truck,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';

export default function OwnerDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/owner/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load merchant dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { orderStatus: newStatus });
      fetchDashboard();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-gray-400">Loading merchant dashboard...</div>;
  }

  if (!data?.hasShop) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-gray-100 shadow-sm text-center space-y-4">
        <Store className="w-12 h-12 text-blue-600 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Set Up Your Store</h2>
        <p className="text-xs text-gray-500">
          Complete your store profile and submit it for platform verification to begin receiving customer orders.
        </p>
        <Link
          to="/owner/shop"
          className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20"
        >
          Configure Store Profile
        </Link>
      </div>
    );
  }

  const { metrics, shop, recentOrders } = data;

  return (
    <div className="space-y-8 py-4">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Merchant Hub</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                shop.verificationStatus === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {shop.verificationStatus}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
            {shop.shopName}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Store Status: <strong className={shop.status === 'OPEN' ? 'text-emerald-600' : 'text-red-500'}>{shop.status}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/owner/products"
            className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition"
          >
            Manage Inventory ({metrics.totalProducts})
          </Link>
          <Link
            to="/owner/shop"
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
          >
            Store Settings
          </Link>
          <button
            onClick={fetchDashboard}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            Today's Sales
          </span>
          <span className="text-2xl font-black text-emerald-700 block">₹{metrics.todaySales}</span>
          <span className="text-[10px] text-gray-400">Total Lifetime: ₹{metrics.totalSales}</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            Active / Pending Orders
          </span>
          <span className="text-2xl font-black text-blue-700 block">{metrics.pendingOrders}</span>
          <span className="text-[10px] text-gray-400">Total Orders: {metrics.totalOrders}</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            Delivered Orders
          </span>
          <span className="text-2xl font-black text-gray-900 block">{metrics.completedOrders}</span>
          <span className="text-[10px] text-emerald-600 font-semibold">Completed fulfillment</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            Low Stock Alerts
          </span>
          <span className={`text-2xl font-black block ${metrics.lowStockCount > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
            {metrics.lowStockCount}
          </span>
          <span className="text-[10px] text-gray-400">
            {metrics.outOfStockCount} items completely out of stock
          </span>
        </div>
      </div>

      {/* Live Incoming Orders Stream */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Incoming Orders & Fulfillment</h2>
            <p className="text-xs text-gray-500">
              Manage order status lifecycle from preparation to doorstep delivery
            </p>
          </div>
          <Link to="/owner/orders" className="text-xs font-bold text-blue-600 hover:underline">
            View All Store Orders
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-xs text-gray-500 font-medium">No incoming orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl border border-gray-100 hover:border-gray-200 transition space-y-3 bg-gray-50/40"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-gray-900">{order.orderNumber}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 block mt-0.5">
                      Customer: <strong>{order.customer?.name}</strong> ({order.customer?.phone || 'No phone'})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-900">₹{order.totalAmount}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        order.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'CANCELLED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {order.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Items snapshot */}
                <div className="text-xs text-gray-600">
                  <span className="font-semibold text-gray-400 uppercase text-[10px] block mb-1">
                    Items:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((i) => (
                      <span key={i.id} className="bg-white px-2.5 py-1 rounded-lg border border-gray-200 font-medium">
                        {i.productNameSnapshot} × {i.quantity} (₹{i.priceSnapshot})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status Transition Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 text-xs">
                  <span className="text-[11px] text-gray-500">
                    Destination: {order.address?.street}, {order.address?.city}
                  </span>

                  <div className="flex items-center gap-2">
                    {order.orderStatus === 'PENDING' && (
                      <button
                        disabled={updatingId === order.id}
                        onClick={() => handleUpdateOrderStatus(order.id, 'CONFIRMED')}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] shadow-xs"
                      >
                        Accept Order
                      </button>
                    )}

                    {order.orderStatus === 'CONFIRMED' && (
                      <button
                        disabled={updatingId === order.id}
                        onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] shadow-xs"
                      >
                        Start Packing
                      </button>
                    )}

                    {order.orderStatus === 'PREPARING' && (
                      <button
                        disabled={updatingId === order.id}
                        onClick={() => handleUpdateOrderStatus(order.id, 'READY_FOR_PICKUP')}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] shadow-xs"
                      >
                        Mark Ready for Pickup
                      </button>
                    )}

                    {order.orderStatus === 'READY_FOR_PICKUP' && (
                      <button
                        disabled={updatingId === order.id}
                        onClick={() => handleUpdateOrderStatus(order.id, 'OUT_FOR_DELIVERY')}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[11px] shadow-xs"
                      >
                        Hand Over for Delivery
                      </button>
                    )}

                    {order.orderStatus === 'OUT_FOR_DELIVERY' && (
                      <button
                        disabled={updatingId === order.id}
                        onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-xs"
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
