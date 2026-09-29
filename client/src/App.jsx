import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/customer/ProfilePage';
import ShopListingPage from './pages/customer/ShopListingPage';
import ShopDetailPage from './pages/customer/ShopDetailPage';
import GlobalSearchPage from './pages/customer/GlobalSearchPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderSuccessPage from './pages/customer/OrderSuccessPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import OrderHistoryPage from './pages/customer/OrderHistoryPage';
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import OwnerOrdersPage from './pages/owner/OwnerOrdersPage';
import ShopProfilePage from './pages/owner/ShopProfilePage';
import ProductManagementPage from './pages/owner/ProductManagementPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminShopsPage from './pages/admin/AdminShopsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import MultiShopConflictModal from './components/cart/MultiShopConflictModal';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MultiShopConflictModal />
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Public Routes */}
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="shops" element={<ShopListingPage />} />
            <Route path="shops/:id" element={<ShopDetailPage />} />
            <Route path="search" element={<GlobalSearchPage />} />

            {/* Customer Routes */}
            <Route
              path="cart"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER', 'SHOP_OWNER', 'ADMIN']}>
                  <CartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="checkout"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER', 'SHOP_OWNER', 'ADMIN']}>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="orders"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER', 'SHOP_OWNER', 'ADMIN']}>
                  <OrderHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="orders/:id"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER', 'SHOP_OWNER', 'ADMIN']}>
                  <OrderTrackingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="orders/:id/success"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER', 'SHOP_OWNER', 'ADMIN']}>
                  <OrderSuccessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER', 'SHOP_OWNER', 'ADMIN']}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Shop Owner Protected Routes */}
            <Route
              path="owner/dashboard"
              element={
                <ProtectedRoute allowedRoles={['SHOP_OWNER']}>
                  <OwnerDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="owner/orders"
              element={
                <ProtectedRoute allowedRoles={['SHOP_OWNER']}>
                  <OwnerOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="owner/shop"
              element={
                <ProtectedRoute allowedRoles={['SHOP_OWNER']}>
                  <ShopProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="owner/products"
              element={
                <ProtectedRoute allowedRoles={['SHOP_OWNER']}>
                  <ProductManagementPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/shops"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminShopsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/orders"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/categories"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminCategoriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/coupons"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminCouponsPage />
                </ProtectedRoute>
              }
            />

            {/* 404 catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
