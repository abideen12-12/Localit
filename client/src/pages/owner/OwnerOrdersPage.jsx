import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react';

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/owner/orders', {
        params: {
          ...(statusFilter && { orderStatus: statusFilter }),
          ...(search && { search }),
        },
      });
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to load owner orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { orderStatus: newStatus });
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
              Store Order Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Customer Orders Roster
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              View and manage fulfillment lifecycle for orders received by your store
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-gray-100 text-xs">
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'All Orders', value: '' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'Confirmed', value: 'CONFIRMED' },
              { label: 'Preparing', value: 'PREPARING' },
              { label: 'Out for Delivery', value: 'OUT_FOR_DELIVERY' },
              { label: 'Delivered', value: 'DELIVERED' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  statusFilter === f.value
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order # or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
              className="pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-xs text-gray-500 font-medium">No orders found for this criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Order Details</th>
                  <th className="py-4 px-6">Customer & Address</th>
                  <th className="py-4 px-6">Items Ordered</th>
                  <th className="py-4 px-6">Amount & Payment</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Fulfillment Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6">
                      <span className="font-bold text-gray-900 block text-sm">{o.orderNumber}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(o.createdAt).toLocaleString()}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <span className="font-bold text-gray-900 block">{o.customer?.name}</span>
                        <span className="text-[11px] text-gray-500 block">{o.customer?.phone}</span>
                        <span className="text-[10px] text-gray-400 block truncate max-w-xs">
                          {o.address?.street}, {o.address?.city}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="space-y-1 max-w-xs">
                        {o.items.map((i) => (
                          <div key={i.id} className="text-[11px] text-gray-700">
                            {i.productNameSnapshot} × <strong>{i.quantity}</strong>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-black text-gray-900 text-sm block">₹{o.totalAmount}</span>
                      <span className="text-[10px] text-gray-400 uppercase">
                        {o.paymentStatus} ({o.payment?.paymentMethod})
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          o.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.orderStatus === 'CANCELLED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {o.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      {o.orderStatus === 'PENDING' && (
                        <button
                          disabled={updatingId === o.id}
                          onClick={() => handleUpdateStatus(o.id, 'CONFIRMED')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] shadow-xs"
                        >
                          Accept
                        </button>
                      )}
                      {o.orderStatus === 'CONFIRMED' && (
                        <button
                          disabled={updatingId === o.id}
                          onClick={() => handleUpdateStatus(o.id, 'PREPARING')}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] shadow-xs"
                        >
                          Pack
                        </button>
                      )}
                      {o.orderStatus === 'PREPARING' && (
                        <button
                          disabled={updatingId === o.id}
                          onClick={() => handleUpdateStatus(o.id, 'READY_FOR_PICKUP')}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] shadow-xs"
                        >
                          Ready
                        </button>
                      )}
                      {o.orderStatus === 'READY_FOR_PICKUP' && (
                        <button
                          disabled={updatingId === o.id}
                          onClick={() => handleUpdateStatus(o.id, 'OUT_FOR_DELIVERY')}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[11px] shadow-xs"
                        >
                          Dispatch
                        </button>
                      )}
                      {o.orderStatus === 'OUT_FOR_DELIVERY' && (
                        <button
                          disabled={updatingId === o.id}
                          onClick={() => handleUpdateStatus(o.id, 'DELIVERED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-xs"
                        >
                          Delivered
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
