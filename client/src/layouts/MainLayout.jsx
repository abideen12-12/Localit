import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../services/api';

export default function MainLayout() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    // Check backend health on mount
    api.get('/health')
      .then((data) => setHealth(data))
      .catch((err) => {
        console.warn('API connection check failed:', err.message);
        setHealth({ status: 'OFFLINE', services: { server: 'offline', database: 'disconnected' } });
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Navbar healthStatus={health} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet context={{ health }} />
      </main>
      <Footer />
    </div>
  );
}
