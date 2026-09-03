import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { MobileMenu } from './components/layout/MobileMenu';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/Home/HomePage';
import { AboutPage } from './pages/About/AboutPage';
import { ContactPage } from './pages/Contact/ContactPage';
import { AdminLoginPage } from './pages/Admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/Admin/AdminDashboardPage';
import { GoldCalculatorModal } from './components/market/GoldCalculatorModal';

function AppContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const location = useLocation();

  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
  const isAdminDashboard =
    normalizedPath === '/admin' ||
    (location.pathname.startsWith('/admin') && !location.pathname.startsWith('/admin/login'));

  return (
    <div className="min-h-screen bg-[#000814] text-slate-100 flex flex-col selection:bg-[#FFC300] selection:text-[#000814]">
      {/* Main Persian Header (Admin Dashboard has its own dedicated top bar) */}
      {!isAdminDashboard && (
        <Header
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
      )}

      {/* Mobile Navigation Drawer */}
      {!isAdminDashboard && (
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
        />
      )}

      {/* Main Content View with Routing */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/login/" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/" element={<AdminDashboardPage />} />
        </Routes>
      </main>

      {/* Global Gold Calculator Modal */}
      <GoldCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* Brand Footer */}
      {!isAdminDashboard && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
