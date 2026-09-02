import React from 'react';
import { CoinBubbleItem } from '../../types';
import { SectionHeader } from '../common/SectionHeader';
import { formatToman, formatPercentage, PENDING_UPDATE_TEXT, PENDING_PRICE_TEXT } from '../../utils/formatters';
import { Info, Clock } from 'lucide-react';
import { TrendBadge } from '../common/Badge';

interface BubbleSectionProps {
  bubbles: CoinBubbleItem[];
}

export const BubbleSection: React.FC<BubbleSectionProps> = ({ bubbles }) => {
  return (
    <section className="py-8 scroll-mt-24" id="bubbles-section">
      <SectionHeader
        title="حباب سکه"
        subtitle="بررسی اختلاف ارزش ذاتی طلا در هر قطعه سکه با قیمت معاملاتی بازار آزاد"
        badge="تحلیل ارزش ذاتی"
      />

      {/* Info explanation banner */}
      <div className="bg-[#001D3D]/60 border border-[#003566] rounded-xl p-4 mb-5 flex items-start gap-3 text-xs text-slate-300">
        <Info size={18} className="text-[#FFC300] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#FFD60A]">حباب سکه چیست؟</strong> حباب سکه نشان‌دهنده مازاد قیمتی است که خریدار به دلیل تقاضا، هزینه ضرب یا هیجانات بازار نسبت به ارزش خالص طلای خام موجود در سکه پرداخت می‌کند.
        </p>
      </div>

      {/* Bubble Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {bubbles.map((item) => {
          const isPending = Boolean(item.isPricePending || item.price <= 0);

          return (
            <div
              key={item.id}
              className="bg-[#001D3D]/80 border border-[#003566] hover:border-[#FFC300]/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-base font-extrabold text-white">{item.name}</h4>
                  {isPending ? (
                    <span className="text-[10px] text-amber-300 font-bold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30">
                      {PENDING_PRICE_TEXT}
                    </span>
                  ) : (
                    <TrendBadge direction={item.direction} percentage={item.bubblePercentage} />
                  )}
                </div>

                <div className="space-y-2 bg-[#000814]/70 p-3 rounded-xl border border-[#003566]/60 text-xs">
                  {isPending ? (
                    <div className="py-3 text-center space-y-1">
                      <span className="text-xs text-slate-400 block">وضعیت محاسبه:</span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                        <Clock size={13} className="text-amber-400" />
                        <span>{PENDING_PRICE_TEXT}</span>
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-baseline">
                        <span className="text-slate-400">قیمت معاملاتی:</span>
                        <span className="font-bold text-white tabular-nums">{formatToman(item.price)}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-slate-400">ارزش ذاتی طلا:</span>
                        <span className="font-semibold text-slate-300 tabular-nums">{formatToman(item.realValue)}</span>
                      </div>
                      <div className="pt-2 border-t border-[#003566]/60 flex justify-between items-baseline">
                        <span className="text-[#FFD60A] font-bold">مبلغ حباب:</span>
                        <span className="font-extrabold text-[#FFD60A] text-sm tabular-nums">
                          {formatToman(item.bubbleAmount)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bubble Gauge Visualizer */}
              <div className="mt-4 pt-3 border-t border-[#003566]/50">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                  <span>سهم حباب از کل قیمت:</span>
                  <span className="font-bold text-[#FFD60A] tabular-nums">
                    {isPending ? '-' : formatPercentage(item.bubblePercentage, false)}
                  </span>
                </div>
                <div className="w-full bg-[#000814] h-2 rounded-full overflow-hidden border border-[#003566]">
                  <div
                    className="h-full bg-gradient-to-r from-[#FFC300] to-[#FFD60A] rounded-full transition-all duration-500"
                    style={{ width: `${isPending ? 0 : Math.min(item.bubblePercentage * 1.8, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

