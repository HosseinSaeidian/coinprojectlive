import React, { useState } from 'react';
import { X, Calculator, Coins, Sparkles, RefreshCw } from 'lucide-react';
import { formatToman, formatNumberWithCommas, toPersianDigits } from '../../utils/formatters';

interface GoldCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  gold18kPrice?: number;
}

export const GoldCalculatorModal: React.FC<GoldCalculatorModalProps> = ({
  isOpen,
  onClose,
  gold18kPrice = 4945000,
}) => {
  const [calcMode, setCalcMode] = useState<'gold' | 'coin'>('gold');

  // Gold mode states
  const [weight, setWeight] = useState<string>('4.5'); // grams
  const [caratRate, setCaratRate] = useState<number>(gold18kPrice);
  const [wagePercent, setWagePercent] = useState<string>('12'); // اجرت ساخت ٪
  const [profitPercent, setProfitPercent] = useState<string>('7'); // سود طلافروش ٪
  const [taxPercent, setTaxPercent] = useState<string>('9'); // مالیات بر ارزش افزوده (اجرت + سود)

  // Coin mode states
  const [emamiCount, setEmamiCount] = useState<number>(1);
  const [nimCount, setNimCount] = useState<number>(0);
  const [robCount, setRobCount] = useState<number>(0);

  if (!isOpen) return null;

  // Gold Calculation Math according to official Iranian Jeweler formula:
  // Raw gold value = weight * gold_price_per_gram
  // Wage = Raw * (wage% / 100)
  // Jeweler Profit = (Raw + Wage) * (profit% / 100)
  // VAT Tax = (Wage + Profit) * (tax% / 100)
  // Total = Raw + Wage + Profit + Tax
  const weightNum = parseFloat(weight) || 0;
  const wageNum = parseFloat(wagePercent) || 0;
  const profitNum = parseFloat(profitPercent) || 0;
  const taxNum = parseFloat(taxPercent) || 0;

  const rawGoldValue = weightNum * caratRate;
  const wageValue = rawGoldValue * (wageNum / 100);
  const profitValue = (rawGoldValue + wageValue) * (profitNum / 100);
  const taxValue = (wageValue + profitValue) * (taxNum / 100);
  const totalGoldPrice = Math.round(rawGoldValue + wageValue + profitValue + taxValue);

  // Coin Mode Math
  const coinEmamiPrice = 54600000;
  const coinNimPrice = 29400000;
  const coinRobPrice = 19250000;
  const totalCoinPrice =
    emamiCount * coinEmamiPrice + nimCount * coinNimPrice + robCount * coinRobPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-[#001D3D] border border-[#003566] rounded-3xl p-6 sm:p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#003566]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#12366F] text-[#FFD60A]">
              <Calculator size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">محاسبه‌گر هوشمند ارزش طلا</h3>
              <p className="text-xs text-slate-400">فرمول رسمی اتحادیه طلا و جواهر</p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl bg-[#000814] text-slate-400 hover:text-white hover:bg-[#003566] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex bg-[#000814] p-1 rounded-xl border border-[#003566] my-5">
          <button
            onClick={() => setCalcMode('gold')}
            type="button"
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              calcMode === 'gold'
                ? 'bg-[#12366F] text-[#FFD60A] shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            محاسبه طلای زینتی (گرم و اجرت)
          </button>
          <button
            onClick={() => setCalcMode('coin')}
            type="button"
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              calcMode === 'coin'
                ? 'bg-[#12366F] text-[#FFD60A] shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            محاسبه مجموع ارزش سکه
          </button>
        </div>

        {/* Gold mode inputs */}
        {calcMode === 'gold' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1.5">
                  وزن طلا (گرم):
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-[#000814] border border-[#003566] focus:border-[#FFC300] rounded-xl px-3.5 py-2.5 text-white font-bold text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1.5">
                  قیمت هر گرم طلا ۱۸ (تومان):
                </label>
                <input
                  type="number"
                  value={caratRate}
                  onChange={(e) => setCaratRate(Number(e.target.value))}
                  className="w-full bg-[#000814] border border-[#003566] focus:border-[#FFC300] rounded-xl px-3.5 py-2.5 text-white font-bold text-sm outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 font-bold block mb-1.5">
                  درصد اجرت ساخت (%):
                </label>
                <input
                  type="number"
                  value={wagePercent}
                  onChange={(e) => setWagePercent(e.target.value)}
                  className="w-full bg-[#000814] border border-[#003566] focus:border-[#FFC300] rounded-xl px-3 py-2 text-white font-bold text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-bold block mb-1.5">
                  سود طلافروش (%):
                </label>
                <input
                  type="number"
                  value={profitPercent}
                  onChange={(e) => setProfitPercent(e.target.value)}
                  className="w-full bg-[#000814] border border-[#003566] focus:border-[#FFC300] rounded-xl px-3 py-2 text-white font-bold text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-bold block mb-1.5">
                  مالیات ارزش افزوده (%):
                </label>
                <input
                  type="number"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(e.target.value)}
                  className="w-full bg-[#000814] border border-[#003566] focus:border-[#FFC300] rounded-xl px-3 py-2 text-white font-bold text-sm outline-none"
                />
              </div>
            </div>

            {/* Breakdown summary */}
            <div className="bg-[#000814] rounded-2xl p-4 border border-[#003566] space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>ارزش خام طلا:</span>
                <span className="font-semibold text-slate-200">{formatToman(Math.round(rawGoldValue))}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>مبلغ اجرت ساخت:</span>
                <span className="font-semibold text-slate-200">{formatToman(Math.round(wageValue))}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>سود فروشنده (۷٪):</span>
                <span className="font-semibold text-slate-200">{formatToman(Math.round(profitValue))}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>مالیات بر ارزش افزوده (۹٪):</span>
                <span className="font-semibold text-slate-200">{formatToman(Math.round(taxValue))}</span>
              </div>

              <div className="pt-3 border-t border-[#003566] flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">مبلغ نهایی قابل پرداخت:</span>
                <span className="text-xl font-extrabold text-[#FFD60A]">{formatToman(totalGoldPrice)}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Coin mode inputs */
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-[#000814] p-3 rounded-xl border border-[#003566]">
                <div>
                  <span className="font-bold text-white text-sm block">سکه تمام امامی</span>
                  <span className="text-xs text-slate-400">{formatToman(coinEmamiPrice)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEmamiCount(Math.max(0, emamiCount - 1))}
                    className="w-8 h-8 rounded-lg bg-[#001D3D] text-white flex items-center justify-center font-bold border border-[#003566]"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-white">{toPersianDigits(emamiCount)}</span>
                  <button
                    onClick={() => setEmamiCount(emamiCount + 1)}
                    className="w-8 h-8 rounded-lg bg-[#001D3D] text-white flex items-center justify-center font-bold border border-[#003566]"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#000814] p-3 rounded-xl border border-[#003566]">
                <div>
                  <span className="font-bold text-white text-sm block">نیم سکه بهار آزادی</span>
                  <span className="text-xs text-slate-400">{formatToman(coinNimPrice)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNimCount(Math.max(0, nimCount - 1))}
                    className="w-8 h-8 rounded-lg bg-[#001D3D] text-white flex items-center justify-center font-bold border border-[#003566]"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-white">{toPersianDigits(nimCount)}</span>
                  <button
                    onClick={() => setNimCount(nimCount + 1)}
                    className="w-8 h-8 rounded-lg bg-[#001D3D] text-white flex items-center justify-center font-bold border border-[#003566]"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#000814] p-3 rounded-xl border border-[#003566]">
                <div>
                  <span className="font-bold text-white text-sm block">ربع سکه بهار آزادی</span>
                  <span className="text-xs text-slate-400">{formatToman(coinRobPrice)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRobCount(Math.max(0, robCount - 1))}
                    className="w-8 h-8 rounded-lg bg-[#001D3D] text-white flex items-center justify-center font-bold border border-[#003566]"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-white">{toPersianDigits(robCount)}</span>
                  <button
                    onClick={() => setRobCount(robCount + 1)}
                    className="w-8 h-8 rounded-lg bg-[#001D3D] text-white flex items-center justify-center font-bold border border-[#003566]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#000814] rounded-2xl p-4 border border-[#003566] flex justify-between items-baseline">
              <span className="text-sm font-bold text-white">مجموع ارزش سبد مسکوکات:</span>
              <span className="text-xl font-extrabold text-[#FFD60A]">{formatToman(totalCoinPrice)}</span>
            </div>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-5 text-center">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#12366F] hover:bg-[#003566] text-white font-bold text-sm border border-[#003566] transition-colors cursor-pointer"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
