import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Tag,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  X,
} from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountAmount: '',
    minOrderAmount: '',
    maxDiscount: '',
    expiryDate: '',
    usageLimit: 100,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coupons');
      setCoupons(res.data || []);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coupons', formData);
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      alert(err.message || 'Failed to create coupon');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await api.patch(`/coupons/${id}/toggle`);
      fetchCoupons();
    } catch (err) {
      alert(err.message || 'Failed to toggle coupon status');
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-2">
            <Tag className="w-3.5 h-3.5" />
            Promotions & Incentives
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Coupon & Discount Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Create platform-level discount vouchers for customer acquisition and order savings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCoupons}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            Create Coupon
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400">Loading vouchers...</div>
        ) : coupons.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Tag className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-xs text-gray-500 font-medium">No coupons active.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Coupon Code</th>
                  <th className="py-4 px-6">Discount Value</th>
                  <th className="py-4 px-6">Conditions</th>
                  <th className="py-4 px-6">Redemptions</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6">
                      <span className="font-mono font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg text-xs">
                        {c.code}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-bold text-gray-900">
                      {c.discountType === 'PERCENTAGE'
                        ? `${c.discountAmount}% OFF`
                        : `₹${c.discountAmount} Flat OFF`}
                      {c.maxDiscount && (
                        <span className="text-[10px] text-gray-400 block font-normal">
                          Max: ₹{c.maxDiscount}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-gray-600">
                      <span>Min Order: ₹{c.minOrderAmount}</span>
                      <span className="text-[10px] text-gray-400 block">
                        Expires: {new Date(c.expiryDate).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-900">
                        {c.usedCount} / {c.usageLimit}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          c.isActive ? 'text-emerald-600' : 'text-red-500'
                        }`}
                      >
                        {c.isActive ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            Disabled
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleToggleActive(c.id)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition shadow-xs ${
                          c.isActive
                            ? 'bg-red-50 hover:bg-red-600 text-red-600 hover:text-white'
                            : 'bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white'
                        }`}
                      >
                        {c.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Create Platform Coupon</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl uppercase font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Amount *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="e.g. 10 or 50"
                    value={formData.discountAmount}
                    onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 100"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
