import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  MapPin,
  Plus,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Store,
  Tag,
} from 'lucide-react';

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ONLINE_MOCK');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      setAddresses(res.data || []);
      const defaultAddr = res.data?.find((a) => a.isDefault) || res.data?.[0];
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    if (couponCode.trim().toUpperCase() === 'WELCOME10') {
      const discount = Math.min(50, cart?.subtotal * 0.1);
      setCouponDiscount(parseFloat(discount.toFixed(2)));
      setCouponApplied(true);
      setCouponMsg('Coupon WELCOME10 applied! 10% discount added.');
    } else {
      setCouponMsg('Invalid or expired coupon code.');
      setCouponApplied(false);
      setCouponDiscount(0);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Please choose or add a delivery address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        addressId: selectedAddressId,
        paymentMethod,
        ...(couponApplied && { couponCode }),
      };

      const res = await api.post('/orders', payload);
      await fetchCart(); // Refresh empty cart
      navigate(`/orders/${res.data.id}/success`);
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">No Items to Checkout</h2>
        <p className="text-xs text-gray-500">Your cart is empty. Add products first.</p>
        <Link to="/shops" className="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold">
          Browse Shops
        </Link>
      </div>
    );
  }

  const subtotal = cart.subtotal || 0;
  const deliveryFee = cart.deliveryFee || 0;
  const tax = parseFloat(((subtotal - couponDiscount) * 0.05).toFixed(2));
  const finalTotal = parseFloat((subtotal + deliveryFee - couponDiscount + tax).toFixed(2));

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Checkout</h1>
        <p className="text-xs text-gray-500 mt-1">
          Review your local delivery destination, payment method, and bill breakdown
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: DELIVERY ADDRESS */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Select Delivery Address
              </h3>
              <Link to="/profile" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" />
                Manage Addresses
              </Link>
            </div>

            {addresses.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-2">
                <p>You haven't added any delivery addresses yet.</p>
                <Link to="/profile" className="font-bold underline">
                  Add an address in your Profile
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                      selectedAddressId === addr.id
                        ? 'border-emerald-600 bg-emerald-50/30 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">{addr.recipientName}</span>
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        {addr.street}, {addr.city} - {addr.pincode}
                      </p>
                      <span className="text-[10px] text-gray-400 block">{addr.phone}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* STEP 2: PAYMENT METHOD */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Choose Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                  paymentMethod === 'ONLINE_MOCK'
                    ? 'border-emerald-600 bg-emerald-50/30 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'ONLINE_MOCK'}
                  onChange={() => setPaymentMethod('ONLINE_MOCK')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    Mock Instant Payment (UPI / Cards)
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Simulates instantaneous gateway settlement. Ready for Razorpay/Stripe integration.
                  </p>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-emerald-600 bg-emerald-50/30 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'CASH_ON_DELIVERY'}
                  onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    Cash on Delivery (COD)
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Pay in cash or UPI when your neighborhood store package arrives.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* STEP 3: ORDER ITEMS SNAPSHOT REVIEW */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Store className="w-4 h-4 text-emerald-600" />
              Ordering from: {cart.shop?.shopName}
            </h3>

            <div className="divide-y divide-gray-100 text-xs">
              {cart.items.map((item) => (
                <div key={item.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-900">{item.product.name}</span>
                    <span className="text-gray-400 block text-[11px]">
                      {item.product.unit} &bull; Qty: {item.quantity}
                    </span>
                  </div>
                  <span className="font-extrabold text-gray-900">
                    ₹{item.product.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BILL SUMMARY & COUPON */}
        <div className="space-y-4">
          {/* Coupon Card */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-600" />
              Have a Coupon?
            </h4>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Try: WELCOME10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl uppercase font-semibold focus:bg-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition"
              >
                Apply
              </button>
            </form>
            {couponMsg && (
              <p className={`text-[11px] font-medium ${couponApplied ? 'text-emerald-600' : 'text-red-500'}`}>
                {couponMsg}
              </p>
            )}
          </div>

          {/* Bill Calculation Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Payment Summary
            </h3>

            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Local Delivery Fee</span>
                <span className="font-semibold text-gray-900">₹{deliveryFee}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Taxes & GST (5%)</span>
                <span className="font-semibold text-gray-900">₹{tax}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-900">Total Payable</span>
              <span className="text-2xl font-black text-emerald-700">₹{finalTotal}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || addresses.length === 0}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Place Order • ₹{finalTotal}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center gap-2 text-[11px] text-gray-400 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe & Secure Neighborhood Transaction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
