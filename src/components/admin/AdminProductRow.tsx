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

interface AdminProductRowProps {
  item: ManagedProductItem;
  onSaveRow: (id: string, updates: Partial<ProductServerConfig>) => Promise<boolean>;
  onDirtyChange?: (id: string, isDirty: boolean, draft: Partial<ProductServerConfig>) => void;
}

/**
 * Normalizes Persian/Arabic digits to English digits
 */
function normalizeDigits(str: string): string {
  if (!str) return '';
  return str
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

export const AdminProductRow: React.FC<AdminProductRowProps> = ({
  item,
  onSaveRow,
  onDirtyChange,
}) => {
  const isGlobal = item.category === 'global';

  // Local editing drafts
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
  const [rowError, setRowError] = useState<string | null>(null);

  // Sync state when baseline item updates (e.g. from server refresh)
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

  // Parse draft numbers
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

  // Determine dirty state against baseline
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

  // Report dirty changes to parent
  useEffect(() => {
    onDirtyChange?.(item.id, isDirty, currentDraft);
  }, [item.id, isDirty, currentDraft, onDirtyChange]);

  // Pure live effective calculation
  const liveEffective = useMemo(() => {
    return calculateEffectiveProductPrice(item.apiBuyPrice, item.apiSellPrice, currentDraft);
  }, [item.apiBuyPrice, item.apiSellPrice, currentDraft]);

  // Live validation
  const validation = useMemo(() => {
    return validateProductConfig(currentDraft, item.apiBuyPrice, item.apiSellPrice);
  }, [currentDraft, item.apiBuyPrice, item.apiSellPrice]);

  const handleApplyRow = async () => {
    if (!isDirty || isSaving || !validation.isValid) return;

    setIsSaving(true);
    setRowError(null);

    try {
      const success = await onSaveRow(item.id, currentDraft);
      if (success) {
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2500);
      } else {
        setRowError('خطا در ذخیره نماد');
      }
    } catch (err: any) {
      setRowError(err?.message || 'خطا در برقراری ارتباط با سرور');
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
    <tr
      className={`border-b border-[#003566]/40 transition-colors ${
        isRemoved
          ? 'bg-rose-950/20 opacity-80 hover:opacity-100'
          : isDirty
          ? 'bg-[#FFC300]/5 hover:bg-[#FFC300]/10'
          : 'hover:bg-[#12366F]/10'
      }`}
    >
      {/* 1. Product Title & Info */}
      <td className="py-3 px-4">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-extrabold text-white text-sm">{item.name}</span>
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
                حذف‌شده از سایت
              </span>
            )}
            {isDirty && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FFC300]/20 text-[#FFC300] border border-[#FFC300]/40">
                تغییر ذخیره نشده
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
            {item.purity && <span>عیار: {item.purity}</span>}
            {item.weight && <span>وزن: {item.weight}</span>}
            <span className="font-mono text-slate-500 text-[10px]">ID: {item.id}</span>
          </div>
        </div>
      </td>

      {/* 2. Visibility Toggle */}
      <td className="py-3 px-3 text-center">
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isRemoved
              ? 'bg-rose-600/30 text-rose-300 border border-rose-500/50 hover:bg-rose-600/40 shadow-sm'
              : 'bg-[#000814] text-slate-300 border border-[#003566] hover:text-rose-300 hover:border-rose-500/40'
          }`}
          title={isRemoved ? 'نماد در وب‌سایت پنهان است (کلیک جهت بازگردانی)' : 'کلیک جهت حذف از وب‌سایت'}
        >
          {isRemoved ? <EyeOff size={13} className="text-rose-400" /> : <Eye size={13} />}
          <span>{isRemoved ? 'بازگردانی به سایت' : 'حذف'}</span>
        </button>
      </td>

      {/* 3. Pricing Mode Toggle */}
      <td className="py-3 px-3 text-center">
        <div className="inline-flex rounded-lg p-0.5 bg-[#000814] border border-[#003566]">
          <button
            type="button"
            onClick={() => setPriceMode('api')}
            className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
              priceMode === 'api'
                ? 'bg-[#12366F] text-[#FFD60A] shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="حالت وب‌سرویس + اصلاحیه"
          >
            API + اصلاح
          </button>
          <button
            type="button"
            onClick={() => setPriceMode('manual')}
            className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
              priceMode === 'manual'
                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="حالت قیمت‌گذاری کاملاً دستی"
          >
            دستی
          </button>
        </div>
      </td>

      {/* 4. Buy: API Base (Read-only) */}
      <td className="py-3 px-2 text-center text-xs font-mono text-slate-400 bg-[#001D3D]/20">
        {item.apiBuyPrice !== null && item.apiBuyPrice > 0 ? (
          formatPrice(item.apiBuyPrice)
        ) : (
          <span className="text-slate-500 text-[11px]">در انتظار</span>
        )}
      </td>

      {/* 5. Buy: Adjustment / Manual Price Input */}
      <td className="py-3 px-2 text-center bg-[#001D3D]/20">
        {priceMode === 'api' ? (
          <div className="space-y-0.5">
            <input
              type="text"
              inputMode="numeric"
              value={buyAdjustmentInput}
              onChange={(e) => setBuyAdjustmentInput(e.target.value)}
              placeholder="± تومان"
              className="w-24 sm:w-28 bg-[#000814] border border-[#003566] focus:border-[#FFC300] rounded-lg px-2 py-1 text-xs font-mono text-center text-white outline-none transition-all"
              dir="ltr"
            />
            <div className="text-[10px] text-slate-500">
              {parsedBuyAdjustment !== 0
                ? `${parsedBuyAdjustment > 0 ? '+' : ''}${toPersianDigits(
                    parsedBuyAdjustment.toLocaleString()
                  )}`
                : 'بدون اصلاح'}
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            <input
              type="text"
              inputMode="numeric"
              value={manualBuyPriceInput}
              onChange={(e) => setManualBuyPriceInput(e.target.value)}
              placeholder="نرخ خرید دستی"
              className="w-24 sm:w-28 bg-[#000814] border border-amber-500/50 focus:border-amber-400 rounded-lg px-2 py-1 text-xs font-mono text-center text-amber-200 outline-none transition-all font-bold"
              dir="ltr"
            />
            <div className="text-[10px] text-amber-400">قیمت دستی</div>
          </div>
        )}
      </td>

      {/* 6. Buy: Final Effective Preview */}
      <td className="py-3 px-2 text-center font-bold text-xs bg-[#001D3D]/20 text-white">
        {liveEffective.buyPrice !== null ? (
          <span className="text-emerald-400">{formatPrice(liveEffective.buyPrice)}</span>
        ) : (
          <span className="text-amber-400/80 text-[11px]">در انتظار نرخ</span>
        )}
      </td>

      {/* 7. Sell: API Base (Read-only) */}
      <td className="py-3 px-2 text-center text-xs font-mono text-slate-400 bg-[#001D3D]/40">
        {item.apiSellPrice !== null && item.apiSellPrice > 0 ? (
          formatPrice(item.apiSellPrice)
        ) : (
          <span className="text-slate-500 text-[11px]">در انتظار</span>
        )}
      </td>

      {/* 8. Sell: Adjustment / Manual Price Input */}
      <td className="py-3 px-2 text-center bg-[#001D3D]/40">
        {priceMode === 'api' ? (
          <div className="space-y-0.5">
            <input
              type="text"
              inputMode="numeric"
              value={sellAdjustmentInput}
              onChange={(e) => setSellAdjustmentInput(e.target.value)}
              placeholder="± تومان"
              className="w-24 sm:w-28 bg-[#000814] border border-[#003566] focus:border-[#FFD60A] rounded-lg px-2 py-1 text-xs font-mono text-center text-white outline-none transition-all"
              dir="ltr"
            />
            <div className="text-[10px] text-slate-500">
              {parsedSellAdjustment !== 0
                ? `${parsedSellAdjustment > 0 ? '+' : ''}${toPersianDigits(
                    parsedSellAdjustment.toLocaleString()
                  )}`
                : 'بدون اصلاح'}
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            <input
              type="text"
              inputMode="numeric"
              value={manualSellPriceInput}
              onChange={(e) => setManualSellPriceInput(e.target.value)}
              placeholder="نرخ فروش دستی"
              className="w-24 sm:w-28 bg-[#000814] border border-amber-500/50 focus:border-amber-400 rounded-lg px-2 py-1 text-xs font-mono text-center text-[#FFD60A] outline-none transition-all font-bold"
              dir="ltr"
            />
            <div className="text-[10px] text-amber-400">قیمت دستی</div>
          </div>
        )}
      </td>

      {/* 9. Sell: Final Effective Preview */}
      <td className="py-3 px-2 text-center font-bold text-xs bg-[#001D3D]/40 text-[#FFD60A]">
        {liveEffective.sellPrice !== null ? (
          <span>{formatPrice(liveEffective.sellPrice)}</span>
        ) : (
          <span className="text-amber-400/80 text-[11px]">در انتظار نرخ</span>
        )}
      </td>

      {/* 10. Operations (Compact Apply button only when dirty) */}
      <td className="py-3 px-4 text-center">
        <div className="flex flex-col items-center justify-center gap-1">
          <button
            type="button"
            disabled={!isDirty || isSaving || !validation.isValid}
            onClick={handleApplyRow}
            className={`inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              justSaved
                ? 'bg-emerald-500 text-white shadow-md'
                : isDirty && validation.isValid
                ? 'bg-gradient-to-r from-[#FFC300] to-[#FFD60A] text-[#000814] hover:brightness-110 shadow-md scale-100 active:scale-95'
                : 'opacity-30 bg-[#001D3D] text-slate-400 border border-[#003566] cursor-not-allowed'
            }`}
            title={
              !isDirty
                ? 'تغییری برای اعمال وجود ندارد'
                : !validation.isValid
                ? validation.error
                : 'کلیک جهت اعمال این ردیف'
            }
          >
            {isSaving ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>ثبت...</span>
              </>
            ) : justSaved ? (
              <>
                <Check size={13} />
                <span>ذخیره شد</span>
              </>
            ) : (
              <>
                <Save size={13} />
                <span>اعمال</span>
              </>
            )}
          </button>

          {!validation.isValid && isDirty && (
            <div className="flex items-center gap-0.5 text-[10px] text-rose-400 font-medium">
              <AlertCircle size={10} />
              <span>{validation.error}</span>
            </div>
          )}

          {rowError && (
            <div className="text-[10px] text-rose-400 font-medium">{rowError}</div>
          )}
        </div>
      </td>
    </tr>
  );
};
