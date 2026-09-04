import React from 'react';
import { PriceItem } from '../../types';
import {
  formatToman,
  formatUSD,
  formatChangeAmount,
  formatMarketUpdateTime,
  PENDING_PRICE_TEXT,
  PENDING_UPDATE_TEXT,
} from '../../utils/formatters';
import { TrendBadge } from '../common/Badge';
import { Clock, RefreshCw } from 'lucide-react';

interface PriceCardProps {
  item: PriceItem;
  highlight?: boolean;
}

export const PriceCard: React.FC<PriceCardProps> = ({ item, highlight = false }) => {
  const isGlobal = item.category === 'global';
  const isOverallPending = Boolean(
    item.isPricePending || (!item.buyPrice && !item.sellPrice)
  );

  const isBuyAvailable = item.isBuyActive !== false && item.buyPrice !== null && item.buyPrice > 0;
  const isSellAvailable = item.isSellActive !== false && item.sellPrice !== null && item.sellPrice > 0;

  return (
    <div
      className={`relative rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between group ${
        highlight
          ? 'bg-gradient-to-b from-[#001D3D] to-[#000814] border-[#FFC300]/40 shadow-[0_4px_20px_-2px_rgba(255,195,0,0.15)] hover:border-[#FFD60A]'
          : 'bg-[#001D3D]/70 hover:bg-[#001D3D] border-[#003566] hover:border-[#FFC300]/40'
      }`}
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-extrabold text-white group-hover:text-[#FFD60A] transition-colors">
              {item.name}
            </h4>
            {isOverallPending && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#12366F] text-[#FFD60A] border border-[#FFC300]/30 animate-pulse">
                مهم
              </span>
            )}
          </div>
          {isOverallPending ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
              <RefreshCw size={11} className="animate-spin" />
              <span>{PENDING_PRICE_TEXT}</span>
            </span>
          ) : (
            <TrendBadge direction={item.direction} percentage={item.changePercentage} />
          )}
        </div>

        {/* Sell / Buy Prices */}
        <div className="space-y-2.5 my-4 bg-[#000814]/60 rounded-xl p-3 border border-[#003566]/60">
          {isOverallPending && !isBuyAvailable && !isSellAvailable ? (
            <div className="py-2.5 text-center space-y-1.5">
              <span className="text-xs text-amber-300/80 block font-medium">نرخ لحظه‌ای معامله:</span>
              <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-extrabold text-sm w-full">
                <Clock size={15} className="text-amber-400 shrink-0" />
                <span>{PENDING_PRICE_TEXT}</span>
              </div>
            </div>
          ) : (
            <>
              {/* Sell Price */}
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400 font-medium">قیمت فروش:</span>
                {isSellAvailable ? (
                  <span className="text-lg font-black text-white tracking-tight">
                    {isGlobal ? formatUSD(item.sellPrice) : formatToman(item.sellPrice)}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {PENDING_PRICE_TEXT}
                  </span>
                )}
              </div>

              {/* Buy Price */}
              <div className="flex items-baseline justify-between text-xs text-slate-400">
                <span>قیمت خرید:</span>
                {isBuyAvailable ? (
                  <span className="font-bold text-slate-300">
                    {isGlobal ? formatUSD(item.buyPrice) : formatToman(item.buyPrice)}
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-300/90">
                    {PENDING_PRICE_TEXT}
                  </span>
                )}
              </div>

              {/* Change Amount */}
              <div className="flex items-baseline justify-between text-xs pt-1.5 border-t border-[#003566]/40">
                <span className="text-slate-400">تغییر روزانه:</span>
                {item.changeAmount !== 0 ? (
                  <span
                    className={`font-semibold tabular-nums ${
                      item.direction === 'up'
                        ? 'text-emerald-400'
                        : item.direction === 'down'
                        ? 'text-rose-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {formatChangeAmount(item.changeAmount, item.unit)}
                  </span>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Standardized Bottom Footer */}
      <div className="pt-2 border-t border-[#003566]/50 flex items-center gap-1.5 text-[11px] text-slate-400">
        <Clock size={12} className="text-slate-500 shrink-0" />
        <span>آخرین به‌روزرسانی: {formatMarketUpdateTime(item.updatedAt)}</span>
      </div>
    </div>
  );
};

