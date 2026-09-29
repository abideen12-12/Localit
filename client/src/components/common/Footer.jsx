import React from 'react';
import { Store, Heart, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20 border-t border-gray-800">
      {/* Value props banner */}
      <div className="border-b border-gray-800 bg-gray-950/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">100% Local Shops</h4>
              <p className="text-xs text-gray-400">Directly supporting your neighborhood merchants.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">Hyperlocal Delivery</h4>
              <p className="text-xs text-gray-400">Order from stores within your immediate vicinity.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">Verified Retailers</h4>
              <p className="text-xs text-gray-400">Admin-audited local stores with genuine inventory.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-base">Localit</span>
            <span>— The Local Multi-Shop Delivery Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-emerald-400 transition">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-400 transition">Terms of Service</a>
            <a href="#" className="hover:text-emerald-400 transition">Merchant Terms</a>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Localit Marketplace. Built with React, Express & PostgreSQL.
          </div>
        </div>
      </div>
    </footer>
  );
}
