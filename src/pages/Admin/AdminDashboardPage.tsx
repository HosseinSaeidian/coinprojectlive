import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, PRICE_UPDATE_EVENT } from '../../services/adminService';
import { priceService } from '../../services/priceService';
import { ManagedProductItem, ProductServerConfig } from '../../types';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminStats } from '../../components/admin/AdminStats';
import { AdminProductRow } from '../../components/admin/AdminProductRow';
import { AdminProductCard } from '../../components/admin/AdminProductCard';
import { toPersianDigits } from '../../utils/formatters';
import {
  Search,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Info,
  Save,
  Loader2,
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
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [isResettingAll, setIsResettingAll] = useState<boolean>(false);

  // Track dirty changes across rows: { [productId]: draft }
  const [dirtyProducts, setDirtyProducts] = useState<Record<string, Partial<ProductServerConfig>>>({});
  const [isSavingAll, setIsSavingAll] = useState<boolean>(false);
  const [justSavedAll, setJustSavedAll] = useState<boolean>(false);

  // Authentication check
  useEffect(() => {
    if (!adminService.isAuthenticated()) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  // Load products data
  const loadProducts = useCallback(async () => {
    try {
      const state = await priceService.fetchCurrentState();
      setProducts(adminService.getManagedProducts(state));
    } catch (err) {
      console.error('Failed to load products for admin:', err);
      setProducts(adminService.getManagedProducts());
    }
  }, []);

  useEffect(() => {
    loadProducts();

    const handleUpdate = () => {
      loadProducts();
    };

    window.addEventListener(PRICE_UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(PRICE_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadProducts]);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Track dirty changes from row/card components
  const handleDirtyChange = useCallback(
    (id: string, isDirty: boolean, draft: Partial<ProductServerConfig>) => {
      setDirtyProducts((prev) => {
        if (isDirty) {
          return { ...prev, [id]: draft };
        } else {
          if (!(id in prev)) return prev;
          const copy = { ...prev };
          delete copy[id];
          return copy;
        }
      });
    },
    []
  );

  // Handle single row save
  const handleSaveRow = async (
    id: string,
    updates: Partial<ProductServerConfig>
  ): Promise<boolean> => {
    try {
      await adminService.saveProductConfig(id, updates);

      // Clear from dirtyProducts map
      setDirtyProducts((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });

      await loadProducts();

      if (updates.isVisible === false) {
        showToast('نماد از وب‌سایت حذف شد و به بخش «حذف‌شده از سایت» منتقل گردید.', 'success');
      } else {
        showToast('تنظیمات نماد با موفقیت ذخیره شد.', 'success');
      }
      return true;
    } catch (err: any) {
      showToast(`خطا در ذخیره نماد: ${err?.message || 'مشکل در برقراری ارتباط با سرور'}`, 'error');
      return false;
    }
  };

  // Handle Save All Dirty Products
  const dirtyCount = Object.keys(dirtyProducts).length;

  const handleSaveAll = async () => {
    if (dirtyCount === 0 || isSavingAll) return;

    setIsSavingAll(true);
    const failedIds: string[] = [];
    const succeededIds: string[] = [];

    for (const [id, draft] of Object.entries(dirtyProducts)) {
      try {
        await adminService.saveProductConfig(id, draft);
        succeededIds.push(id);
      } catch (err) {
        console.error(`Error saving product ${id}:`, err);
        failedIds.push(id);
      }
    }

    // Clear dirty state for succeeded products only
    setDirtyProducts((prev) => {
      const copy = { ...prev };
      succeededIds.forEach((id) => delete copy[id]);
      return copy;
    });

    await loadProducts();
    setIsSavingAll(false);

    if (failedIds.length === 0) {
      setJustSavedAll(true);
      setTimeout(() => setJustSavedAll(false), 3000);
      showToast(`تغییرات تمامی ${toPersianDigits(succeededIds.length)} نماد با موفقیت ذخیره شد.`, 'success');
    } else {
      showToast(
        `تغییرات ${toPersianDigits(succeededIds.length)} نماد ذخیره شد، اما ${toPersianDigits(
          failedIds.length
        )} نماد با خطا مواجه شدند.`,
        'error'
      );
    }
  };

  // Handle Reset All to system defaults
  const handleConfirmResetAll = async () => {
    try {
      setIsResettingAll(true);
      await adminService.resetAllToDefault();
      setDirtyProducts({});
      await loadProducts();
      setShowResetConfirm(false);
      showToast('تمامی نمادها به نرخ‌های پایه و وضعیت پیش‌فرض اولیه بازنشانی شدند.', 'success');
    } catch (err: any) {
      showToast(`خطا در بازنشانی نمادها: ${err?.message || 'مشکل ارتباطی با سرور'}`, 'error');
    } finally {
      setIsResettingAll(false);
    }
  };

  // Statistics calculation
  const stats = useMemo(() => {
    const total = products.length;
    const removed = products.filter((p) => !p.isVisible).length;
    const active = products.filter((p) => p.isVisible).length;
    const activeGold = products.filter((p) => p.isVisible && p.category === 'gold').length;
    const activeCoin = products.filter((p) => p.isVisible && p.category === 'coin').length;
    const pending = products.filter((p) => p.isVisible && p.isPricePending).length;
    const manual = products.filter(
      (p) => p.isVisible && (p.priceMode === 'manual' || p.manualOverride)
    ).length;
    return { total, active, removed, pending, manual, activeGold, activeCoin };
  }, [products]);

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // 1. Separation between removed coins and active coins/categories
      if (activeFilter === 'removed') {
        // "حذف شده از سایت" section: strictly only removed/hidden items
        if (item.isVisible) return false;
      } else {
        // Normal active lists: strictly only active/visible items (must NOT appear here if removed)
        if (!item.isVisible) return false;

        // Specific category/status filtering within active items
        if (activeFilter === 'gold' && item.category !== 'gold') return false;
        if (activeFilter === 'coin' && item.category !== 'coin') return false;
        if (activeFilter === 'global' && item.category !== 'global') return false;
        if (activeFilter === 'pending' && !item.isPricePending) return false;
        if (activeFilter === 'manual' && !(item.priceMode === 'manual' || item.manualOverride))
          return false;
      }

      // 2. Search filter (name, purity, ID)
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
      <BrandPattern opacity={0.06} />

      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6 relative z-10">
        {/* Toast Alert Banner */}
        {toastMessage && (
          <div
            className={`sticky top-24 z-50 p-4 rounded-2xl border backdrop-blur-lg shadow-2xl flex items-center justify-between animate-fade-in ${
              toastType === 'success'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-500/20 border-rose-500/50 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {toastType === 'success' ? (
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle size={20} className="text-rose-400 shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-xs font-bold px-2 py-1 cursor-pointer opacity-70 hover:opacity-100"
            >
              بستن
            </button>
          </div>
        )}

        {/* Global Save All Banner & Reset Bar */}
        <div className="p-4 rounded-2xl bg-[#001D3D]/90 border border-[#003566] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#12366F]/60 text-[#FFD60A] shrink-0">
              <Info size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-white text-sm sm:text-base">
                  مدیریت و قیمت‌گذاری نمادها
                </h2>
                {dirtyCount > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FFC300] text-[#000814]">
                    {toPersianDigits(dirtyCount)} تغییر ذخیره‌نشده
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تغییرات در حالت وب‌سرویس + اصلاحیه یا دستی به صورت تفکیک‌شده در پایگاه‌داده ذخیره
                می‌شوند.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
            {/* Save All Changes Button */}
            <button
              type="button"
              disabled={dirtyCount === 0 || isSavingAll}
              onClick={handleSaveAll}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-md ${
                justSavedAll
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : dirtyCount > 0
                  ? 'bg-gradient-to-r from-[#FFC300] to-[#FFD60A] text-[#000814] hover:brightness-110 shadow-[0_4px_15px_rgba(255,195,0,0.3)] animate-pulse'
                  : 'opacity-40 bg-[#000814] text-slate-500 border border-[#003566] cursor-not-allowed'
              }`}
              title={
                dirtyCount > 0
                  ? `ذخیره ${toPersianDigits(dirtyCount)} تغییر در سرور`
                  : 'هیچ تغییری برای ذخیره وجود ندارد'
              }
            >
              {isSavingAll ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>در حال ذخیره همه...</span>
                </>
              ) : justSavedAll ? (
                <>
                  <Check size={16} />
                  <span>همه تغییرات ذخیره شد</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>ذخیره تمام تغییرات</span>
                  {dirtyCount > 0 && (
                    <span className="bg-[#000814] text-[#FFD60A] text-[10px] px-1.5 py-0.5 rounded-md font-mono">
                      {toPersianDigits(dirtyCount)}
                    </span>
                  )}
                </>
              )}
            </button>

            {/* Reset All to System Defaults */}
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>بازنشانی کل نمادها</span>
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <AdminStats
          totalCount={stats.total}
          removedCount={stats.removed}
          pendingCount={stats.pending}
          manualOverrideCount={stats.manual}
          activeFilter={activeFilter}
          onSelectFilter={(filter) => setActiveFilter(filter)}
        />

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
                className="w-full bg-[#000814] border border-[#003566] focus:border-[#FFC300] rounded-xl pr-10 pl-4 py-2 text-xs sm:text-sm text-white placeholder-slate-400 outline-none transition-all"
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
                همه ({toPersianDigits(stats.active)})
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
                طلا ({toPersianDigits(stats.activeGold)})
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
                سکه ({toPersianDigits(stats.activeCoin)})
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
                در انتظار به‌روزرسانی ({toPersianDigits(stats.pending)})
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
                حذف‌شده از سایت ({toPersianDigits(stats.removed)})
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
                دستی ({toPersianDigits(stats.manual)})
              </button>
            </div>
          </div>
        </div>

        {/* Desktop & Tablet Table View */}
        <div className="hidden md:block bg-[#001D3D]/90 border border-[#003566] rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                {/* Level 1 Table Header */}
                <tr className="bg-[#000814]/90 border-b border-[#003566] text-xs font-bold text-slate-300">
                  <th rowSpan={2} className="py-3 px-4 w-52">
                    محصول
                  </th>
                  <th rowSpan={2} className="py-3 px-3 text-center w-28">
                    نمایش
                  </th>
                  <th rowSpan={2} className="py-3 px-3 text-center w-36">
                    حالت نرخ
                  </th>
                  <th
                    colSpan={3}
                    className="py-2 px-2 text-center bg-[#001D3D]/40 border-x border-[#003566] text-[#FFC300]"
                  >
                    قیمت خرید (ورودی شما به بازار)
                  </th>
                  <th
                    colSpan={3}
                    className="py-2 px-2 text-center bg-[#001D3D]/60 border-x border-[#003566] text-[#FFD60A]"
                  >
                    قیمت فروش (خروج مشتری)
                  </th>
                  <th rowSpan={2} className="py-3 px-4 text-center w-24">
                    عملیات
                  </th>
                </tr>
                {/* Level 2 Table Sub-headers */}
                <tr className="bg-[#000814]/80 border-b border-[#003566] text-[11px] font-semibold text-slate-400">
                  <th className="py-1.5 px-2 text-center bg-[#001D3D]/40 border-r border-[#003566]">
                    پایه (API)
                  </th>
                  <th className="py-1.5 px-2 text-center bg-[#001D3D]/40">اصلاح / دستی</th>
                  <th className="py-1.5 px-2 text-center bg-[#001D3D]/40 border-l border-[#003566]">
                    نهایی
                  </th>
                  <th className="py-1.5 px-2 text-center bg-[#001D3D]/60 border-r border-[#003566]">
                    پایه (API)
                  </th>
                  <th className="py-1.5 px-2 text-center bg-[#001D3D]/60">اصلاح / دستی</th>
                  <th className="py-1.5 px-2 text-center bg-[#001D3D]/60 border-l border-[#003566]">
                    نهایی
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#003566]/40 text-sm">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-slate-400 text-sm">
                      هیچ نمادی با فیلتر انتخابی یافت نشد.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((item) => (
                    <AdminProductRow
                      key={item.id}
                      item={item}
                      onSaveRow={handleSaveRow}
                      onDirtyChange={handleDirtyChange}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards List View */}
        <div className="md:hidden space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="bg-[#001D3D] p-8 rounded-2xl text-center text-slate-400 text-sm border border-[#003566]">
              هیچ نمادی با فیلتر انتخابی یافت نشد.
            </div>
          ) : (
            filteredProducts.map((item) => (
              <AdminProductCard
                key={item.id}
                item={item}
                onSaveRow={handleSaveRow}
                onDirtyChange={handleDirtyChange}
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
                  این عملیات تمام قیمت‌های دستی و تنظیمات اصلاحیه را لغو می‌کند.
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              آیا از بازگردانی تمامی محصولات و نرخ‌ها به مقادیر اولیه وب‌سرویس و فعال‌سازی مجدد نمادهای
              حذف‌شده اطمینان دارید؟
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#003566]">
              <button
                type="button"
                disabled={isResettingAll}
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-[#000814] hover:bg-[#003566] text-slate-300 hover:text-white border border-[#003566] text-xs font-bold transition-all cursor-pointer"
              >
                انصراف
              </button>

              <button
                type="button"
                disabled={isResettingAll}
                onClick={handleConfirmResetAll}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                {isResettingAll && <Loader2 size={14} className="animate-spin" />}
                <span>تایید بازنشانی همه</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
