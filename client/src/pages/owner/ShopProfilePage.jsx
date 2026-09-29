import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Store,
  Clock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Save,
  Phone,
  Mail,
  MapPin,
  Image as ImageIcon,
  DollarSign,
} from 'lucide-react';

export default function ShopProfilePage() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    shopName: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    latitude: 12.9716,
    longitude: 77.5946,
    openingTime: '08:00 AM',
    closingTime: '10:00 PM',
    deliveryRadius: 5.0,
    deliveryFee: 25.0,
    minOrderAmount: 0.0,
    imageUrl: '',
    status: 'OPEN',
  });

  useEffect(() => {
    fetchShop();
  }, []);

  const fetchShop = async () => {
    setLoading(true);
    try {
      const res = await api.get('/owner/shop');
      if (res.data) {
        setShop(res.data);
        setFormData({
          shopName: res.data.shopName || '',
          description: res.data.description || '',
          phone: res.data.phone || '',
          email: res.data.email || '',
          address: res.data.address || '',
          latitude: res.data.latitude || 12.9716,
          longitude: res.data.longitude || 77.5946,
          openingTime: res.data.openingTime || '08:00 AM',
          closingTime: res.data.closingTime || '10:00 PM',
          deliveryRadius: res.data.deliveryRadius || 5.0,
          deliveryFee: res.data.deliveryFee || 25.0,
          minOrderAmount: res.data.minOrderAmount || 0.0,
          imageUrl: res.data.imageUrl || '',
          status: res.data.status || 'OPEN',
        });
      }
    } catch (err) {
      console.error('Failed to load shop:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.patch('/owner/shop/status', { status: newStatus });
      setFormData((prev) => ({ ...prev, status: newStatus }));
      setMessage({ text: `Store status changed to ${newStatus}`, type: 'success' });
      fetchShop();
    } catch (err) {
      setMessage({ text: err.message || 'Failed to update store status', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await api.post('/owner/shop', formData);
      setShop(res.data);
      setMessage({ text: 'Store profile saved successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message || 'Failed to save store profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-gray-400">Loading store profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
              Merchant Management Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {shop?.shopName || 'Store Profile & Settings'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Configure your store presence, delivery settings, and operating hours.
            </p>
          </div>

          {/* Operational Status Pill Switcher */}
          {shop && (
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-2xl">
              {['OPEN', 'CLOSED', 'TEMPORARILY_UNAVAILABLE'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusChange(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    formData.status === st
                      ? st === 'OPEN'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-red-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {st === 'TEMPORARILY_UNAVAILABLE' ? 'UNAVAILABLE' : st}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Verification Status Alert */}
        {shop && (
          <div>
            {shop.verificationStatus === 'PENDING' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-800">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900">Verification Pending</h4>
                  <p className="mt-0.5">
                    Your shop profile has been registered and is awaiting audit by the platform administrator. Once approved, your products will be visible to local customers.
                  </p>
                </div>
              </div>
            )}
            {shop.verificationStatus === 'APPROVED' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-900">Store Verified & Active</h4>
                  <p className="mt-0.5">
                    Your shop is verified and live on the Localit customer network! Customers within your {formData.deliveryRadius} km delivery radius can discover and order from you.
                  </p>
                </div>
              </div>
            )}
            {(shop.verificationStatus === 'REJECTED' || shop.verificationStatus === 'SUSPENDED') && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-800">
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-900">Shop {shop.verificationStatus}</h4>
                  <p className="mt-0.5">
                    Your shop is currently not visible to customers. Please contact support or update your store information.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notifications / Messages */}
      {message.text && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
          Store Information & Setup
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Shop / Store Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Indiranagar Daily Fresh Supermarket"
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Store Description</label>
            <textarea
              rows={2}
              placeholder="Describe your specialty, products, or neighborhood presence..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Phone *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Physical Address *</label>
            <input
              type="text"
              required
              placeholder="Building number, street, locality, city, pincode"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Store Banner / Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition"
            />
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 pt-4">
          Delivery & Operational Settings
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Opening Time</label>
            <input
              type="text"
              placeholder="08:00 AM"
              value={formData.openingTime}
              onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Closing Time</label>
            <input
              type="text"
              placeholder="10:00 PM"
              value={formData.closingTime}
              onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Radius (km)</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="25"
              value={formData.deliveryRadius}
              onChange={(e) => setFormData({ ...formData, deliveryRadius: parseFloat(e.target.value) || 1 })}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Fee (₹)</label>
            <input
              type="number"
              step="1"
              min="0"
              value={formData.deliveryFee}
              onChange={(e) => setFormData({ ...formData, deliveryFee: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Store Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
