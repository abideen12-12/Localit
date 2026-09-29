import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        {/* Placeholder routes that will be enriched in subsequent phases */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
