import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Store,
  MapPin,
  Clock,
  Truck,
  Star,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default function ShopListingPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [openOnly, setOpenOnly] = useState(false);

  useEffect(() => {
    fetchShops();
  }, [openOnly]);

  const fetchShops = async (searchQuery = search) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (openOnly) params.openOnly = 'true';

      const res = await api.get('/shops', { params });
      setShops(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load neighborhood shops.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchShops(search);
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header & Local Explainer */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Local Retailers
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Nearby Neighborhood Shops
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mt-1">
              Browse independent stores around your location. Each shop manages its own inventory, prices, and fast local delivery.
            </p>
          </div>

          {/* Quick Filter toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition">
              <input
                type="checkbox"
                checked={openOnly}
                onChange={(e) => setOpenOnly(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Open Stores Only</span>
            </label>
          </div>
        </div>

        {/* Search input bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search shops by name, address, or products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Shops Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse space-y-4">
              <div className="h-32 bg-gray-200 rounded-2xl"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : shops.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Store className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No shops found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {search
              ? `No local shops matched "${search}". Try a different keyword.`
              : 'There are currently no approved shops matching your criteria.'}
          </p>
          {search && (
            <button
              onClick={() => {
                setSearch('');
                fetchShops('');
              }}
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              Clear search filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <div
              key={shop.id}
              className="group bg-white rounded-3xl border border-gray-100 hover:border-emerald-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Shop Banner / Image */}
                <div className="h-36 bg-gradient-to-tr from-emerald-800 to-teal-700 relative overflow-hidden flex items-center justify-center text-white">
                  {shop.imageUrl ? (
                    <img
                      src={shop.imageUrl}
                      alt={shop.shopName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 opacity-80 group-hover:scale-105 transition-transform">
                      <Store className="w-10 h-10" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider">Local Merchant</span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-md shadow-xs ${
                        shop.status === 'OPEN'
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-red-500/90 text-white'
                      }`}
                    >
                      {shop.status === 'OPEN' ? 'Open Now' : 'Closed'}
                    </span>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{shop.avgRating}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-black text-gray-900 group-hover:text-emerald-600 transition truncate">
                      {shop.shopName}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{shop.description}</p>
                  </div>

                  {/* Address & Distance */}
                  <div className="text-xs text-gray-600 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">
                      {shop.address} &bull; <strong className="text-gray-900">{shop.distanceKm} km away</strong>
                    </span>
                  </div>

                  {/* Operational Details Chips */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-[11px]">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{shop.openingTime} - {shop.closingTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>₹{shop.deliveryFee} delivery</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer CTA */}
              <div className="p-5 pt-0">
                <Link
                  to={`/shops/${shop.id}`}
                  className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 group-hover:bg-emerald-600 group-hover:text-white"
                >
                  <span>Enter Store & View Products</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
