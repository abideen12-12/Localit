import React from 'react';
import { useCart } from '../../context/CartContext';
import { Store, AlertTriangle, ArrowRight, X } from 'lucide-react';

export default function MultiShopConflictModal() {
  const { conflictModal, confirmSwitchShop, cancelSwitchShop } = useCart();

  if (!conflictModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">
            Replace Cart Items?
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Your cart currently contains items from <strong>{conflictModal.currentShop?.name || 'another local shop'}</strong>.
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl text-xs text-amber-900 font-medium mt-2">
            Localit delivers from one local shop per order to ensure fast, direct neighborhood delivery.
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={confirmSwitchShop}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
          >
            <span>Clear Existing Cart & Add New Items</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={cancelSwitchShop}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
          >
            Keep Existing Cart
          </button>
        </div>
      </div>
    </div>
  );
}
