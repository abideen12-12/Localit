import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/customer/ProfilePage';
import ShopListingPage from './pages/customer/ShopListingPage';
import ShopDetailPage from './pages/customer/ShopDetailPage';
import GlobalSearchPage from './pages/customer/GlobalSearchPage';
import ShopProfilePage from './pages/owner/ShopProfilePage';
import ProductManagementPage from './pages/owner/ProductManagementPage';
import AdminShopsPage from './pages/admin/AdminShopsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Public Routes */}
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="shops" element={<ShopListingPage />} />
          <Route path="shops/:id" element={<ShopDetailPage />} />
          <Route path="search" element={<GlobalSearchPage />} />

          {/* Customer / All Authenticated Users */}
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
            path="admin/shops"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminShopsPage />
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

          {/* 404 catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
