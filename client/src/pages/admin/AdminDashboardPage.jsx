import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Shield,
  Store,
  Users,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  FolderTree,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-gray-400">Loading administrator console...</div>;
  }

  const { metrics, recentOrders } = data || {};

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" />
            Platform Control Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Localit Ecosystem Overview
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Global network telemetry, merchant auditing, user governance, and revenue analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/shops"
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition"
          >
            Audit Shops ({metrics?.pendingShops} Pending)
          </Link>
          <button
            onClick={fetchDashboard}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
            title="Refresh metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pending Audits Action Alert */}
      {metrics?.pendingShops > 0 && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                {metrics.pendingShops} Shop{metrics.pendingShops > 1 ? 's' : ''} Awaiting Verification
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                New merchant stores will not be visible to customers until audited and approved.
              </p>
            </div>
          </div>
          <Link
            to="/admin/shops?verificationStatus=PENDING"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 transition"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* Platform KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            Platform Gross Revenue
          </span>
          <span className="text-2xl font-black text-purple-700 block">₹{metrics?.totalRevenue}</span>
          <span className="text-[10px] text-gray-400">Delivered order GMV</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            Registered Stores
          </span>
          <span className="text-2xl font-black text-gray-900 block">{metrics?.totalShops}</span>
          <span className="text-[10px] text-emerald-600 font-semibold">
            {metrics?.activeShops} verified & active
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            Total Platform Orders
          </span>
          <span className="text-2xl font-black text-blue-700 block">{metrics?.totalOrders}</span>
          <span className="text-[10px] text-gray-400">{metrics?.cancelledOrders} cancelled</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            Active Community
          </span>
          <span className="text-2xl font-black text-gray-900 block">
            {(metrics?.totalCustomers || 0) + (metrics?.totalShopOwners || 0)}
          </span>
          <span className="text-[10px] text-gray-400">
            {metrics?.totalCustomers} customers &bull; {metrics?.totalShopOwners} merchants
          </span>
        </div>
      </div>

      {/* Admin Quick Action Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/shops"
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs hover:shadow-md transition space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Store className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">Shop Governance</h3>
          <p className="text-xs text-gray-500">Approve, audit, reject or suspend neighborhood merchants.</p>
        </Link>

        <Link
          to="/admin/categories"
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs hover:shadow-md transition space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FolderTree className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">Category Taxonomy</h3>
          <p className="text-xs text-gray-500">Manage global categories used by local store owners.</p>
        </Link>

        <Link
          to="/admin/users"
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs hover:shadow-md transition space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">User Directory</h3>
          <p className="text-xs text-gray-500">Inspect customer and merchant accounts & activity.</p>
        </Link>
      </div>

      {/* Recent Platform Orders Feed */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Platform Transactions</h2>
            <p className="text-xs text-gray-500">Live order activity across all neighborhood stores</p>
          </div>
          <Link to="/admin/orders" className="text-xs font-bold text-purple-600 hover:underline">
            Open Global Order Monitor
          </Link>
        </div>

        {recentOrders?.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">No platform transactions yet.</div>
        ) : (
          <div className="divide-y divide-gray-100 text-xs">
            {recentOrders?.map((o) => (
              <div key={o.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-gray-900">{o.orderNumber}</span>
                  <div className="text-[11px] text-gray-500">
                    Store: <strong>{o.shop?.shopName}</strong> &bull; Customer: {o.customer?.name}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-black text-gray-900 text-sm">₹{o.totalAmount}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      o.orderStatus === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : o.orderStatus === 'CANCELLED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {o.orderStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
