import React from 'react';
import { RefreshCw, Activity, ShieldCheck } from 'lucide-react';
import { MarketStatusData } from '../../types';
import { formatCountdownMinutes } from '../../utils/formatters';

interface MarketStatusProps {
  status: MarketStatusData | null;
  lastUpdated: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  secondsLeft: number;
}

export const MarketStatus: React.FC<MarketStatusProps> = ({
  status,
  lastUpdated,
  isRefreshing,
  onRefresh,
  secondsLeft,
}) => {
  const isOpen = status?.isOpen ?? true;

  return (
    <div
      className="w-full bg-[#001D3D]/90 border border-[#003566] rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-md transition-all"
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
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                وضعیت بازار:
              </h3>
              <span className="text-xs sm:text-sm font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                {status?.statusText || 'بازار فعال'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              حجم معاملات: <span className="text-slate-200 font-semibold">{status?.totalVolumeStatus || 'بالا'}</span> • مرجع: بازار طلا و جواهر تهران
            </p>
          </div>
        </div>

        {/* Refresh Timer & Manual Trigger */}
        <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-[#003566]/60">
          <div className="text-right text-xs">
            <span className="text-slate-400 block text-[11px]">آخرین بروزرسانی:</span>
            <span className="text-slate-200 font-bold tabular-nums">
              {lastUpdated}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[11px] text-slate-400 bg-[#000814] px-2 py-1 rounded-md border border-[#003566]">
              بروزرسانی خودکار در: <strong className="text-[#FFD60A] tabular-nums font-mono">{formatCountdownMinutes(secondsLeft)}</strong>
            </span>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#12366F] hover:bg-[#12366F]/80 text-[#FFD60A] border border-[#FFC300]/40 font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
              title="بروزرسانی دستی قیمت‌ها"
            >
              <RefreshCw
                size={14}
                className={isRefreshing ? 'animate-spin text-[#FFD60A]' : ''}
              />
              <span className="hidden xs:inline">بروزرسانی</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
