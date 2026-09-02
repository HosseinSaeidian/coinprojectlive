import React, { useState } from 'react';
import { ManagedProductItem, PriceSource } from '../../types';
import {
  formatToman,
  formatUSD,
  formatNumberWithCommas,
  PENDING_UPDATE_TEXT,
} from '../../utils/formatters';
import { Trash2, RotateCcw, Check, Clock, Save, Eye } from 'lucide-react';

interface AdminProductRowProps {
  item: ManagedProductItem;
  onSave: (id: string, updates: {
    isVisible: boolean;
    isPricePending: boolean;
    priceSource: PriceSource;
    manualOverride: boolean;
    manualBuyPrice: number;
    manualSellPrice: number;
  }) => void;
  onReset: (id: string) => void;
}

export const AdminProductRow: React.FC<AdminProductRowProps> = ({
  item,
  onSave,
  onReset,
}) => {
  const isGlobal = item.category === 'global';

  const [isVisible, setIsVisible] = useState<boolean>(item.isVisible);
  const [isPricePending, setIsPricePending] = useState<boolean>(Boolean(item.isPricePending));
  const [priceSource, setPriceSource] = useState<PriceSource>(item.priceSource);
  const [buyPriceInput, setBuyPriceInput] = useState<string>(item.buyPrice.toString());
  const [sellPriceInput, setSellPriceInput] = useState<string>(item.sellPrice.toString());
  const [justSaved, setJustSaved] = useState<boolean>(false);

  // Sync state if item prop changes
  React.useEffect(() => {
    setIsVisible(item.isVisible);
    setIsPricePending(Boolean(item.isPricePending));
    setPriceSource(item.priceSource);
    setBuyPriceInput(item.buyPrice.toString());
    setSellPriceInput(item.sellPrice.toString());
  }, [item]);

  const numBuyPrice = parseFloat(buyPriceInput) || 0;
  const numSellPrice = parseFloat(sellPriceInput) || 0;

  const handleBuyPriceChange = (val: string) => {
    setBuyPriceInput(val);
    if (isPricePending) {
      setIsPricePending(false);
    }
  };

  const handleSellPriceChange = (val: string) => {
    setSellPriceInput(val);
    if (isPricePending) {
      setIsPricePending(false);
    }
  };

  const handleSave = () => {
    onSave(item.id, {
      isVisible,
      isPricePending,
      priceSource,
      manualOverride: priceSource === 'manual',
      manualBuyPrice: numBuyPrice,
      manualSellPrice: numSellPrice,
    });

    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleReset = () => {
    setIsVisible(true);
    setIsPricePending(false);
    setPriceSource('manual');
    setBuyPriceInput(item.apiBuyPrice.toString());
    setSellPriceInput(item.apiSellPrice.toString());
    onReset(item.id);
  };

  const isManual = priceSource === 'manual';
  const isRemoved = !isVisible;

  return (
    <tr
      className={`border-b border-[#003566]/40 transition-colors ${
        isRemoved
          ? 'bg-rose-950/20 opacity-75 hover:opacity-100'
          : isPricePending
          ? 'bg-amber-950/20 hover:bg-amber-900/30'
          : isManual
          ? 'bg-[#001D3D]/40 hover:bg-[#12366F]/20'
          : 'hover:bg-[#12366F]/10'
      }`}
    >
      {/* Product Name & Details */}
      <td className="py-4 px-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-sm">
              {item.name}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                item.category === 'gold'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : item.category === 'coin'
                  ? 'bg-[#12366F] text-[#FFD60A] border border-[#FFC300]/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              {item.category === 'gold' ? 'طلا' : item.category === 'coin' ? 'سکه' : 'جهانی'}
            </span>
            {isRemoved && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                حذف‌شده
              </span>
            )}
            {!isRemoved && isPricePending && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                در انتظار نرخ
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
            {item.purity && <span>عیار: {item.purity}</span>}
            {item.weight && <span>وزن: {item.weight}</span>}
            <span className="font-mono text-slate-500 text-[10px]">ID: {item.id}</span>
          </div>
        </div>
      </td>

      {/* Remove from Site Control */}
      <td className="py-4 px-4 text-center">
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isRemoved
              ? 'bg-rose-600/30 text-rose-300 border border-rose-500/50 hover:bg-rose-600/40 shadow-sm'
              : 'bg-[#000814] text-slate-400 border border-[#003566] hover:text-rose-300 hover:border-rose-500/40 hover:bg-rose-500/10'
          }`}
          title={isRemoved ? 'نماد در سایت نمایش داده نمی‌شود (کلیک جهت بازگردانی)' : 'کلیک جهت حذف از سایت'}
        >
          {isRemoved ? <Trash2 size={14} className="text-rose-400" /> : <Eye size={14} />}
          <span>{isRemoved ? 'حذف‌شده از سایت' : 'حذف از سایت'}</span>
        </button>
      </td>

      {/* Waiting for Update Toggle */}
      <td className="py-4 px-4 text-center">
        <button
          type="button"
          disabled={isRemoved}
          onClick={() => setIsPricePending(!isPricePending)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isRemoved
              ? 'opacity-40 bg-[#000814] text-slate-600 border border-[#003566]/40 cursor-not-allowed'
              : isPricePending
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 shadow-sm'
              : 'bg-[#000814] text-slate-400 border border-[#003566] hover:text-amber-300 hover:border-amber-500/40 hover:bg-amber-500/10'
          }`}
          title={
            isRemoved
              ? 'نماد حذف شده است؛ اولویت با حذف از سایت می‌باشد.'
              : isPricePending
              ? 'کلیک جهت غیرفعال‌سازی وضعیت انتظار'
              : 'کلیک جهت فعال‌سازی وضعیت در انتظار به‌روزرسانی'
          }
        >
          <Clock size={14} className={isPricePending && !isRemoved ? 'text-amber-400' : ''} />
          <span>{isPricePending ? PENDING_UPDATE_TEXT : 'عادی'}</span>
        </button>
      </td>

      {/* Price Source Mode */}
      <td className="py-4 px-4 text-center">
        <div className="inline-flex bg-[#000814] p-1 rounded-xl border border-[#003566]">
          <button
            type="button"
            onClick={() => setPriceSource('manual')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isManual
                ? 'bg-[#12366F] text-[#FFD60A] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            دستی
          </button>
          <button
            type="button"
            onClick={() => setPriceSource('api')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !isManual
                ? 'bg-emerald-600/30 text-emerald-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            خودکار (API)
          </button>
        </div>
      </td>

      {/* Buy Price Input */}
      <td className="py-4 px-4">
        <div className="space-y-1">
          <div className="relative">
            <input
              type="number"
              value={buyPriceInput}
              disabled={!isManual || isRemoved}
              onChange={(e) => handleBuyPriceChange(e.target.value)}
              className={`w-36 sm:w-40 bg-[#000814] border rounded-xl px-3 py-1.5 text-xs sm:text-sm font-mono text-left text-white outline-none transition-all ${
                isManual && !isRemoved
                  ? 'border-[#003566] focus:border-[#FFC300]'
                  : 'border-[#003566]/40 opacity-50 bg-[#000814]/40 cursor-not-allowed'
              }`}
              dir="ltr"
            />
          </div>
          <div className="text-[10px] text-slate-400 font-semibold truncate text-right">
            {isPricePending
              ? 'در انتظار نرخ'
              : isGlobal
              ? formatUSD(numBuyPrice)
              : formatToman(numBuyPrice)}
          </div>
        </div>
      </td>

      {/* Sell Price Input */}
      <td className="py-4 px-4">
        <div className="space-y-1">
          <div className="relative">
            <input
              type="number"
              value={sellPriceInput}
              disabled={!isManual || isRemoved}
              onChange={(e) => handleSellPriceChange(e.target.value)}
              className={`w-36 sm:w-40 bg-[#000814] border rounded-xl px-3 py-1.5 text-xs sm:text-sm font-mono text-left text-white outline-none transition-all font-bold ${
                isManual && !isRemoved
                  ? 'border-[#003566] focus:border-[#FFD60A]'
                  : 'border-[#003566]/40 opacity-50 bg-[#000814]/40 cursor-not-allowed'
              }`}
              dir="ltr"
            />
          </div>
          <div className="text-[10px] text-[#FFD60A] font-bold truncate text-right">
            {isPricePending
              ? 'در انتظار نرخ'
              : isGlobal
              ? formatUSD(numSellPrice)
              : formatToman(numSellPrice)}
          </div>
        </div>
      </td>

      {/* Actions */}
      <td className="py-4 px-5 text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              justSaved
                ? 'bg-emerald-500 text-white border-emerald-400 scale-105'
                : 'bg-[#FFC300] hover:bg-[#FFD60A] text-[#000814] border-[#FFC300] hover:brightness-110 shadow-sm'
            }`}
            title="ذخیره تنظیمات این نماد"
          >
            {justSaved ? <Check size={16} /> : <Save size={16} />}
            <span className="hidden lg:inline">{justSaved ? 'ذخیره شد' : 'ذخیره'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl bg-[#000814] hover:bg-[#003566] text-slate-400 hover:text-white border border-[#003566] text-xs transition-colors cursor-pointer"
            title="بازنشانی این نماد به نرخ بازار و وضعیت پیش‌فرض"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
};

