import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Shield,
  Store,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

export default function AdminShopsPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(''); // '' | 'PENDING' | 'APPROVED' | 'SUSPENDED'
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchShops();
  }, [filterStatus]);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.verificationStatus = filterStatus;
      if (search) params.search = search;
      const res = await api.get('/admin/shops', { params });
      setShops(res.data || []);
    } catch (err) {
      console.error('Failed to fetch shops for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (shopId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change this shop's verification to ${newStatus}?`)) {
      return;
    }
    setUpdatingId(shopId);
    try {
      await api.patch(`/admin/shops/${shopId}/status`, { verificationStatus: newStatus });
      fetchShops();
    } catch (err) {
      alert(err.message || 'Failed to update shop status');
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-2">
              <Shield className="w-3.5 h-3.5" />
              Platform Administration
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Shop Verification & Governance
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Audit merchant registrations, approve legitimate neighborhood stores, or suspend policy-violating merchants.
            </p>
          </div>

          <button
            onClick={fetchShops}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { label: 'All Shops', value: '' },
              { label: 'Pending Audit', value: 'PENDING' },
              { label: 'Approved & Live', value: 'APPROVED' },
              { label: 'Suspended', value: 'SUSPENDED' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterStatus(f.value)}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  filterStatus === f.value
                    ? 'bg-purple-600 text-white shadow-xs'
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
              placeholder="Search shops or owners..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchShops()}
              className="pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-500 transition w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Shops Table / List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400">Loading shop roster...</div>
        ) : shops.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Store className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-xs text-gray-500 font-medium">No shops found for the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Store & Owner</th>
                  <th className="py-4 px-6">Contact & Address</th>
                  <th className="py-4 px-6">Catalog & Stats</th>
                  <th className="py-4 px-6">Verification</th>
                  <th className="py-4 px-6 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <span className="font-bold text-gray-900 text-sm block">
                          {shop.shopName}
                        </span>
                        <span className="text-[11px] text-gray-500 block">
                          Owner: <strong>{shop.owner?.name}</strong> ({shop.owner?.email})
                        </span>
                        <span className="text-[10px] text-gray-400">
                          Registered: {new Date(shop.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="space-y-1 text-gray-600 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>{shop.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="truncate">{shop.address}</span>
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Radius: {shop.deliveryRadius} km &bull; Fee: ₹{shop.deliveryFee}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <span className="font-semibold text-gray-900 block">
                          {shop._count.products} Products listed
                        </span>
                        <span className="text-gray-500 text-[11px] block">
                          {shop._count.orders} Orders processed
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          shop.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                          Store: {shop.status}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          shop.verificationStatus === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : shop.verificationStatus === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {shop.verificationStatus === 'APPROVED' && <CheckCircle className="w-3 h-3" />}
                        {shop.verificationStatus === 'PENDING' && <AlertTriangle className="w-3 h-3" />}
                        {shop.verificationStatus}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      {shop.verificationStatus !== 'APPROVED' && (
                        <button
                          disabled={updatingId === shop.id}
                          onClick={() => handleUpdateStatus(shop.id, 'APPROVED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-xs transition"
                        >
                          Approve
                        </button>
                      )}

                      {shop.verificationStatus === 'APPROVED' && (
                        <button
                          disabled={updatingId === shop.id}
                          onClick={() => handleUpdateStatus(shop.id, 'SUSPENDED')}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] shadow-xs transition"
                        >
                          Suspend
                        </button>
                      )}

                      {shop.verificationStatus === 'PENDING' && (
                        <button
                          disabled={updatingId === shop.id}
                          onClick={() => handleUpdateStatus(shop.id, 'REJECTED')}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[11px] shadow-xs transition"
                        >
                          Reject
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
