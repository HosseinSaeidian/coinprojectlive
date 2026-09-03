import React, { useState, useEffect, useMemo } from 'react';
import { ManagedProductItem, PriceMode, ProductServerConfig } from '../../types';
import {
  formatToman,
  formatUSD,
  toPersianDigits,
} from '../../utils/formatters';
import {
  calculateEffectiveProductPrice,
  validateProductConfig,
} from '../../utils/priceCalculations';
import { Check, Eye, EyeOff, Save, Loader2, AlertCircle } from 'lucide-react';

interface AdminProductCardProps {
  item: ManagedProductItem;
  onSaveRow: (id: string, updates: Partial<ProductServerConfig>) => Promise<boolean>;
  onDirtyChange?: (id: string, isDirty: boolean, draft: Partial<ProductServerConfig>) => void;
}

function normalizeDigits(str: string): string {
  if (!str) return '';
  return str
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

export const AdminProductCard: React.FC<AdminProductCardProps> = ({
  item,
  onSaveRow,
  onDirtyChange,
}) => {
  const isGlobal = item.category === 'global';

  const [isVisible, setIsVisible] = useState<boolean>(item.isVisible);
  const [priceMode, setPriceMode] = useState<PriceMode>(item.priceMode || 'api');
  const [buyAdjustmentInput, setBuyAdjustmentInput] = useState<string>(
    item.buyAdjustment ? item.buyAdjustment.toString() : '0'
  );
  const [sellAdjustmentInput, setSellAdjustmentInput] = useState<string>(
    item.sellAdjustment ? item.sellAdjustment.toString() : '0'
  );
  const [manualBuyPriceInput, setManualBuyPriceInput] = useState<string>(
    item.manualBuyPrice != null ? item.manualBuyPrice.toString() : ''
  );
  const [manualSellPriceInput, setManualSellPriceInput] = useState<string>(
    item.manualSellPrice != null ? item.manualSellPrice.toString() : ''
  );

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);
  const [cardError, setCardError] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(item.isVisible);
    setPriceMode(item.priceMode || 'api');
    setBuyAdjustmentInput(item.buyAdjustment ? item.buyAdjustment.toString() : '0');
    setSellAdjustmentInput(item.sellAdjustment ? item.sellAdjustment.toString() : '0');
    setManualBuyPriceInput(item.manualBuyPrice != null ? item.manualBuyPrice.toString() : '');
    setManualSellPriceInput(item.manualSellPrice != null ? item.manualSellPrice.toString() : '');
  }, [
    item.isVisible,
    item.priceMode,
    item.buyAdjustment,
    item.sellAdjustment,
    item.manualBuyPrice,
    item.manualSellPrice,
  ]);

  const parsedBuyAdjustment = useMemo(() => {
    const raw = normalizeDigits(buyAdjustmentInput).replace(/[^\d+-]/g, '');
    return parseInt(raw, 10) || 0;
  }, [buyAdjustmentInput]);

  const parsedSellAdjustment = useMemo(() => {
    const raw = normalizeDigits(sellAdjustmentInput).replace(/[^\d+-]/g, '');
    return parseInt(raw, 10) || 0;
  }, [sellAdjustmentInput]);

  const parsedManualBuyPrice = useMemo(() => {
    const raw = normalizeDigits(manualBuyPriceInput).replace(/[^\d.]/g, '');
    return raw.trim() !== '' ? parseFloat(raw) || null : null;
  }, [manualBuyPriceInput]);

  const parsedManualSellPrice = useMemo(() => {
    const raw = normalizeDigits(manualSellPriceInput).replace(/[^\d.]/g, '');
    return raw.trim() !== '' ? parseFloat(raw) || null : null;
  }, [manualSellPriceInput]);

  const currentDraft: Partial<ProductServerConfig> = useMemo(() => {
    return {
      isVisible,
      priceMode,
      buyAdjustment: parsedBuyAdjustment,
      sellAdjustment: parsedSellAdjustment,
      manualBuyPrice: parsedManualBuyPrice,
      manualSellPrice: parsedManualSellPrice,
    };
  }, [
    isVisible,
    priceMode,
    parsedBuyAdjustment,
    parsedSellAdjustment,
    parsedManualBuyPrice,
    parsedManualSellPrice,
  ]);

  const isDirty = useMemo(() => {
    return (
      isVisible !== item.isVisible ||
      priceMode !== (item.priceMode || 'api') ||
      parsedBuyAdjustment !== (item.buyAdjustment ?? 0) ||
      parsedSellAdjustment !== (item.sellAdjustment ?? 0) ||
      (parsedManualBuyPrice ?? null) !== (item.manualBuyPrice ?? null) ||
      (parsedManualSellPrice ?? null) !== (item.manualSellPrice ?? null)
    );
  }, [
    isVisible,
    priceMode,
    parsedBuyAdjustment,
    parsedSellAdjustment,
    parsedManualBuyPrice,
    parsedManualSellPrice,
    item,
  ]);

  useEffect(() => {
    onDirtyChange?.(item.id, isDirty, currentDraft);
  }, [item.id, isDirty, currentDraft, onDirtyChange]);

  const liveEffective = useMemo(() => {
    return calculateEffectiveProductPrice(item.apiBuyPrice, item.apiSellPrice, currentDraft);
  }, [item.apiBuyPrice, item.apiSellPrice, currentDraft]);

  const validation = useMemo(() => {
    return validateProductConfig(currentDraft, item.apiBuyPrice, item.apiSellPrice);
  }, [currentDraft, item.apiBuyPrice, item.apiSellPrice]);

  const handleApplyCard = async () => {
    if (!isDirty || isSaving || !validation.isValid) return;

    setIsSaving(true);
    setCardError(null);

    try {
      const success = await onSaveRow(item.id, currentDraft);
      if (success) {
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2500);
      } else {
        setCardError('خطا در ذخیره نماد');
      }
    } catch (err: any) {
      setCardError(err?.message || 'خطا در ارتباط با سرور');
    } finally {
      setIsSaving(false);
    }
  };

  const isRemoved = !isVisible;

  const formatPrice = (val: number | null) => {
    if (val === null || val <= 0) return 'در انتظار';
    return isGlobal ? formatUSD(val) : formatToman(val);
  };

  return (
    <div
      className={`rounded-2xl p-4 border transition-all space-y-4 ${
        isRemoved
          ? 'bg-rose-950/20 border-rose-900/40 opacity-85'
          : isDirty
          ? 'bg-[#001D3D] border-[#FFC300]/40 shadow-lg'
          : 'bg-[#001D3D]/70 border-[#003566]'
      }`}
    >
      {/* 1. Card Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-extrabold text-white text-base">{item.name}</h3>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
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
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                حذف‌شده
              </span>
            )}
            {isDirty && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FFC300]/20 text-[#FFC300] border border-[#FFC300]/40">
                تغییر کرده
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            {item.purity && <span>عیار: {item.purity}</span>}
            {item.weight && <span>وزن: {item.weight}</span>}
          </div>
        </div>

        {/* Visibility Toggle */}
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isRemoved
              ? 'bg-rose-600/30 text-rose-300 border border-rose-500/50'
              : 'bg-[#000814] text-slate-300 border border-[#003566] hover:text-rose-300'
          }`}
        >
          {isRemoved ? <EyeOff size={13} className="text-rose-400" /> : <Eye size={13} />}
          <span>{isRemoved ? 'بازگردانی به سایت' : 'حذف'}</span>
        </button>
      </div>

      {/* 2. Price Mode Selector */}
      <div className="flex items-center justify-between bg-[#000814]/80 p-2 rounded-xl border border-[#003566]">
        <span className="text-xs text-slate-300 font-medium">حالت قیمت‌گذاری:</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setPriceMode('api')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              priceMode === 'api'
                ? 'bg-[#12366F] text-[#FFD60A] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            API + اصلاح
          </button>
          <button
            type="button"
            onClick={() => setPriceMode('manual')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              priceMode === 'manual'
                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            دستی
          </button>
        </div>
      </div>

      {/* 3. Buy Section */}
      <div className="p-3 rounded-xl bg-[#000814]/60 border border-[#003566]/60 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#FFC300]">
          <span>خرید (ورودی شما به بازار)</span>
          <span className="text-[11px] font-mono text-slate-400 font-normal">
            پایه API:{' '}
            {item.apiBuyPrice !== null && item.apiBuyPrice > 0 ? (
              formatPrice(item.apiBuyPrice)
            ) : (
              'در انتظار'
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-[10px] text-slate-400 block mb-1">
              {priceMode === 'api' ? 'مبلغ اصلاحیه خرید' : 'قیمت خرید دستی'}
            </label>
            {priceMode === 'api' ? (
              <input
                type="text"
                inputMode="numeric"
                value={buyAdjustmentInput}
                onChange={(e) => setBuyAdjustmentInput(e.target.value)}
                placeholder="± تومان"
                className="w-full bg-[#000814] border border-[#003566] focus:border-[#FFC300] rounded-xl px-3 py-1.5 text-xs font-mono text-white outline-none"
                dir="ltr"
              />
            ) : (
              <input
                type="text"
                inputMode="numeric"
                value={manualBuyPriceInput}
                onChange={(e) => setManualBuyPriceInput(e.target.value)}
                placeholder="نرخ خرید دستی"
                className="w-full bg-[#000814] border border-amber-500/50 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs font-mono text-amber-200 outline-none"
                dir="ltr"
              />
            )}
          </div>

          <div className="text-left min-w-[100px]">
            <span className="text-[10px] text-slate-400 block">نرخ نهایی خرید:</span>
            <span className="text-xs font-extrabold text-emerald-400 font-mono">
              {formatPrice(liveEffective.buyPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Sell Section */}
      <div className="p-3 rounded-xl bg-[#000814]/60 border border-[#003566]/60 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#FFD60A]">
          <span>فروش (خروج مشتری)</span>
          <span className="text-[11px] font-mono text-slate-400 font-normal">
            پایه API:{' '}
            {item.apiSellPrice !== null && item.apiSellPrice > 0 ? (
              formatPrice(item.apiSellPrice)
            ) : (
              'در انتظار'
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-[10px] text-slate-400 block mb-1">
              {priceMode === 'api' ? 'مبلغ اصلاحیه فروش' : 'قیمت فروش دستی'}
            </label>
            {priceMode === 'api' ? (
              <input
                type="text"
                inputMode="numeric"
                value={sellAdjustmentInput}
                onChange={(e) => setSellAdjustmentInput(e.target.value)}
                placeholder="± تومان"
                className="w-full bg-[#000814] border border-[#003566] focus:border-[#FFD60A] rounded-xl px-3 py-1.5 text-xs font-mono text-white outline-none"
                dir="ltr"
              />
            ) : (
              <input
                type="text"
                inputMode="numeric"
                value={manualSellPriceInput}
                onChange={(e) => setManualSellPriceInput(e.target.value)}
                placeholder="نرخ فروش دستی"
                className="w-full bg-[#000814] border border-amber-500/50 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs font-mono text-[#FFD60A] outline-none font-bold"
                dir="ltr"
              />
            )}
          </div>

          <div className="text-left min-w-[100px]">
            <span className="text-[10px] text-slate-400 block">نرخ نهایی فروش:</span>
            <span className="text-xs font-extrabold text-[#FFD60A] font-mono">
              {formatPrice(liveEffective.sellPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Card Footer Action */}
      <div className="pt-1 flex items-center justify-between gap-2">
        <div className="text-[11px] text-rose-400 font-medium">
          {!validation.isValid && isDirty && (
            <div className="flex items-center gap-1">
              <AlertCircle size={12} />
              <span>{validation.error}</span>
            </div>
          )}
          {cardError && <div>{cardError}</div>}
        </div>

        <button
          type="button"
          disabled={!isDirty || isSaving || !validation.isValid}
          onClick={handleApplyCard}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            justSaved
              ? 'bg-emerald-500 text-white shadow-md'
              : isDirty && validation.isValid
              ? 'bg-gradient-to-r from-[#FFC300] to-[#FFD60A] text-[#000814] hover:brightness-110 shadow-md scale-100 active:scale-95'
              : 'opacity-30 bg-[#001D3D] text-slate-400 border border-[#003566] cursor-not-allowed'
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>در حال ذخیره...</span>
            </>
          ) : justSaved ? (
            <>
              <Check size={14} />
              <span>ذخیره شد</span>
            </>
          ) : (
            <>
              <Save size={14} />
              <span>اعمال تغییرات این کارت</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
