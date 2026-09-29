import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Shield,
  Store,
  User,
  RefreshCw,
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const res = await api.get('/admin/users', { params });
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user) => {
    if (user.role === 'ADMIN') {
      alert('Administrator accounts cannot be deactivated.');
      return;
    }

    if (!window.confirm(`Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} this user account?`)) {
      return;
    }

    setTogglingId(user.id);
    try {
      await api.patch(`/admin/users/${user.id}/toggle`);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
              <Users className="w-3.5 h-3.5" />
              Community & Identity
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Platform User Directory
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Oversee customers, shop owners, and system administrators across the Localit ecosystem.
            </p>
          </div>

          <button
            onClick={fetchUsers}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-gray-100 text-xs">
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'All Users', value: '' },
              { label: 'Customers', value: 'CUSTOMER' },
              { label: 'Shop Owners', value: 'SHOP_OWNER' },
              { label: 'Admins', value: 'ADMIN' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setRoleFilter(f.value)}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  roleFilter === f.value
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
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              className="pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-500 transition w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400">Loading directory...</div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Users className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-xs text-gray-500 font-medium">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Contact</th>
                  <th className="py-4 px-6">Platform Role</th>
                  <th className="py-4 px-6">Activity</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-xs">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block">{u.name}</span>
                          <span className="text-[10px] text-gray-400">ID: {u.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="block font-medium text-gray-900">{u.email}</span>
                      <span className="text-[11px] text-gray-400">{u.phone || 'No phone'}</span>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : u.role === 'SHOP_OWNER'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {u.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                        {u.role === 'SHOP_OWNER' && <Store className="w-3 h-3" />}
                        {u.role === 'CUSTOMER' && <User className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="text-gray-500">
                        {u._count?.orders || 0} orders &bull; {u._count?.shops || 0} stores
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          u.isActive ? 'text-emerald-600' : 'text-red-500'
                        }`}
                      >
                        {u.isActive ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            Deactivated
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          disabled={togglingId === u.id}
                          onClick={() => handleToggleActive(u)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition shadow-xs ${
                            u.isActive
                              ? 'bg-red-50 hover:bg-red-600 text-red-600 hover:text-white'
                              : 'bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
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
