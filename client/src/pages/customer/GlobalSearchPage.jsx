import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Search,
  Store,
  MapPin,
  Truck,
  ArrowRight,
  Filter,
  ArrowUpDown,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

export default function GlobalSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('price_asc'); // 'price_asc' | 'price_desc' | 'distance'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch categories for filtering
    api.get('/categories').then((res) => setCategories(res.data || []));
  }, []);

  useEffect(() => {
    if (queryParam) {
      performSearch(queryParam);
    }
  }, [queryParam, selectedCategory, sortBy]);

  const performSearch = async (searchTerm) => {
    setLoading(true);
    try {
      const params = {
        query: searchTerm,
        sortBy,
      };
      if (selectedCategory) params.categoryId = selectedCategory;

      const res = await api.get('/products/search', { params });
      setResults(res.data || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header and Search Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          Multi-Shop Marketplace Price Comparison
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Search Products Across Local Shops
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Compare real-time prices for the same item across neighborhood stores. Support local shops while getting the best price and fastest delivery.
        </p>

        <form onSubmit={handleSearchSubmit} className="flex gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products (e.g. Milk, Atta, Bread, Soap)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-600/20 transition"
          >
            Compare Prices
          </button>
        </form>

        {/* Filters and Sorting bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-500">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 font-medium text-gray-700 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 font-medium text-gray-700 focus:outline-none"
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="distance">Nearest Store First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      {queryParam && (
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <span>
            Found <strong>{results.length}</strong> matching offerings across local shops for "<strong>{queryParam}</strong>"
          </span>
        </div>
      )}

      {/* Results List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white p-6 rounded-3xl border border-gray-100 animate-pulse h-28"></div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 space-y-3">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">
            {queryParam ? 'No products found' : 'Enter a search term above'}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {queryParam
              ? `No local shops currently offer "${queryParam}". Try searching for generic items like Milk, Bread, or Atta.`
              : 'Search across all neighborhood shops to view product options and compare prices.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 border border-gray-100 hover:border-emerald-200 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start gap-4">
                {/* Product Image / Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden p-1">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                  ) : (
                    <ShoppingBag className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                        {item.unit}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 mt-1 truncate">
                        {item.name}
                      </h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-gray-900 block">
                        ₹{item.price}
                      </span>
                      <span className={`text-[10px] font-bold ${
                        item.status === 'AVAILABLE' && item.stockQuantity > 0 ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        {item.status === 'AVAILABLE' && item.stockQuantity > 0
                          ? `${item.stockQuantity} in stock`
                          : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shop Badge & Action */}
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 truncate">
                    <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{item.shop.shopName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {item.shop.distanceKm} km away
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-gray-400" />
                      ₹{item.shop.deliveryFee} delivery
                    </span>
                  </div>
                </div>

                <Link
                  to={`/shops/${item.shop.id}`}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 shrink-0"
                >
                  <span>Shop Store</span>
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
