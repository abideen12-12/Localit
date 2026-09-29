import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [conflictModal, setConflictModal] = useState({
    isOpen: false,
    currentShop: null,
    newShop: null,
    pendingProduct: null,
    pendingQuantity: 1,
    message: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated]);

  // Global event listener for 'localit:add-to-cart'
  useEffect(() => {
    const handleAddEvent = (e) => {
      const { product, quantity } = e.detail;
      addToCart(product, quantity);
    };

    window.addEventListener('localit:add-to-cart', handleAddEvent);
    return () => window.removeEventListener('localit:add-to-cart', handleAddEvent);
  }, [cart, isAuthenticated]);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.data);
    } catch (err) {
      console.warn('Could not fetch cart:', err.message);
    }
  };

  const addToCart = async (product, quantity = 1, forceClear = false) => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/cart', {
        productId: product.id,
        quantity,
        clearExistingIfDifferentShop: forceClear,
      });

      setCart(res.data);
      setConflictModal({ isOpen: false, currentShop: null, newShop: null, pendingProduct: null, pendingQuantity: 1, message: '' });
      return res.data;
    } catch (err) {
      // Check for multi-shop conflict
      if (err.message && err.message.includes('Clear your existing cart')) {
        setConflictModal({
          isOpen: true,
          currentShop: cart?.shop,
          newShop: product.shop || { name: 'New Shop' },
          pendingProduct: product,
          pendingQuantity: quantity,
          message: err.message,
        });
      } else {
        alert(err.message || 'Could not add product to cart.');
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmSwitchShop = async () => {
    if (conflictModal.pendingProduct) {
      await addToCart(conflictModal.pendingProduct, conflictModal.pendingQuantity, true);
    }
  };

  const cancelSwitchShop = () => {
    setConflictModal({
      isOpen: false,
      currentShop: null,
      newShop: null,
      pendingProduct: null,
      pendingQuantity: 1,
      message: '',
    });
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      const res = await api.put(`/cart/items/${itemId}`, { quantity: newQuantity });
      setCart(res.data);
    } catch (err) {
      alert(err.message || 'Failed to update item quantity');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      setCart(res.data);
    } catch (err) {
      alert(err.message || 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      const res = await api.delete('/cart/clear');
      setCart(res.data);
    } catch (err) {
      alert(err.message || 'Failed to clear cart');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        totalItems: cart?.totalItems || 0,
        subtotal: cart?.subtotal || 0,
        deliveryFee: cart?.deliveryFee || 0,
        totalAmount: cart?.totalAmount || 0,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        fetchCart,
        conflictModal,
        confirmSwitchShop,
        cancelSwitchShop,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
