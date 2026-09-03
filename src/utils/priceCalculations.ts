import { PriceMode, ProductServerConfig } from '../types';

export interface EffectivePriceResult {
  buyPrice: number | null;
  sellPrice: number | null;
  isBuyActive: boolean;
  isSellActive: boolean;
  isPricePending: boolean;
}

/**
 * Pure calculation helper ensuring public UI and Admin preview use EXACTLY the same formula.
 *
 * Rules:
 * - In API mode:
 *   finalBuyPrice = apiBuyPrice + buyAdjustment
 *   finalSellPrice = apiSellPrice + sellAdjustment
 *   - Adjustments are absolute amounts (not percentages), positive or negative.
 *   - In API mode, if apiBuyPrice/apiSellPrice is null, that side remains pending.
 *   - A final price must never silently become negative. If calculation produces <= 0, that side is treated as unavailable/null.
 * - In Manual mode:
 *   finalBuyPrice = manualBuyPrice (if provided and > 0, else null)
 *   finalSellPrice = manualSellPrice (if provided and > 0, else null)
 * - Pending state is DERIVED from effective prices:
 *   isBuyActive = finalBuyPrice != null && finalBuyPrice > 0
 *   isSellActive = finalSellPrice != null && finalSellPrice > 0
 *   isPricePending = !isBuyActive && !isSellActive
 */
export function calculateEffectiveProductPrice(
  apiBuyPrice: number | null,
  apiSellPrice: number | null,
  config?: Partial<ProductServerConfig> | null
): EffectivePriceResult {
  const priceMode: PriceMode = config?.priceMode || 'api';

  if (priceMode === 'manual') {
    const rawManualBuy = config?.manualBuyPrice;
    const rawManualSell = config?.manualSellPrice;

    const buyPrice =
      rawManualBuy !== undefined && rawManualBuy !== null && rawManualBuy > 0
        ? rawManualBuy
        : null;

    const sellPrice =
      rawManualSell !== undefined && rawManualSell !== null && rawManualSell > 0
        ? rawManualSell
        : null;

    const isBuyActive = buyPrice !== null && buyPrice > 0;
    const isSellActive = sellPrice !== null && sellPrice > 0;
    const isPricePending = !isBuyActive && !isSellActive;

    return {
      buyPrice,
      sellPrice,
      isBuyActive,
      isSellActive,
      isPricePending,
    };
  }

  // API mode
  const buyAdjustment = typeof config?.buyAdjustment === 'number' ? config.buyAdjustment : 0;
  const sellAdjustment = typeof config?.sellAdjustment === 'number' ? config.sellAdjustment : 0;

  let buyPrice: number | null = null;
  if (apiBuyPrice !== null && apiBuyPrice > 0) {
    const adjusted = apiBuyPrice + buyAdjustment;
    buyPrice = adjusted > 0 ? adjusted : null;
  }

  let sellPrice: number | null = null;
  if (apiSellPrice !== null && apiSellPrice > 0) {
    const adjusted = apiSellPrice + sellAdjustment;
    sellPrice = adjusted > 0 ? adjusted : null;
  }

  const isBuyActive = buyPrice !== null && buyPrice > 0;
  const isSellActive = sellPrice !== null && sellPrice > 0;
  const isPricePending = !isBuyActive && !isSellActive;

  return {
    buyPrice,
    sellPrice,
    isBuyActive,
    isSellActive,
    isPricePending,
  };
}

/**
 * Validates product configuration for Admin before saving
 */
export function validateProductConfig(
  config: Partial<ProductServerConfig>,
  apiBuyPrice: number | null,
  apiSellPrice: number | null
): { isValid: boolean; error?: string } {
  const priceMode: PriceMode = config.priceMode || 'api';

  if (priceMode === 'api') {
    const buyAdjustment = config.buyAdjustment ?? 0;
    const sellAdjustment = config.sellAdjustment ?? 0;

    if (!Number.isFinite(buyAdjustment) || !Number.isFinite(sellAdjustment)) {
      return { isValid: false, error: 'مبالغ اصلاحیه باید اعدادی معتبر باشند.' };
    }

    if (apiBuyPrice !== null && apiBuyPrice > 0 && apiBuyPrice + buyAdjustment <= 0) {
      return {
        isValid: false,
        error: 'اصلاحیه خرید معتبر نیست (قیمت نهایی باید مثبت باشد).',
      };
    }

    if (apiSellPrice !== null && apiSellPrice > 0 && apiSellPrice + sellAdjustment <= 0) {
      return {
        isValid: false,
        error: 'اصلاحیه فروش معتبر نیست (قیمت نهایی باید مثبت باشد).',
      };
    }

    return { isValid: true };
  }

  if (priceMode === 'manual') {
    const manualBuy = config.manualBuyPrice;
    const manualSell = config.manualSellPrice;

    if (manualBuy !== null && manualBuy !== undefined && (!Number.isFinite(manualBuy) || manualBuy < 0)) {
      return { isValid: false, error: 'قیمت خرید دستی باید عددی مثبت باشد.' };
    }

    if (manualSell !== null && manualSell !== undefined && (!Number.isFinite(manualSell) || manualSell < 0)) {
      return { isValid: false, error: 'قیمت فروش دستی باید عددی مثبت باشد.' };
    }

    const hasBuy = manualBuy !== null && manualBuy !== undefined && manualBuy > 0;
    const hasSell = manualSell !== null && manualSell !== undefined && manualSell > 0;

    if (!hasBuy && !hasSell) {
      return {
        isValid: false,
        error: 'در حالت قیمت دستی، وارد کردن حداقل یکی از قیمت‌های خرید یا فروش الزامی است.',
      };
    }

    return { isValid: true };
  }

  return { isValid: true };
}
