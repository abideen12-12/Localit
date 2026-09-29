import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  CheckCircle2,
  Store,
  MapPin,
  ArrowRight,
  ShoppingBag,
  Clock,
  Truck,
} from 'lucide-react';

export default function OrderSuccessPage() {
  const { id: orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${orderId}`)
      .then((res) => setOrder(res.data))
      .catch((err) => console.error('Failed to load order confirmation:', err))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return <div className="py-20 text-center text-xs text-gray-400">Loading order confirmation...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto my-8 sm:my-12">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xl shadow-gray-200/50 text-center space-y-6">
        {/* Animated Checkmark */}
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Order Confirmed!
          </span>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Thank you for ordering locally!
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Your neighborhood store has received your order and is preparing your package.
          </p>
        </div>

        {/* Order Details Snippet Box */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-left space-y-4">
          <div className="flex justify-between items-center border-b border-gray-200 pb-3">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Order Number</span>
              <span className="text-sm font-black text-gray-900">{order?.orderNumber}</span>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase">
              {order?.orderStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Store</span>
              <span className="font-bold text-gray-900 block mt-0.5">{order?.shop?.shopName}</span>
              <span className="text-[11px] text-gray-500">{order?.shop?.address}</span>
            </div>

            <div>
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Delivering To</span>
              <span className="font-bold text-gray-900 block mt-0.5">{order?.address?.recipientName}</span>
              <span className="text-[11px] text-gray-500 truncate block">
                {order?.address?.street}, {order?.address?.city}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3 flex justify-between items-center text-xs">
            <span className="text-gray-500 font-medium">Total Paid:</span>
            <span className="text-base font-black text-emerald-700">₹{order?.totalAmount}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to={`/orders/${orderId}`}
            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4" />
            <span>Track Live Order Status</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/shops"
            className="py-3.5 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
