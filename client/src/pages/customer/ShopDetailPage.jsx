import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Store,
  MapPin,
  Clock,
  Truck,
  Star,
  Search,
  Plus,
  Minus,
  AlertCircle,
  ShoppingBag,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export default function ShopDetailPage({ onAddToCart }) {
  const { id: shopId } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchShopAndProducts();
  }, [shopId, selectedCategory]);

  const fetchShopAndProducts = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch shop details
      const shopRes = await api.get(`/shops/${shopId}`);
      setShop(shopRes.data);

      // 2. Fetch products for this shop
      const params = {};
      if (selectedCategory) params.categoryId = selectedCategory;
      if (search) params.search = search;
      const prodRes = await api.get(`/shops/${shopId}/products`, { params });
      setProducts(prodRes.data || []);

      // 3. Fetch categories for category filter pills
      const catRes = await api.get('/categories');
      setCategories(catRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load shop details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchShopAndProducts();
  };

  const handleItemAdd = (product) => {
    if (product.status === 'OUT_OF_STOCK' || product.stockQuantity <= 0) {
      alert('This item is currently out of stock.');
      return;
    }

    // Call global cart dispatcher event
    window.dispatchEvent(
      new CustomEvent('localit:add-to-cart', {
        detail: {
          shop,
          product,
          quantity: 1,
        },
      })
    );
  };

  if (loading && !shop) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-gray-500 font-medium">Entering local shop...</p>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-gray-100 rounded-3xl text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Shop Unavailable</h2>
        <p className="text-xs text-gray-500">{error || 'Could not find the requested store.'}</p>
        <Link
          to="/shops"
          className="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Return to All Shops
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/shops" className="hover:text-emerald-600 transition">Shops</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-gray-900">{shop.shopName}</span>
      </nav>

      {/* Store Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <Store className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  {shop.shopName}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                    shop.status === 'OPEN'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {shop.status === 'OPEN' ? 'Open Now' : 'Closed'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl">
                {shop.description || 'Independent neighborhood supermarket delivering fresh goods.'}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{shop.address}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badge Card */}
          <div className="grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center shrink-0">
            <div>
              <span className="text-[10px] text-gray-400 font-semibold uppercase block">Rating</span>
              <span className="text-sm font-extrabold text-gray-900 flex items-center justify-center gap-1 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {shop.avgRating}
              </span>
            </div>
            <div className="border-x border-gray-200 px-2">
              <span className="text-[10px] text-gray-400 font-semibold uppercase block">Delivery Fee</span>
              <span className="text-sm font-extrabold text-gray-900 mt-0.5 block">
                ₹{shop.deliveryFee}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-semibold uppercase block">Time</span>
              <span className="text-sm font-extrabold text-emerald-700 mt-0.5 block">
                {shop.estimatedDeliveryTime}
              </span>
            </div>
          </div>
        </div>

        {/* In-store Search Bar */}
        <form onSubmit={handleSearchSubmit} className="pt-2 border-t border-gray-100">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search products within ${shop.shopName}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Main Catalog View: Category Tabs & Products */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Category Pills / Sidebar */}
        <aside className="w-full md:w-56 shrink-0 space-y-1">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
            Categories
          </div>
          <button
            onClick={() => setSelectedCategory('')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
              selectedCategory === ''
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
            }`}
          >
            <span>All Products</span>
            <span className="text-[11px] opacity-80">{products.length}</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
              }`}
            >
              <span className="truncate">{cat.name}</span>
            </button>
          ))}
        </aside>

        {/* Product Cards Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse space-y-3">
                  <div className="h-28 bg-gray-200 rounded-xl"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 space-y-3">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-sm font-bold text-gray-900">No products found in this category</h3>
              <p className="text-xs text-gray-500">Try selecting another category or clear the search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => {
                const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stockQuantity <= 0;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="h-28 rounded-xl bg-gray-50 border border-gray-100 mb-3 overflow-hidden flex items-center justify-center relative">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <ShoppingBag className="w-8 h-8 text-gray-300" />
                        )}

                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-md">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-gray-400 block uppercase">
                          {product.unit}
                        </span>
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">
                          {product.name}
                        </h4>
                        {product.description && (
                          <p className="text-[11px] text-gray-500 line-clamp-1">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price & Add to Cart button */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                      <div>
                        <span className="text-sm font-black text-gray-900">₹{product.price}</span>
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => handleItemAdd(product)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          isOutOfStock
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white shadow-xs'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
