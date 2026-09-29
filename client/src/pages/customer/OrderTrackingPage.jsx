import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Clock,
  CheckCircle,
  Truck,
  Package,
  Store,
  MapPin,
  AlertTriangle,
  XCircle,
  RotateCcw,
  ShoppingBag,
} from 'lucide-react';

const TRACKING_STEPS = [
  { key: 'PENDING', label: 'Order Placed', desc: 'Sent to local shop' },
  { key: 'CONFIRMED', label: 'Confirmed', desc: 'Accepted by merchant' },
  { key: 'PREPARING', label: 'Preparing', desc: 'Packing fresh items' },
  { key: 'READY_FOR_PICKUP', label: 'Ready', desc: 'Awaiting delivery pickup' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Rider on the way' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Package received' },
];

export default function OrderTrackingPage() {
  const { id: orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of delivery plans');

  useEffect(() => {
    fetchOrder();
    // Poll every 10 seconds for real-time tracking updates
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch (err) {
      console.error('Failed to fetch order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      await api.patch(`/orders/${orderId}/cancel`, { reason: cancelReason });
      setCancelModal(false);
      fetchOrder();
    } catch (err) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading && !order) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-gray-500 font-medium">Loading tracking timeline...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center space-y-4 bg-white rounded-3xl border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">Order Not Found</h2>
        <Link to="/orders" className="text-xs font-bold text-emerald-600 underline">
          View all your orders
        </Link>
      </div>
    );
  }

  const isCancelled = order.orderStatus === 'CANCELLED';
  const isDelivered = order.orderStatus === 'DELIVERED';
  const canCancel = order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED';

  // Calculate current active step index
  const currentStepIndex = isCancelled
    ? -1
    : TRACKING_STEPS.findIndex((s) => s.key === order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Live Order Tracking</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
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
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
            {order.orderNumber}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()} &bull; Payment: <strong>{order.paymentStatus}</strong> ({order.payment?.paymentMethod})
          </p>
        </div>

        {canCancel && (
          <button
            onClick={() => setCancelModal(true)}
            className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition self-start sm:self-auto"
          >
            Cancel Order
          </button>
        )}
      </div>

      {/* TRACKING STEPPER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
          Delivery Progress
        </h3>

        {isCancelled ? (
          <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-center space-y-2">
            <XCircle className="w-10 h-10 text-red-600 mx-auto" />
            <h4 className="text-base font-bold text-red-900">This order has been cancelled</h4>
            <p className="text-xs text-red-700">
              Reason: {order.cancellationReason || 'Cancelled by customer'}
            </p>
            <p className="text-[11px] text-gray-500">
              Restocked into {order.shop.shopName}'s inventory.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {TRACKING_STEPS.map((step, idx) => {
              const isDone = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step.key}
                  className={`p-3.5 rounded-2xl border transition text-center flex flex-col justify-between ${
                    isCurrent
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                      : isDone
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-gray-100 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <h5 className="text-xs font-bold text-gray-900 mt-2">{step.label}</h5>
                    <p className="text-[10px] text-gray-500 leading-tight">{step.desc}</p>
                  </div>

                  {isCurrent && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-extrabold uppercase rounded-full">
                      Active
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ORDER ITEMS & HISTORICAL PRICE FREEZE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              Purchased Items ({order.items.length})
            </h3>
            <span className="text-[10px] font-semibold text-gray-400">
              * Frozen purchase price snapshot
            </span>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{item.productNameSnapshot}</h4>
                  <span className="text-gray-400 text-[11px]">
                    Price at purchase: ₹{item.priceSnapshot} &bull; Qty: {item.quantity}
                  </span>
                </div>
                <span className="font-black text-gray-900 text-sm">
                  ₹{item.priceSnapshot * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-bold text-gray-900">₹{order.deliveryFee}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax (GST)</span>
              <span className="font-bold text-gray-900">₹{order.tax}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-100">
              <span>Total Paid</span>
              <span className="text-emerald-700">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* SHOP & DESTINATION INFO */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Store Information
            </h4>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-gray-900">{order.shop.shopName}</h5>
                <p className="text-xs text-gray-500 mt-0.5">{order.shop.address}</p>
                <p className="text-xs text-gray-400 mt-1">Phone: {order.shop.phone}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Delivery Address
            </h4>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <h5 className="font-bold text-gray-900">{order.address?.recipientName}</h5>
                <p className="text-gray-500 mt-0.5">{order.address?.street}</p>
                <p className="text-gray-500">
                  {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                </p>
                <p className="text-gray-400 mt-1">Contact: {order.address?.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">Cancel Order?</h3>
            <p className="text-xs text-gray-500 text-center">
              Are you sure you want to cancel this order? The inventory will be automatically restored to {order.shop.shopName}.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
              >
                <option value="Change of delivery plans">Change of delivery plans</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Taking too long to confirm">Taking too long to confirm</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setCancelModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelOrder}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
