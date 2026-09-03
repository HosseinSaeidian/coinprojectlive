import React, { useState } from 'react';
import { ManagedProductItem, PriceSource } from '../../types';
import { formatToman, formatUSD, PENDING_UPDATE_TEXT } from '../../utils/formatters';
import { Trash2, Clock, Save, RotateCcw, Check, Eye } from 'lucide-react';

interface AdminProductCardProps {
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

export const AdminProductCard: React.FC<AdminProductCardProps> = ({
  item,
  onSave,
  onReset,
}) => {
  const isGlobal = item.category === 'global';

  const [isVisible, setIsVisible] = useState<boolean>(item.isVisible);
  const [isPricePending, setIsPricePending] = useState<boolean>(Boolean(item.isPricePending));
  const [priceSource, setPriceSource] = useState<PriceSource>(item.priceSource);
  const [buyPriceInput, setBuyPriceInput] = useState<string>(
    item.buyPrice != null ? item.buyPrice.toString() : ''
  );
  const [sellPriceInput, setSellPriceInput] = useState<string>(
    item.sellPrice != null ? item.sellPrice.toString() : ''
  );
  const [justSaved, setJustSaved] = useState<boolean>(false);

  React.useEffect(() => {
    setIsVisible(item.isVisible);
    setIsPricePending(Boolean(item.isPricePending));
    setPriceSource(item.priceSource);
    setBuyPriceInput(item.buyPrice != null ? item.buyPrice.toString() : '');
    setSellPriceInput(item.sellPrice != null ? item.sellPrice.toString() : '');
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

  const handleToggleVisibility = () => {
    const nextVisible = !isVisible;
    setIsVisible(nextVisible);
    onSave(item.id, {
      isVisible: nextVisible,
      isPricePending,
      priceSource,
      manualOverride: priceSource === 'manual',
      manualBuyPrice: numBuyPrice,
      manualSellPrice: numSellPrice,
    });
  };

  const handleReset = () => {
    setIsVisible(true);
    setIsPricePending(false);
    setPriceSource('manual');
    setBuyPriceInput(item.apiBuyPrice != null ? item.apiBuyPrice.toString() : '');
    setSellPriceInput(item.apiSellPrice != null ? item.apiSellPrice.toString() : '');
    onReset(item.id);
  };

  const isManual = priceSource === 'manual';
  const isRemoved = !isVisible;

  return (
    <div
      className={`rounded-2xl p-4 border transition-all space-y-3.5 ${
        isRemoved
          ? 'bg-rose-950/20 border-rose-900/40 opacity-75'
          : isPricePending
          ? 'bg-amber-950/20 border-amber-900/40 shadow-md'
          : isManual
          ? 'bg-[#001D3D] border-[#FFC300]/30 shadow-md'
          : 'bg-[#001D3D]/80 border-[#003566]'
      }`}
    >
      {/* Header Info */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-white text-base">{item.name}</h3>
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

          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            {item.purity && <span>عیار: {item.purity}</span>}
            {item.weight && <span>وزن: {item.weight}</span>}
          </div>
        </div>

        {/* Remove from Site Toggle */}
        <button
          type="button"
          onClick={handleToggleVisibility}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isRemoved
              ? 'bg-rose-600/30 text-rose-300 border border-rose-500/50'
              : 'bg-[#000814] text-slate-400 border border-[#003566] hover:text-rose-300'
          }`}
          title={isRemoved ? 'کلیک جهت بازگردانی به سایت' : 'کلیک جهت حذف از سایت'}
        >
          {isRemoved ? <RotateCcw size={13} className="text-rose-400" /> : <Eye size={13} />}
          <span>{isRemoved ? 'بازگردانی به سایت' : 'حذف از سایت'}</span>
        </button>
      </div>

      {/* Waiting for Update Bar */}
      <div className="flex items-center justify-between bg-[#000814]/70 p-2 rounded-xl border border-[#003566]">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock size={14} className={isPricePending && !isRemoved ? 'text-amber-400' : ''} />
          <span>وضعیت انتشار نرخ:</span>
        </div>
        <button
          type="button"
          disabled={isRemoved}
          onClick={() => setIsPricePending(!isPricePending)}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            isRemoved
              ? 'opacity-40 text-slate-600 cursor-not-allowed'
              : isPricePending
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'bg-[#001D3D] text-slate-400 hover:text-amber-300'
          }`}
        >
          {isPricePending ? PENDING_UPDATE_TEXT : 'عادی'}
        </button>
      </div>

      {/* Source Selector */}
      <div className="flex items-center justify-between bg-[#000814]/70 p-2 rounded-xl border border-[#003566]">
        <span className="text-xs text-slate-400">حالت قیمت:</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setPriceSource('manual')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              isManual
                ? 'bg-[#12366F] text-[#FFD60A] shadow-sm'
                : 'text-slate-400'
            }`}
          >
            دستی
          </button>
          <button
            type="button"
            onClick={() => setPriceSource('api')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              !isManual
                ? 'bg-emerald-600/30 text-emerald-300 shadow-sm'
                : 'text-slate-400'
            }`}
          >
            خودکار (API)
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Sell Price */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-300 block">
            قیمت فروش ({item.unit})
          </label>
          <input
            type="number"
            value={sellPriceInput}
            disabled={!isManual || isRemoved}
            onChange={(e) => handleSellPriceChange(e.target.value)}
            className={`w-full bg-[#000814] border rounded-xl px-3 py-2 text-sm font-mono text-left text-white outline-none transition-all ${
              isManual && !isRemoved
                ? 'border-[#003566] focus:border-[#FFD60A]'
                : 'border-[#003566]/40 opacity-50 cursor-not-allowed'
            }`}
            dir="ltr"
          />
          <div className="text-[11px] text-[#FFD60A] font-bold">
            {isPricePending
              ? 'در انتظار نرخ'
              : isGlobal
              ? formatUSD(numSellPrice)
              : formatToman(numSellPrice)}
          </div>
        </div>

        {/* Buy Price */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-300 block">
            قیمت خرید ({item.unit})
          </label>
          <input
            type="number"
            value={buyPriceInput}
            disabled={!isManual || isRemoved}
            onChange={(e) => handleBuyPriceChange(e.target.value)}
            className={`w-full bg-[#000814] border rounded-xl px-3 py-2 text-sm font-mono text-left text-white outline-none transition-all ${
              isManual && !isRemoved
                ? 'border-[#003566] focus:border-[#FFC300]'
                : 'border-[#003566]/40 opacity-50 cursor-not-allowed'
            }`}
            dir="ltr"
          />
          <div className="text-[11px] text-slate-400 font-semibold">
            {isPricePending
              ? 'در انتظار نرخ'
              : isGlobal
              ? formatUSD(numBuyPrice)
              : formatToman(numBuyPrice)}
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="pt-2 border-t border-[#003566]/60 flex items-center justify-between">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-[#000814] border border-[#003566]"
        >
          <RotateCcw size={13} />
          <span>نرخ اولیه</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            justSaved
              ? 'bg-emerald-500 text-white shadow-md'
              : 'bg-gradient-to-r from-[#FFC300] to-[#FFD60A] text-[#000814] shadow-[0_2px_10px_rgba(255,195,0,0.25)]'
          }`}
        >
          {justSaved ? <Check size={15} /> : <Save size={15} />}
          <span>{justSaved ? 'ذخیره شد' : 'ذخیره تغییرات'}</span>
        </button>
      </div>
    </div>
  );
};

