import React from 'react';
import { Sparkles, ArrowDown, Calculator, TrendingUp, Shield } from 'lucide-react';
import { BrandPattern } from '../brand/BrandPattern';
import { PriceItem } from '../../types';
import { formatToman, formatPercentage, PENDING_UPDATE_TEXT } from '../../utils/formatters';
import { TrendBadge } from '../common/Badge';

interface HeroSectionProps {
  gold18k?: PriceItem;
  coinEmami?: PriceItem;
  onOpenCalculator: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  gold18k,
  coinEmami,
  onOpenCalculator,
}) => {
  return (
    <div className="relative overflow-hidden pt-8 pb-12 sm:pb-16 bg-gradient-to-b from-[#000814] via-[#001D3D]/50 to-[#000814] border-b border-[#001D3D]" id="hero-section">
      {/* Brand Pattern Background */}
      <BrandPattern opacity={0.12} />

      {/* Decorative Glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#FFC300]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#12366F]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Main Headline & Supporting Info */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
            {/* Top Brand Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#001D3D] border border-[#FFC300]/30 text-xs font-semibold text-[#FFD60A] shadow-sm">
              <Sparkles size={14} className="text-[#FFD60A]" />
              <span>سامانه مرجع قیمت‌گذاری بازار طلا و مسکوکات ایران</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.25]">
              قیمت لحظه‌ای <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD60A] via-[#FFC300] to-[#FFD60A]">طلا و سکه</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              آخرین قیمت طلا، سکه و فلزات گرانبها را با <strong className="text-white font-bold">فرشته کوین</strong> دنبال کنید. بروزرسانی پیوسته، محاسبه شفاف حباب و مظنه‌های رسمی اتحادیه.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <a
                href="#prices-section"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FFC300] to-[#FFD60A] text-[#000814] font-extrabold text-sm sm:text-base hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_20px_rgba(255,195,0,0.3)] cursor-pointer"
              >
                <span>مشاهده جدول قیمت‌ها</span>
                <ArrowDown size={18} />
              </a>

              <button
                onClick={onOpenCalculator}
                type="button"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#001D3D] hover:bg-[#003566] text-white border border-[#003566] font-bold text-sm sm:text-base hover:border-[#FFC300]/40 transition-all cursor-pointer"
              >
                <Calculator size={18} className="text-[#FFC300]" />
                <span>محاسبه‌گر ارزش طلا</span>
              </button>
            </div>

            {/* Trust Highlights */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Shield size={15} className="text-[#FFC300]" />
                <span>استعلام از صنف زرگران تهران</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1.5">
                <TrendingUp size={15} className="text-[#FFC300]" />
                <span>بروزرسانی مداوم مظنه‌ها</span>
              </div>
            </div>
          </div>

          {/* Quick Highlight Cards (Desktop & Mobile) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Highlight 1: Emami Coin */}
            {coinEmami && (
              <div className="bg-gradient-to-br from-[#001D3D] to-[#000814] border border-[#003566] hover:border-[#FFC300]/50 rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all group">
                <div className="absolute top-0 left-0 w-24 h-24 bg-[#FFC300]/5 rounded-full blur-xl group-hover:bg-[#FFC300]/10 transition-all" />
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#FFD60A] block mb-0.5">شاخص سکه</span>
                      {coinEmami.isPricePending && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#12366F] text-[#FFD60A] border border-[#FFC300]/30 animate-pulse">
                          مهم
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{coinEmami.name}</h3>
                  </div>
                  {coinEmami.isPricePending ? (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {PENDING_UPDATE_TEXT}
                    </span>
                  ) : (
                    <TrendBadge direction={coinEmami.direction} percentage={coinEmami.changePercentage} />
                  )}
                </div>

                <div className="space-y-1.5">
                  {coinEmami.isPricePending ? (
                    <div className="py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                      <span className="text-sm font-extrabold text-amber-300">{PENDING_UPDATE_TEXT}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-400">قیمت فروش:</span>
                        <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                          {formatToman(coinEmami.sellPrice)}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between text-xs text-slate-400">
                        <span>قیمت خرید:</span>
                        <span className="font-semibold text-slate-300">
                          {formatToman(coinEmami.buyPrice)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-[#003566]/80 flex justify-between items-center text-[11px] text-slate-400">
                  <span>وزن: {coinEmami.weight}</span>
                  <span className="text-slate-400">بروزرسانی: {coinEmami.updatedAt}</span>
                </div>
              </div>
            )}

            {/* Highlight 2: 18k Gold */}
            {gold18k && (
              <div className="bg-gradient-to-br from-[#001D3D] to-[#000814] border border-[#003566] hover:border-[#FFD60A]/50 rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all group">
                <div className="absolute top-0 left-0 w-24 h-24 bg-[#FFD60A]/5 rounded-full blur-xl group-hover:bg-[#FFD60A]/10 transition-all" />
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#FFD60A] block mb-0.5">شاخص طلا</span>
                      {gold18k.isPricePending && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#12366F] text-[#FFD60A] border border-[#FFC300]/30 animate-pulse">
                          مهم
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{gold18k.name}</h3>
                  </div>
                  {gold18k.isPricePending ? (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {PENDING_UPDATE_TEXT}
                    </span>
                  ) : (
                    <TrendBadge direction={gold18k.direction} percentage={gold18k.changePercentage} />
                  )}
                </div>

                <div className="space-y-1.5">
                  {gold18k.isPricePending ? (
                    <div className="py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                      <span className="text-sm font-extrabold text-amber-300">{PENDING_UPDATE_TEXT}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-400">قیمت هر گرم:</span>
                        <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                          {formatToman(gold18k.sellPrice)}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between text-xs text-slate-400">
                        <span>قیمت خرید:</span>
                        <span className="font-semibold text-slate-300">
                          {formatToman(gold18k.buyPrice)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-[#003566]/80 flex justify-between items-center text-[11px] text-slate-400">
                  <span>عیار: {gold18k.purity}</span>
                  <span className="text-slate-400">بروزرسانی: {gold18k.updatedAt}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

