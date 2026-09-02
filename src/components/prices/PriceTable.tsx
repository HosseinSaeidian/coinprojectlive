import React, { useState, useMemo } from 'react';
import { PriceItem } from '../../types';
import { SectionHeader } from '../common/SectionHeader';
import {
  formatToman,
  formatUSD,
  formatChangeAmount,
  PENDING_PRICE_TEXT,
  PENDING_UPDATE_TEXT,
} from '../../utils/formatters';
import { TrendBadge } from '../common/Badge';
import { Search } from 'lucide-react';

interface PriceTableProps {
  goldItems: PriceItem[];
  coinItems: PriceItem[];
}

export const PriceTable: React.FC<PriceTableProps> = ({ goldItems, coinItems }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'gold' | 'coin'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allItems = useMemo(() => [...goldItems, ...coinItems], [goldItems, coinItems]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Tab filter
      if (activeTab === 'gold' && item.category !== 'gold' && item.category !== 'global') {
        return false;
      }
      if (activeTab === 'coin' && item.category !== 'coin') {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          (item.purity && item.purity.includes(query)) ||
          item.id.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [allItems, activeTab, searchQuery]);

  return (
    <section className="py-8 scroll-mt-24" id="prices-section">
      <SectionHeader
        title="جدول جامع قیمت طلا و سکه"
        subtitle="بررسی تطبیقی نرخ خرید، فروش و نوسانات روزانه بازار در قالب جدول تخصصی"
        action={
          <div className="flex items-center gap-2">
            {/* Filter Tabs */}
            <div className="flex bg-[#001D3D] p-1 rounded-xl border border-[#003566]">
              <button
                onClick={() => setActiveTab('all')}
                type="button"
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[#12366F] text-[#FFD60A] shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                همه ({allItems.length})
              </button>
              <button
                onClick={() => setActiveTab('gold')}
                type="button"
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'gold'
                    ? 'bg-[#12366F] text-[#FFD60A] shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                طلا ({goldItems.length})
              </button>
              <button
                onClick={() => setActiveTab('coin')}
                type="button"
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'coin'
                    ? 'bg-[#12366F] text-[#FFD60A] shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                سکه ({coinItems.length})
              </button>
            </div>
          </div>
        }
      />

      {/* Search Filter Bar */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی نماد (مثال: سکه امامی، ۱۸ عیار، مثقال...)"
            className="w-full bg-[#001D3D]/90 border border-[#003566] focus:border-[#FFC300] rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 outline-none transition-all"
          />
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Desktop & Tablet Table */}
      <div className="hidden sm:block bg-[#001D3D]/80 border border-[#003566] rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-[#000814]/90 border-b border-[#003566] text-xs font-bold text-slate-400">
                <th className="py-4 px-6">عنوان نماد</th>
                <th className="py-4 px-6 text-left">قیمت خرید</th>
                <th className="py-4 px-6 text-left">قیمت فروش</th>
                <th className="py-4 px-6 text-left">تغییر</th>
                <th className="py-4 px-6 text-center">درصد تغییر</th>
                <th className="py-4 px-6 text-center">بروزرسانی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#003566]/40 text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-sm">
                    نمادی با این عنوان یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isGlobal = item.category === 'global';
                  const isBuyAvailable =
                    item.isBuyActive !== false && item.buyPrice !== null && item.buyPrice > 0;
                  const isSellAvailable =
                    item.isSellActive !== false && item.sellPrice !== null && item.sellPrice > 0;
                  const isPending = Boolean(item.isPricePending || (!isBuyAvailable && !isSellAvailable));

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#12366F]/20 transition-colors group"
                    >
                      {/* Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <span className="font-extrabold text-white group-hover:text-[#FFD60A] transition-colors">
                            {item.name}
                          </span>
                          {item.purity && (
                            <span className="text-[11px] text-slate-400 hidden lg:inline">
                              ({item.purity})
                            </span>
                          )}
                          {isPending && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#12366F] text-[#FFD60A] border border-[#FFC300]/30 animate-pulse">
                              مهم
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Buy Price */}
                      <td className="py-4 px-6 text-left font-semibold text-slate-300 tabular-nums">
                        {!isBuyAvailable ? (
                          <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 inline-block">
                            {PENDING_PRICE_TEXT}
                          </span>
                        ) : isGlobal ? (
                          formatUSD(item.buyPrice)
                        ) : (
                          formatToman(item.buyPrice)
                        )}
                      </td>

                      {/* Sell Price */}
                      <td className="py-4 px-6 text-left font-extrabold text-white text-base tabular-nums">
                        {!isSellAvailable ? (
                          <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 inline-block">
                            {PENDING_PRICE_TEXT}
                          </span>
                        ) : isGlobal ? (
                          formatUSD(item.sellPrice)
                        ) : (
                          formatToman(item.sellPrice)
                        )}
                      </td>

                      {/* Change Amount */}
                      <td className="py-4 px-6 text-left tabular-nums text-xs font-semibold">
                        {item.changeAmount !== 0 ? (
                          <span
                            className={
                              item.direction === 'up'
                                ? 'text-emerald-400'
                                : item.direction === 'down'
                                ? 'text-rose-400'
                                : 'text-slate-400'
                            }
                          >
                            {formatChangeAmount(item.changeAmount, item.unit)}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      {/* Change Percentage Badge */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center">
                          {isPending && item.changePercentage === 0 ? (
                            <span className="text-[10px] text-amber-300 font-bold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30">
                              {PENDING_PRICE_TEXT}
                            </span>
                          ) : (
                            <TrendBadge
                              direction={item.direction}
                              percentage={item.changePercentage}
                              size="sm"
                            />
                          )}
                        </div>
                      </td>

                      {/* Updated Time */}
                      <td className="py-4 px-6 text-center text-xs text-slate-400 tabular-nums">
                        {item.updatedAt}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Transform View */}
      <div className="sm:hidden space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-[#001D3D] p-6 rounded-xl text-center text-slate-400 text-sm">
            نمادی یافت نشد.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isGlobal = item.category === 'global';
            const isBuyAvailable =
              item.isBuyActive !== false && item.buyPrice !== null && item.buyPrice > 0;
            const isSellAvailable =
              item.isSellActive !== false && item.sellPrice !== null && item.sellPrice > 0;
            const isPending = Boolean(item.isPricePending || (!isBuyAvailable && !isSellAvailable));

            return (
              <div
                key={item.id}
                className="bg-[#001D3D] border border-[#003566] rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{item.name}</h4>
                      {isPending && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#12366F] text-[#FFD60A] border border-[#FFC300]/30 animate-pulse">
                          مهم
                        </span>
                      )}
                    </div>
                    {item.purity && (
                      <span className="text-[11px] text-slate-400">{item.purity}</span>
                    )}
                  </div>
                  {isPending && item.changePercentage === 0 ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {PENDING_PRICE_TEXT}
                    </span>
                  ) : (
                    <TrendBadge direction={item.direction} percentage={item.changePercentage} size="sm" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 bg-[#000814]/70 p-2.5 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">قیمت فروش</span>
                    {!isSellAvailable ? (
                      <span className="font-bold text-amber-300 text-xs">{PENDING_PRICE_TEXT}</span>
                    ) : (
                      <span className="font-bold text-white text-sm">
                        {isGlobal ? formatUSD(item.sellPrice) : formatToman(item.sellPrice)}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">قیمت خرید</span>
                    {!isBuyAvailable ? (
                      <span className="font-bold text-amber-300 text-xs">{PENDING_PRICE_TEXT}</span>
                    ) : (
                      <span className="font-semibold text-slate-300">
                        {isGlobal ? formatUSD(item.buyPrice) : formatToman(item.buyPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                  <span>
                    تغییر:{' '}
                    {item.changeAmount !== 0 ? formatChangeAmount(item.changeAmount, item.unit) : '-'}
                  </span>
                  <span>بروزرسانی: {item.updatedAt}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

