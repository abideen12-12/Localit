import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/customer/ProfilePage';
import ShopListingPage from './pages/customer/ShopListingPage';
import ShopProfilePage from './pages/owner/ShopProfilePage';
import AdminShopsPage from './pages/admin/AdminShopsPage';
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

          {/* Customer Protected Routes */}
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

          {/* Admin Protected Routes */}
          <Route
            path="admin/shops"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminShopsPage />
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
