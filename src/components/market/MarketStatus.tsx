import React from 'react';
import { MarketStatusData } from '../../types';
import { isIranMarketOpen } from '../../services/marketService';

interface MarketStatusProps {
  status: MarketStatusData | null;
  lastUpdated: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  secondsLeft?: number;
}

export const MarketStatus: React.FC<MarketStatusProps> = ({
  status,
  lastUpdated,
}) => {
  const isOpen = status?.isOpen ?? isIranMarketOpen();

  return (
    <div
      className={`w-full bg-[#001D3D]/90 border rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-md transition-all ${
        isOpen ? 'border-[#003566]' : 'border-rose-900/60'
      }`}
      id="market-status-banner"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Market Status & Pulse */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center">
            {isOpen ? (
              <>
                <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_#10B981]" />
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 shadow-[0_0_8px_#F43F5E]" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                وضعیت بازار:
              </h3>
              <span
                className={`text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full border ${
                  isOpen
                    ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30'
                    : 'text-rose-400 bg-rose-950/60 border-rose-500/30'
                }`}
              >
                {isOpen ? (status?.statusText || 'بازار فعال و نرخ‌ها برخط می‌باشند') : 'بازار بسته است'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isOpen ? (
                <>
                  حجم معاملات: <span className="text-slate-200 font-semibold">{status?.totalVolumeStatus || 'بالا'}</span> • مرجع: بازار طلا و جواهر تهران
                </>
              ) : (
                <>ساعات فعالیت بازار: ۱۰:۳۰ تا ۲۱:۰۰ به وقت ایران • مرجع: بازار طلا و جواهر تهران</>
              )}
            </p>
          </div>
        </div>

        {/* Last Update */}
        <div className="flex items-center self-stretch md:self-auto justify-start md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-[#003566]/60">
          <div className="text-right text-xs">
            <span className="text-slate-400 block text-[11px]">آخرین بروزرسانی:</span>
            <span className="text-slate-200 font-bold tabular-nums">
              {lastUpdated}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
