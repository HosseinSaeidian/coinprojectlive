import React from 'react';
import { MarketSummaryMetric } from '../../types';
import { formatNumberWithCommas, PENDING_UPDATE_TEXT } from '../../utils/formatters';
import { TrendBadge } from '../common/Badge';

interface MarketSummaryProps {
  metrics: MarketSummaryMetric[];
}

export const MarketSummary: React.FC<MarketSummaryProps> = ({ metrics }) => {
  const displayMetrics = metrics.filter(
    (item) => item.id !== 'sum-gold24' && !item.title.includes('۲۴') && !item.title.includes('24')
  );

  return (
    <div className="w-full bg-[#001D3D]/60 border border-[#003566] rounded-2xl p-5 shadow-lg" id="market-summary-section">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FFD60A] shadow-[0_0_8px_#FFD60A]" />
          خلاصه شاخص‌های کلیدی بازار
        </h3>
        <span className="text-xs text-slate-400">نمای سریع قیمت‌ها</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {displayMetrics.map((item) => (
          <div
            key={item.id}
            className="bg-[#000814]/80 border border-[#003566] hover:border-[#FFC300]/40 rounded-xl p-3.5 transition-all hover:bg-[#001D3D]/50 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-slate-200 truncate">
                  {item.title}
                </span>
                <TrendBadge
                  direction={item.direction}
                  percentage={item.changePercentage}
                  size="sm"
                />
              </div>
              {item.subTitle && (
                <span className="text-[10px] text-slate-400 block mb-2">
                  {item.subTitle}
                </span>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-[#003566]/60 flex items-baseline justify-between">
              {item.isPricePending ? (
                <span className="text-xs font-extrabold text-amber-300">
                  {PENDING_UPDATE_TEXT}
                </span>
              ) : (
                <>
                  <span className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                    {formatNumberWithCommas(item.value)}
                  </span>
                  <span className="text-[11px] text-[#FFD60A] font-medium mr-1">
                    {item.unit}
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
