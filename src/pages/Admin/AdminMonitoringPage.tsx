import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PriceItem } from '../../types';
import { priceService, mapBackendStateToPriceItems } from '../../services/priceService';
import { PRICE_UPDATE_EVENT } from '../../services/adminService';
import {
  formatNumberWithCommas,
  getCurrentCycleTimeFormatted,
  getPersianDate,
  PENDING_PRICE_TEXT,
} from '../../utils/formatters';
import { FereshtehLogo } from '../../components/brand/FereshtehLogo';
import { BrandPattern } from '../../components/brand/BrandPattern';
import { TrendBadge } from '../../components/common/Badge';
import {
  Clock,
  Maximize2,
  Minimize2,
  RefreshCw,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Radio,
} from 'lucide-react';

/**
 * 7 Stable product IDs required for in-store showroom / window display monitoring.
 * Selection is strictly driven by stable internal IDs, NOT visible Persian titles.
 */
export const MONITORING_PRODUCT_IDS = [
  'coin-emami',
  'coin-bahar-azadi',
  'gold-mesghal',
  'gold-18k',
  'coin-nim',
  'coin-rob',
  'coin-gerami',
] as const;

const PRODUCT_SUBTITLES: Record<string, string> = {
  'coin-emami': 'تمام سکه طرح جدید (۸۶)',
  'coin-bahar-azadi': 'تمام سکه طرح قدیم',
  'gold-mesghal': 'مظنه طلا (۴.۶۰۸ گرم)',
  'gold-18k': 'هر گرم طلای ۱۸ عیار (۷۵۰)',
  'coin-nim': 'نیم سکه بهار آزادی',
  'coin-rob': 'ربع سکه بهار آزادی',
  'coin-gerami': 'سکه یک گرمی بانک مرکزی',
};

export const AdminMonitoringPage: React.FC = () => {
  const [items, setItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live Tehran Clock
  const [currentTime, setCurrentTime] = useState<string>(() => {
    try {
      return new Intl.DateTimeFormat('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(new Date());
    } catch {
      return '';
    }
  });

  const persianDate = getPersianDate();

  useEffect(() => {
    const clockTimer = setInterval(() => {
      try {
        setCurrentTime(
          new Intl.DateTimeFormat('fa-IR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }).format(new Date())
        );
      } catch {
        // Fallback
      }
    }, 1000);

    return () => clearInterval(clockTimer);
  }, []);

  // Fullscreen state listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request error:', err);
    }
  };

  /**
   * Centralized lightweight fetch from backend market state.
   * Uses GET /api/v1/market/state via priceService.fetchCurrentState().
   */
  const loadMonitoringData = useCallback(async (silent = false) => {
    try {
      if (silent) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Single centralized state request
      const backendState = await priceService.fetchCurrentState();
      const cycleFormatted = getCurrentCycleTimeFormatted(new Date());

      // Map with includeHidden = true to ensure all 7 catalog items are available
      const allPrices = mapBackendStateToPriceItems(backendState, cycleFormatted, true);

      // Select strictly by stable product IDs
      const selected = MONITORING_PRODUCT_IDS.map((id) =>
        allPrices.find((item) => item.id === id)
      ).filter(Boolean) as PriceItem[];

      setItems(selected);
      setLastRefreshTime(cycleFormatted);
    } catch (err: unknown) {
      console.error('Failed to load monitoring data:', err);
      setError('مشکل در دریافت اطلاعات زنده بازار');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Lifecycle: initial load, 30s polling, and admin price update event
  useEffect(() => {
    loadMonitoringData(false);

    // 30-second centralized polling
    const interval = setInterval(() => {
      loadMonitoringData(true);
    }, 30000);

    // Instant update when admin saves any product in the dashboard
    const handlePriceUpdate = () => {
      loadMonitoringData(true);
    };
    window.addEventListener(PRICE_UPDATE_EVENT, handlePriceUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener(PRICE_UPDATE_EVENT, handlePriceUpdate);
    };
  }, [loadMonitoringData]);

  // Split into Top 4 (Gold & Major Coins) and Bottom 3 (Fractional Coins) for balanced widescreen layout
  const topRowItems = items.slice(0, 4);
  const bottomRowItems = items.slice(4, 7);

  const renderProductCard = (item: PriceItem) => {
    const isPending = Boolean(
      item.isPricePending || (!item.buyPrice && !item.sellPrice)
    );
    const hasSell = item.sellPrice !== null && item.sellPrice > 0 && item.isSellActive !== false;
    const hasBuy = item.buyPrice !== null && item.buyPrice > 0 && item.isBuyActive !== false;
    const subtitle = PRODUCT_SUBTITLES[item.id] || '';

    return (
      <div
        key={item.id}
        className={`relative rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-4 xl:p-5 2xl:p-6 border transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-lg ${
          isPending
            ? 'bg-[#001022]/95 border-[#002244]/60 shadow-black/40'
            : 'bg-gradient-to-b from-[#001D3D] via-[#001732] to-[#000F22] border-[#003566] hover:border-[#FFC300]/60 shadow-[0_8px_30px_rgba(0,0,0,0.5)]'
        }`}
      >
        {/* Ambient Top Glow for active cards */}
        {!isPending && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-[#FFC300]/10 rounded-full blur-2xl pointer-events-none" />
        )}

        {/* Card Header: Product Name + Subtitle + Trend Badge */}
        <div className="relative z-10 mb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug">
                {item.name}
              </h2>
              {subtitle && (
                <span className="text-xs sm:text-sm font-semibold text-slate-400 block mt-0.5">
                  {subtitle}
                </span>
              )}
            </div>

            {!isPending && item.direction && item.direction !== 'neutral' && (
              <div className="shrink-0">
                <TrendBadge
                  direction={item.direction}
                  percentage={item.changePercentage}
                  size="md"
                />
              </div>
            )}
          </div>
        </div>

        {/* Card Body: Prices (Sell & Buy) or Pending State */}
        <div className="relative z-10 my-2">
          {isPending ? (
            <div className="py-6 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col items-center justify-center text-center space-y-2 min-h-[140px]">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300">
                <Clock size={20} className="animate-pulse" />
              </div>
              <span className="text-base sm:text-lg font-black text-amber-300">
                {PENDING_PRICE_TEXT}
              </span>
              <span className="text-[11px] text-amber-400/80 font-medium">
                به‌محض کشف نرخ، تابلو بروزرسانی می‌شود
              </span>
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3 rounded-2xl p-3 sm:p-3.5 xl:p-4 bg-[#000B1A]/70 border border-[#002B54]/80 shadow-inner">
              {/* Sell Price (فروش) - Prominent Display, Full Unclipped Value */}
              <div className="flex items-baseline justify-between gap-1.5 sm:gap-2">
                <span className="text-xs xl:text-sm font-bold text-amber-400/90 shrink-0 whitespace-nowrap select-none">
                  قیمت فروش:
                </span>
                <div className="flex items-baseline gap-1 sm:gap-1.5 shrink-0 justify-end">
                  {hasSell ? (
                    <>
                      <span className="text-2xl sm:text-3xl lg:text-[clamp(1.1rem,1.5vw,2.25rem)] min-[1800px]:text-4xl font-black text-[#FFD60A] tracking-tight tabular-nums whitespace-nowrap">
                        {formatNumberWithCommas(item.sellPrice)}
                      </span>
                      <span className="text-[11px] sm:text-xs xl:text-sm font-extrabold text-slate-400 shrink-0 whitespace-nowrap select-none">
                        تومان
                      </span>
                    </>
                  ) : (
                    <span className="text-xs sm:text-sm font-bold text-slate-500 whitespace-nowrap">عدم عرضه</span>
                  )}
                </div>
              </div>

              {/* Buy Price (خرید) - Full Unclipped Value */}
              <div className="pt-2 border-t border-[#002447] flex items-baseline justify-between gap-1.5 sm:gap-2">
                <span className="text-xs xl:text-sm font-semibold text-slate-400 shrink-0 whitespace-nowrap select-none">
                  قیمت خرید:
                </span>
                <div className="flex items-baseline gap-1 sm:gap-1.5 shrink-0 justify-end">
                  {hasBuy ? (
                    <>
                      <span className="text-base sm:text-lg lg:text-[clamp(0.875rem,1.1vw,1.25rem)] xl:text-lg font-bold text-slate-200 tracking-tight tabular-nums whitespace-nowrap">
                        {formatNumberWithCommas(item.buyPrice)}
                      </span>
                      <span className="text-[10px] sm:text-[11px] xl:text-xs font-medium text-slate-400 shrink-0 whitespace-nowrap select-none">
                        تومان
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">عدم خرید</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer: Update Time */}
        <div className="relative z-10 mt-3 pt-3 border-t border-[#002447]/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-slate-500 shrink-0" />
            <span>آخرین بروزرسانی: {item.updatedAt || 'امروز'}</span>
          </div>
          <span className="text-[10px] text-slate-400/80 font-medium">فرشته کوین</span>
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-[#000814] text-slate-100 flex flex-col justify-between selection:bg-[#FFC300] selection:text-[#000814] relative overflow-x-hidden"
      dir="rtl"
    >
      <BrandPattern opacity={0.05} />

      {/* Top Header Section */}
      <header className="relative z-20 bg-[#001D3D]/90 border-b border-[#003566] backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 shadow-xl">
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <FereshtehLogo size="md" showSubtitle={false} />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                    تابلوی قیمت لحظه‌ای طلا و سکه
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                    <Radio size={11} className="animate-pulse text-emerald-400" />
                    <span>زنده</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block mt-0.5">
                  نمایش زنده قیمت‌های منتخب بازار • ویترین فرشته کوین
                </p>
              </div>
            </div>

            {/* Mobile Date/Time */}
            <div className="text-left md:hidden">
              <div className="text-base font-black text-[#FFD60A] tabular-nums">
                {currentTime}
              </div>
            </div>
          </div>

          {/* Center/Right: Live Clock, Date, and Actions */}
          <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-end flex-wrap">
            {/* Live Tehran Clock & Persian Date */}
            <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-xl bg-[#000D1F] border border-[#003566]">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-300">{persianDate}</div>
                <div className="text-[11px] text-slate-400 font-medium">ساعت رسمی ایران</div>
              </div>
              <div className="h-7 w-[1px] bg-[#003566]" />
              <div className="text-xl sm:text-2xl font-black text-[#FFD60A] tracking-wider tabular-nums">
                {currentTime}
              </div>
            </div>

            {/* Refreshing indicator */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400">
              <RefreshCw
                size={13}
                className={`text-[#FFC300] ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>بروزرسانی خودکار هر ۳۰ ثانیه</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#12366F]/80 hover:bg-[#12366F] text-[#FFD60A] hover:text-white border border-[#FFC300]/40 text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer"
                title={isFullscreen ? 'خروج از تمام‌صفحه' : 'نمایش تمام‌صفحه'}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                <span className="hidden sm:inline">
                  {isFullscreen ? 'خروج از تمام‌صفحه' : 'نمایش تمام‌صفحه'}
                </span>
              </button>

              {/* Back to Admin Dashboard */}
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#000814]/80 hover:bg-[#000814] text-slate-300 hover:text-white border border-[#003566] text-xs sm:text-sm font-bold transition-all cursor-pointer"
                title="بازگشت به پنل مدیریت"
              >
                <ArrowRight size={15} />
                <span className="hidden sm:inline">پنل مدیریت</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Board Content */}
      <main className="relative z-10 flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col justify-center">
        {loading && items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-14 h-14 rounded-full border-4 border-[#FFC300]/30 border-t-[#FFD60A] animate-spin" />
            <p className="text-base font-bold text-slate-300 animate-pulse">
              در حال بارگذاری تابلوی مانیتورینگ ویترین...
            </p>
          </div>
        ) : error && items.length === 0 ? (
          <div className="p-8 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-center max-w-lg mx-auto space-y-3">
            <p className="text-rose-300 font-bold">{error}</p>
            <button
              onClick={() => loadMonitoringData(false)}
              className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-white font-bold text-sm cursor-pointer"
            >
              تلاش مجدد
            </button>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {/* Top Row: 4 Primary Benchmarks (Coin Emami, Bahar Azadi, Mesghal, 18k) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {topRowItems.map(renderProductCard)}
            </div>

            {/* Bottom Row: 3 Fractional Benchmarks (Nim, Rob, Gerami) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {bottomRowItems.map(renderProductCard)}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Info & Status Bar */}
      <footer className="relative z-20 bg-[#001226]/90 border-t border-[#002447] px-4 sm:px-6 lg:px-8 py-3 text-xs text-slate-400">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-center sm:text-right">
            <ShieldCheck size={15} className="text-[#FFC300] shrink-0" />
            <span>
              قیمت‌های مندرج در تابلو بر اساس آخرین استعلام و تاییدیه رسمی صنف طلا و جواهر می‌باشد.
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            {lastRefreshTime && (
              <span>آخرین چرخه دریافت: {lastRefreshTime}</span>
            )}
            <span className="hidden sm:inline">•</span>
            <span className="text-[#FFD60A]/80 font-bold">فرشته کوین</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
