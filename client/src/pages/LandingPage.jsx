import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Store, ShieldCheck, Zap, ArrowRight, CheckCircle2, ShoppingCart, UserCheck, Database } from 'lucide-react';

export default function LandingPage() {
  const { health } = useOutletContext() || {};

  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-6">
          

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Shop From Your <span className="text-emerald-400">Neighborhood Stores</span> Online.
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed font-normal">
            <strong>Support your local markets with Localit.</strong> Instead of relying on big e-commerce apps, shop directly from your favorite local supermarkets, bakeries, and dairies. Compare prices, order your daily essentials, and get them delivered to your doorstep while supporting local businesses.          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/shops"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-500/30 transition transform hover:-translate-y-0.5 text-sm"
            >
              <Store className="w-4 h-4" />
              Explore Nearby Shops
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/register?role=SHOP_OWNER"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-xl border border-white/20 backdrop-blur-sm transition text-sm"
            >
              List Your Shop on Localit
            </Link>
          </div>
        </div>
      </section>

      {/* System Status & Architecture Verification Pill */}
      <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              health?.success ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Platform Foundation & Verification</h3>
              <p className="text-xs text-gray-500">
                PostgreSQL Relational Engine &bull; Express REST Gateway &bull; React Client
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 font-medium text-gray-700">
              <span className={`w-2 h-2 rounded-full ${health?.success ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              Server: {health?.services?.server || 'Checking...'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 font-medium text-gray-700">
              <span className={`w-2 h-2 rounded-full ${health?.services?.database ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              DB: {health?.services?.database || 'Connecting...'}
            </span>
          </div>
        </div>
      </section>

      {/* 3 Core Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Independent Local Shops</h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Every shop sets their own pricing, manages stock levels, and prepares packages. Support your favorite neighborhood retailers.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Multi-Shop Price Comparison</h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Search for an item like "Milk" and instantly compare prices across nearby stores (e.g. Shop A ₹50 vs Shop B ₹54 vs Shop C ₹48).
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Single-Shop Integrity & Auditing</h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Clear cart guarantees no confusing multi-shop order splitting. Platform admin audits verify authenticity before shops go live.
          </p>
        </div>
      </section>
    </div>
  );
}
