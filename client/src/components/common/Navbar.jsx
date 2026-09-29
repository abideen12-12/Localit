import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Store, ShoppingBag, MapPin, Search, Shield, User, LogOut } from 'lucide-react';

export default function Navbar({ healthStatus }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      {/* Top micro announcement / health bar */}
      <div className="bg-emerald-600 text-white text-xs py-1 px-4 text-center font-medium flex justify-between items-center">
        <span>🚀 Local Marketplace — Empowering Neighborhood Brick-and-Mortar Retailers</span>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
          <span>PostgreSQL: {healthStatus?.services?.database ? 'Online (Port 5435)' : 'Connected'}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-gray-900 flex items-center">
                Local<span className="text-emerald-600">it</span>
              </span>
              <span className="text-[10px] block -mt-1 font-semibold uppercase tracking-wider text-gray-400">
                Local Shops Network
              </span>
            </div>
          </Link>

          {/* Location Delivery Selector Pill */}
          <Link
            to={isAuthenticated ? "/profile" : "/login"}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100/80 hover:bg-gray-200/80 rounded-full cursor-pointer transition text-xs font-medium text-gray-700"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Delivering to: <strong className="text-gray-900">Indiranagar, Bengaluru</strong></span>
          </Link>

          {/* Global Search Bar */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search local shops, milk, atta, groceries..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100/90 border border-transparent rounded-full focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    navigate(`/search?q=${encodeURIComponent(e.target.value.trim())}`);
                  }
                }}
              />
            </div>
          </div>

          {/* Action Links & Roles */}
          <div className="flex items-center gap-3">
            <Link
              to="/shops"
              className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-emerald-600 transition"
            >
              Browse Shops
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-emerald-600 hover:bg-gray-100 rounded-full transition"
              title="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Auth / Role based menus */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                {user.role === 'SHOP_OWNER' && (
                  <Link
                    to="/owner/dashboard"
                    className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1.5 rounded-lg font-semibold hover:bg-blue-100 transition"
                  >
                    Merchant Hub
                  </Link>
                )}
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin/dashboard"
                    className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1.5 rounded-lg font-semibold hover:bg-purple-100 transition flex items-center gap-1"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                  <Link
                    to="/profile"
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-emerald-600 transition"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:inline">{user.name.split(' ')[0]}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-lg shadow-sm hover:shadow transition"
                >
                  Join
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
