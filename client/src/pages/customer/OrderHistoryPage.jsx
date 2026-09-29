import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Clock,
  Store,
  ChevronRight,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
} from 'lucide-react';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Your Orders</h1>
        <p className="text-xs text-gray-500 mt-1">
          Review recent deliveries and track ongoing orders from local neighborhood shops
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white p-6 rounded-3xl border border-gray-100 animate-pulse h-28"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 space-y-4 shadow-sm">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">No orders placed yet</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Discover neighborhood stores around your location and place your first local delivery.
          </p>
          <Link
            to="/shops"
            className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
          >
            Explore Local Shops
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isCancelled = order.orderStatus === 'CANCELLED';
            const isDelivered = order.orderStatus === 'DELIVERED';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{order.shop.shopName}</h4>
                      <span className="text-[11px] text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()} at{' '}
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isCancelled
                          ? 'bg-red-100 text-red-700'
                          : isDelivered
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {order.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Items Summary preview */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase block">
                      Order: {order.orderNumber}
                    </span>
                    <p className="text-gray-700 font-medium">
                      {order.items.map((i) => `${i.productNameSnapshot} × ${i.quantity}`).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block uppercase">Total</span>
                      <span className="text-base font-black text-gray-900">₹{order.totalAmount}</span>
                    </div>

                    <Link
                      to={`/orders/${order.id}`}
                      className="px-4 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <span>Track Order</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
