import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { ManagedProductItem, PriceSource, AdminProductConfig } from '../../types';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminStats } from '../../components/admin/AdminStats';
import { AdminProductRow } from '../../components/admin/AdminProductRow';
import { AdminProductCard } from '../../components/admin/AdminProductCard';
import {
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowUpDown,
  Info,
  Save,
  Check,
} from 'lucide-react';
import { BrandPattern } from '../../components/brand/BrandPattern';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ManagedProductItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'gold' | 'coin' | 'global' | 'removed' | 'pending' | 'manual'
  >('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Authentication check
  useEffect(() => {
    if (!adminService.isAuthenticated()) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  // Load products data
  const loadProducts = useCallback(() => {
    const list = adminService.getManagedProducts();
    setProducts(list);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Trigger Toast
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handle individual product save
  const handleSaveProduct = (
    id: string,
    updates: {
      isVisible: boolean;
      isPricePending: boolean;
      priceSource: PriceSource;
      manualOverride: boolean;
      manualBuyPrice: number;
      manualSellPrice: number;
    }
  ) => {
    adminService.updateProductConfig(id, updates);
    loadProducts();
    showToast(`تنظیمات نماد با موفقیت ذخیره و در سایت اعمال شد.`);
  };

  // Handle individual product reset
  const handleResetProduct = (id: string) => {
    const stored = adminService.getStoredConfigs();
    delete stored[id];
    adminService.saveStoredConfigs(stored);
    loadProducts();
    showToast(`نماد به نرخ پایه بازار بازنشانی گردید.`);
  };

  // Handle Reset All
  const handleConfirmResetAll = () => {
    adminService.resetAllToDefault();
    loadProducts();
    setShowResetConfirm(false);
    showToast('تمامی قیمت‌ها و وضعیت نمایش به حالت پیش‌فرض اولیه بازگردانده شدند.');
  };

  // Computed statistics
  const stats = useMemo(() => {
    const total = products.length;
    const removed = products.filter((p) => !p.isVisible).length;
    const pending = products.filter((p) => p.isVisible && p.isPricePending).length;
    const manual = products.filter((p) => p.manualOverride || p.priceSource === 'manual').length;
    return { total, removed, pending, manual };
  }, [products]);

  // Filter and search
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Tab filter
      if (activeFilter === 'gold' && item.category !== 'gold') return false;
      if (activeFilter === 'coin' && item.category !== 'coin') return false;
      if (activeFilter === 'global' && item.category !== 'global') return false;
      if (activeFilter === 'removed' && item.isVisible) return false;
      if (activeFilter === 'pending' && (!item.isPricePending || !item.isVisible)) return false;
      if (activeFilter === 'manual' && !(item.manualOverride || item.priceSource === 'manual'))
        return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesPurity = item.purity ? item.purity.includes(query) : false;
        const matchesId = item.id.toLowerCase().includes(query);
        return matchesName || matchesPurity || matchesId;
      }

      return true;
    });
  }, [products, activeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#000814] text-slate-100 pb-16 relative">
      {/* Background geometric pattern */}
      <BrandPattern opacity={0.06} />

      {/* Admin Navigation Header */}
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6 relative z-10">
        {/* Toast Alert Banner */}
        {toastMessage && (
          <div className="sticky top-24 z-50 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 backdrop-blur-lg shadow-2xl flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-400 hover:text-emerald-200 text-xs font-bold px-2 py-1 cursor-pointer"
            >
              بستن
            </button>
          </div>
        )}

        {/* Overview Stats */}
        <AdminStats
          totalCount={stats.total}
          removedCount={stats.removed}
          pendingCount={stats.pending}
          manualOverrideCount={stats.manual}
        />

        {/* Future Backend & Architecture Notice */}
        <div className="p-4 rounded-2xl bg-[#001D3D]/60 border border-[#003566] text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#12366F]/50 text-[#FFD60A] shrink-0">
              <Info size={18} />
            </div>
            <div>
              <span className="font-bold text-white block">
                پنل مدیریت نرخ‌ها و وضعیت انتشار:
              </span>
              <span className="text-slate-400 text-[11px]">
                تغییرات شما در قیمت‌گذاری دستی، حالت «در انتظار بهروزرسانی» و «حذف از سایت» بلافاصله در وب‌سایت اعمال می‌شوند.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>بازنشانی کل نمادها</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#001D3D]/90 border border-[#003566] rounded-2xl p-4 space-y-4 shadow-lg">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی نماد (نام، عیار، کد ID)..."
                className="w-full bg-[#000814] border border-[#003566] focus:border-[#FFC300] rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 outline-none transition-all"
              />
              <Search
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-[#000814] p-1.5 rounded-xl border border-[#003566]">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-[#12366F] text-[#FFD60A] shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                همه ({products.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('gold')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === 'gold'
                    ? 'bg-[#12366F] text-[#FFD60A] shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                طلا ({products.filter((p) => p.category === 'gold').length})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('coin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === 'coin'
                    ? 'bg-[#12366F] text-[#FFD60A] shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                سکه ({products.filter((p) => p.category === 'coin').length})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === 'pending'
                    ? 'bg-amber-600/30 text-amber-300 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                در انتظار بهروزرسانی ({stats.pending})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('removed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === 'removed'
                    ? 'bg-rose-600/30 text-rose-300 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                حذف‌شده از سایت ({stats.removed})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('manual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === 'manual'
                    ? 'bg-[#12366F] text-[#FFD60A] shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                دستی ({stats.manual})
              </button>
            </div>
          </div>
        </div>

        {/* Desktop & Tablet Table View */}
        <div className="hidden md:block bg-[#001D3D]/90 border border-[#003566] rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#000814]/90 border-b border-[#003566] text-xs font-bold text-slate-400">
                  <th className="py-4 px-5">عنوان و مشخصات نماد</th>
                  <th className="py-4 px-4 text-center">حذف از سایت</th>
                  <th className="py-4 px-4 text-center">وضعیت نرخ</th>
                  <th className="py-4 px-4 text-center">حالت نرخ‌گذاری</th>
                  <th className="py-4 px-4">قیمت خرید</th>
                  <th className="py-4 px-4">قیمت فروش</th>
                  <th className="py-4 px-5 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#003566]/40 text-sm">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                      هیچ نمادی با فیلتر انتخابی یافت نشد.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((item) => (
                    <AdminProductRow
                      key={item.id}
                      item={item}
                      onSave={handleSaveProduct}
                      onReset={handleResetProduct}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards List View */}
        <div className="md:hidden space-y-3.5">
          {filteredProducts.length === 0 ? (
            <div className="bg-[#001D3D] p-8 rounded-2xl text-center text-slate-400 text-sm border border-[#003566]">
              هیچ نمادی یافت نشد.
            </div>
          ) : (
            filteredProducts.map((item) => (
              <AdminProductCard
                key={item.id}
                item={item}
                onSave={handleSaveProduct}
                onReset={handleResetProduct}
              />
            ))
          )}
        </div>
      </main>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#001D3D] border border-rose-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-right">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">
                  بازنشانی کلی به نرخ‌های پایه بازار
                </h3>
                <span className="text-xs text-rose-300">
                  این عملیات تمام قیمت‌های دستی و فیلترهای مخفی‌سازی را لغو می‌کند.
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              آیا از بازگردانی تمامی محصولات و نرخ‌ها به مقادیر اولیه سیستم اطمینان دارید؟
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#003566]">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-[#000814] hover:bg-[#003566] text-slate-300 hover:text-white border border-[#003566] text-xs font-bold transition-all cursor-pointer"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={handleConfirmResetAll}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold transition-all shadow-md cursor-pointer"
              >
                تایید بازنشانی همه
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
