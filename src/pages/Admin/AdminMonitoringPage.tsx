import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PriceItem, BackendMarketState } from '../../types';
import { priceService, mapBackendStateToPriceItems } from '../../services/priceService';
import { isIranMarketOpen } from '../../services/marketService';
import { getMarketState } from '../../services/apiClient';
import { PRICE_UPDATE_EVENT } from '../../services/adminService';
import {
  formatNumberWithCommas,
  getCurrentCycleTimeFormatted,
  getPersianDate,
  PENDING_PRICE_TEXT,
} from '../../utils/formatters';
import { FereshtehLogo } from '../../components/brand/FereshtehLogo';
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
 * Stable product IDs required for in-store showroom / window display monitoring.
 * ROW 1: 4 major coins (emami, bahar-azadi, nim, rob)
 * ROW 2: 1 fractional coin + 2 gold benchmarks (gerami, 18k, mesghal)
 * Selection and ordering are strictly driven by stable internal IDs, NOT visible Persian titles.
 */
export const MONITORING_ROW1_IDS = [
  'coin-emami',
  'coin-bahar-azadi',
  'coin-nim',
  'coin-rob',
] as const;

export const MONITORING_ROW2_IDS = [
  'coin-gerami',
  'gold-18k',
  'gold-mesghal',
] as const;

export const MONITORING_ROW3_IDS = [
  'silver-nadir-1000',
  'silver-emarati-1000',
] as const;

export const MONITORING_PRODUCT_IDS = [
  ...MONITORING_ROW1_IDS,
  ...MONITORING_ROW2_IDS,
  ...MONITORING_ROW3_IDS,
] as const;

const SILVER_API_IDS: Record<string, string> = {
  'silver-nadir-1000': 'a1985fec-0626-4c80-b6d8-5f30d32e725a',
  'silver-emarati-1000': 'a1181a60-ef56-4bf8-8660-10d53dbd0c2a',
};

const PRODUCT_SUBTITLES: Record<string, string> = {
  'coin-emami': 'تمام سکه طرح جدید (۸۶)',
  'coin-bahar-azadi': 'تمام سکه طرح قدیم',
  'gold-mesghal': 'مظنه طلا (۴.۶۰۸ گرم)',
  'gold-18k': 'هر گرم طلای ۱۸ عیار (۷۵۰)',
  'coin-nim': 'نیم سکه بهار آزادی',
  'coin-rob': 'ربع سکه بهار آزادی',
  'coin-gerami': 'سکه یک گرمی بانک مرکزی',
  'silver-nadir-1000': 'شمش نقره ۱۰۰۰ گرمی نادیر',
  'silver-emarati-1000': 'شمش نقره ۱۰۰۰ گرمی اماراتی',
};

export const AdminMonitoringPage: React.FC = () => {
  const [items, setItems] = useState<PriceItem[]>([]);
  const [apiTitles, setApiTitles] = useState<Record<string, string>>({});
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

  const getMonitoringPersianDate = (): string => {
    try {
      const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        timeZone: 'Asia/Tehran',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const parts = formatter.formatToParts(new Date());
      const weekday = parts.find((p) => p.type === 'weekday')?.value || '';
      const day = parts.find((p) => p.type === 'day')?.value || '';
      const month = parts.find((p) => p.type === 'month')?.value || '';
      const year = parts.find((p) => p.type === 'year')?.value || '';
      return `${weekday} ${day} ${month} ${year}`.trim();
    } catch {
      return getPersianDate();
    }
  };

  const [persianDate, setPersianDate] = useState<string>(() => getMonitoringPersianDate());

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
        setPersianDate(getMonitoringPersianDate());
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

      const isOpen = isIranMarketOpen();
      let backendState: BackendMarketState;

      if (isOpen) {
        backendState = await priceService.fetchCurrentState();
      } else {
        try {
          backendState = await getMarketState();
          priceService.setBackendState(backendState);
        } catch (err) {
          const cachedState = priceService.getCachedState();
          if (cachedState) {
            backendState = cachedState;
          } else {
            console.warn('[AdminMonitoringPage] Failed to fetch state in CLOSED and no cache available:', err);
            return;
          }
        }
      }

      const cycleFormatted = getCurrentCycleTimeFormatted(new Date());

      // Map with includeHidden = true to ensure all 7 catalog items are available
      const allPrices = mapBackendStateToPriceItems(backendState, cycleFormatted, true);

      // Select strictly by stable product IDs
      const selected = MONITORING_PRODUCT_IDS.map((id) =>
        allPrices.find((item) => item.id === id)
      ).filter(Boolean) as PriceItem[];

      // Resolve original API titles for silver products presentation metadata
      const rawItems = backendState.marketItems || [];
      const dynamicTitles: Record<string, string> = {};
      for (const [prodId, apiId] of Object.entries(SILVER_API_IDS)) {
        const found = rawItems.find(
          (raw) =>
            raw.id === apiId ||
            (raw.title &&
              (prodId === 'silver-nadir-1000'
                ? raw.title.includes('نادیر')
                : raw.title.includes('اماراتی')))
        );
        if (found?.title) {
          dynamicTitles[prodId] = found.title;
        }
      }
      setApiTitles(dynamicTitles);

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
      if (!isIranMarketOpen()) {
        return;
      }
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

  // Resolve products strictly by stable ID arrays
  // ROW 1: coin-emami, coin-bahar-azadi, coin-nim, coin-rob
  const row1Items = MONITORING_ROW1_IDS.map((id) =>
    items.find((item) => item.id === id)
  ).filter(Boolean) as PriceItem[];

  // ROW 2: coin-gerami, gold-18k, gold-mesghal (centered)
  const row2Items = MONITORING_ROW2_IDS.map((id) =>
    items.find((item) => item.id === id)
  ).filter(Boolean) as PriceItem[];

  // ROW 3: silver-nadir-1000, silver-emarati-1000 (centered)
  const row3Items = MONITORING_ROW3_IDS.map((id) =>
    items.find((item) => item.id === id)
  ).filter(Boolean) as PriceItem[];

  const renderProductCard = (item: PriceItem) => {
    const isPending = Boolean(
      item.isPricePending || (!item.buyPrice && !item.sellPrice)
    );
    const hasSell = item.sellPrice !== null && item.sellPrice > 0 && item.isSellActive !== false;
    const hasBuy = item.buyPrice !== null && item.buyPrice > 0 && item.isBuyActive !== false;
    const subtitle = apiTitles[item.id] || PRODUCT_SUBTITLES[item.id] || '';

    return (
      <div
        key={item.id}
        className={`relative rounded-2xl p-2.5 sm:p-3 lg:p-2 xl:p-2.5 2xl:p-3 border transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-lg h-full ${
          isPending
            ? 'bg-[#001022]/95 border-[#002244]/60 shadow-black/40'
            : 'bg-gradient-to-b from-[#001D3D] via-[#001732] to-[#000F22] border-[#003566] hover:border-[#FFC300]/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
        }`}
      >
        {/* Ambient Top Glow for active cards */}
        {!isPending && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-8 bg-[#FFC300]/10 rounded-full blur-xl pointer-events-none" />
        )}

        {/* Card Header: Product Name + Subtitle + Trend Badge */}
        <div className="relative z-10 mb-1 lg:mb-0.5 xl:mb-1">
          <div className="flex items-start justify-between gap-1.5 sm:gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-sm sm:text-base lg:text-sm xl:text-base 2xl:text-lg font-black text-white tracking-tight leading-tight truncate">
                {item.name}
              </h2>
              {subtitle && (
                <span className="text-[10px] sm:text-[11px] xl:text-xs font-semibold text-slate-400 block truncate mt-0.5">
                  {subtitle}
                </span>
              )}
            </div>

            {!isPending && item.direction && item.direction !== 'neutral' && (
              <div className="shrink-0 scale-90 sm:scale-95 lg:scale-85 xl:scale-95 2xl:scale-100 origin-top-left">
                <TrendBadge
                  direction={item.direction}
                  percentage={item.changePercentage}
                  size="sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Card Body: Prices (Sell & Buy) or Pending State - Aligned equal height */}
        <div className="relative z-10 my-0.5">
          {isPending ? (
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col items-center justify-center text-center h-[68px] sm:h-[72px] lg:h-[66px] xl:h-[72px] 2xl:h-[78px]">
              <div className="flex items-center gap-1.5 text-amber-300">
                <Clock size={14} className="animate-pulse shrink-0" />
                <span className="text-xs sm:text-sm font-black">
                  {PENDING_PRICE_TEXT}
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-amber-400/80 font-medium mt-0.5">
                به‌محض کشف نرخ، تابلو بروزرسانی می‌شود
              </span>
            </div>
          ) : (
            <div className="space-y-1 sm:space-y-1.5 rounded-xl p-1.5 sm:p-2 xl:p-2.5 bg-[#000B1A]/70 border border-[#002B54]/80 shadow-inner h-[68px] sm:h-[72px] lg:h-[66px] xl:h-[72px] 2xl:h-[78px] flex flex-col justify-center">
              {/* Sell Price (فروش) - Prominent Display, Full Unclipped Value */}
              <div className="flex items-baseline justify-between gap-1 sm:gap-2">
                <span className="text-[11px] sm:text-xs xl:text-sm font-bold text-amber-400/90 shrink-0 whitespace-nowrap select-none">
                  قیمت فروش:
                </span>
                <div className="flex items-baseline gap-1 shrink-0 justify-end">
                  {hasSell ? (
                    <>
                      <span className="text-base sm:text-lg lg:text-[clamp(1rem,1.15vw,1.35rem)] xl:text-lg 2xl:text-xl font-black text-[#2ba84a] tracking-tight tabular-nums whitespace-nowrap">
                        {formatNumberWithCommas(item.sellPrice)}
                      </span>
                      <span className="text-[10px] sm:text-[11px] xl:text-xs font-semibold text-slate-400 shrink-0 whitespace-nowrap select-none">
                        تومان
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 whitespace-nowrap">عدم عرضه</span>
                  )}
                </div>
              </div>

              {/* Buy Price (خرید) - Full Unclipped Value */}
              <div className="pt-0.5 sm:pt-1 border-t border-[#002447] flex items-baseline justify-between gap-1 sm:gap-2">
                <span className="text-[11px] sm:text-xs xl:text-sm font-bold text-slate-400 shrink-0 whitespace-nowrap select-none">
                  قیمت خرید:
                </span>
                <div className="flex items-baseline gap-1 shrink-0 justify-end">
                  {item.id === 'gold-18k' ? (
                    <span className="text-base sm:text-lg lg:text-[clamp(1rem,1.15vw,1.35rem)] xl:text-lg 2xl:text-xl font-black text-slate-400 select-none">
                      -
                    </span>
                  ) : hasBuy ? (
                    <>
                      <span className="text-base sm:text-lg lg:text-[clamp(1rem,1.15vw,1.35rem)] xl:text-lg 2xl:text-xl font-black text-[#d90429] tracking-tight tabular-nums whitespace-nowrap">
                        {formatNumberWithCommas(item.buyPrice)}
                      </span>
                      <span className="text-[10px] sm:text-[11px] xl:text-xs font-semibold text-slate-400 shrink-0 whitespace-nowrap select-none">
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
      </div>
    );
  };

  return (
    <div
      className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden bg-[#000814] text-slate-100 flex flex-col justify-between selection:bg-[#FFC300] selection:text-[#000814] relative overflow-x-hidden"
      dir="rtl"
    >
      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 pointer-events-none bg-cover bg-center bg-no-repeat opacity-[0.17]"
        style={{
          backgroundImage: "url('/public/patternback.png')",
        }}
        aria-hidden="true"
      />

      {/* Top Header Section - Compact */}
      <header className="relative z-20 bg-[#001D3D]/90 border-b border-[#003566] backdrop-blur-md px-3 sm:px-5 lg:px-6 xl:px-8 py-1.5 lg:py-2 shadow-lg shrink-0">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 md:gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <FereshtehLogo size="md" showSubtitle={true} />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg lg:text-xl font-black text-white tracking-tight">
                    تابلوی قیمت لحظه‌ای طلا و سکه
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                    <Radio size={10} className="animate-pulse text-emerald-400" />
                    <span>زنده</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden lg:block mt-0.5">
                  نمایش زنده نرخ طلا فرشته
                </p>
              </div>
            </div>

            {/* Mobile Date/Time */}
            <div className="text-left md:hidden">
              <div className="text-sm font-black text-[#FFD60A] tabular-nums">
                {currentTime}
              </div>
            </div>
          </div>

          {/* Center/Right: Live Clock, Date, and Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
            {/* Live Tehran Clock & Persian Date */}
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1 rounded-xl bg-[#000D1F] border border-[#003566]">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-300">{persianDate}</div>
                <div className="text-[10px] text-slate-400 font-medium">ساعت رسمی ایران</div>
              </div>
              <div className="h-6 w-[1px] bg-[#003566]" />
              <div className="text-lg lg:text-xl font-black text-[#FFD60A] tracking-wider tabular-nums">
                {currentTime}
              </div>
            </div>

            {/* Refreshing indicator */}
            <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-slate-400">
              <RefreshCw
                size={12}
                className={`text-[#FFC300] ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>بروزرسانی خودکار ۳۰ ثانیه</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#12366F]/80 hover:bg-[#12366F] text-[#FFD60A] hover:text-white border border-[#FFC300]/40 text-xs font-bold transition-all shadow-md cursor-pointer"
                title={isFullscreen ? 'خروج از تمام‌صفحه' : 'نمایش تمام‌صفحه'}
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                <span className="hidden sm:inline">
                  {isFullscreen ? 'خروج از تمام‌صفحه' : 'تمام‌صفحه'}
                </span>
              </button>

              {/* Back to Admin Dashboard */}
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#000814]/80 hover:bg-[#000814] text-slate-300 hover:text-white border border-[#003566] text-xs font-bold transition-all cursor-pointer"
                title="بازگشت به پنل مدیریت"
              >
                <ArrowRight size={14} />
                <span className="hidden sm:inline">پنل مدیریت</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Board Content - Centers perfectly inside available viewport space */}
      <main className="relative z-10 flex-1 max-w-[1800px] w-full mx-auto px-3 sm:px-5 lg:px-6 xl:px-8 py-2 sm:py-2.5 lg:py-1.5 xl:py-2 flex flex-col justify-start lg:justify-center min-h-0 overflow-y-auto lg:overflow-hidden">
        {loading && items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-[#FFC300]/30 border-t-[#FFD60A] animate-spin" />
            <p className="text-sm font-bold text-slate-300 animate-pulse">
              در حال بارگذاری تابلوی مانیتورینگ ویترین...
            </p>
          </div>
        ) : error && items.length === 0 ? (
          <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-center max-w-lg mx-auto space-y-3">
            <p className="text-rose-300 font-bold text-sm">{error}</p>
            <button
              onClick={() => loadMonitoringData(false)}
              className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-white font-bold text-xs cursor-pointer"
            >
              تلاش مجدد
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col justify-center gap-2 sm:gap-2.5 lg:gap-2 xl:gap-2.5 2xl:gap-3 my-auto">
            {/* ROW 1: 4 Cards (coin-emami, coin-bahar-azadi, coin-nim, coin-rob) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-2 xl:gap-2.5 2xl:gap-3">
              {row1Items.map(renderProductCard)}
            </div>

            {/* ROW 2: 3 Cards Centered (coin-gerami, gold-18k, gold-mesghal) */}
            <div className="flex flex-col sm:flex-row flex-wrap lg:flex-nowrap justify-center gap-2 sm:gap-2.5 lg:gap-2 xl:gap-2.5 2xl:gap-3 w-full">
              {row2Items.map((item) => (
                <div
                  key={item.id}
                  className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(25%-0.375rem)] xl:w-[calc(25%-0.46875rem)] 2xl:w-[calc(25%-0.5625rem)]"
                >
                  {renderProductCard(item)}
                </div>
              ))}
            </div>

            {/* ROW 3: 2 Cards Centered (silver-nadir-1000, silver-emarati-1000) */}
            <div className="flex flex-col sm:flex-row flex-wrap lg:flex-nowrap justify-center gap-2 sm:gap-2.5 lg:gap-2 xl:gap-2.5 2xl:gap-3 w-full">
              {row3Items.map((item) => (
                <div
                  key={item.id}
                  className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(25%-0.375rem)] xl:w-[calc(25%-0.46875rem)] 2xl:w-[calc(25%-0.5625rem)]"
                >
                  {renderProductCard(item)}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Info & Status Bar - Ultra Compact */}
      <footer className="relative z-20 bg-[#001226]/90 border-t border-[#002447] px-3 sm:px-5 lg:px-6 xl:px-8 py-1 lg:py-1.5 text-[11px] sm:text-xs text-slate-400 shrink-0">
        <div className="max-w-[1800px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-2 text-center sm:text-right">
            <ShieldCheck size={14} className="text-[#FFC300] shrink-0" />
            <span>
              قیمت‌های مندرج در تابلو بر اساس آخرین استعلام و تاییدیه رسمی صنف طلا و جواهر می‌باشد.
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] sm:text-[11px] text-slate-400">
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
