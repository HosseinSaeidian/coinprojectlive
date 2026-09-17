import { PriceMode, ProductServerConfig } from '../types';
import { PRODUCT_CATALOG, findMatchingApiItem, parseApiPrice } from '../services/productCatalog';

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

/**
 * Resolves the final/effective buy and sell prices of coin-naqd-farda.
 *
 * Rules:
 * - In API mode: mapped API base price + coin-naqd-farda adjustment
 * - In Manual mode: its manualBuyPrice / manualSellPrice
 * - Uses the project's existing calculateEffectiveProductPrice logic
 * - If final price <= 0, invalid or unavailable, returns null for that side
 */
export function getCoinNaqdFardaFinalPrices(
  rawItems: any[] = [],
  configs: Record<string, Partial<ProductServerConfig>> = {}
): { finalBuyPrice: number | null; finalSellPrice: number | null } {
  const coinDef = PRODUCT_CATALOG.find((p) => p.id === 'coin-naqd-farda');
  const matched = coinDef ? findMatchingApiItem(coinDef, rawItems || []) : undefined;

  const isBuyActiveOnApi = matched ? matched.is_active !== false && matched.is_buy_active !== false : false;
  const isSellActiveOnApi = matched ? matched.is_active !== false && matched.is_sell_active !== false : false;

  // Upstream Mapping: website.buyPrice = upstream API sell_price; website.sellPrice = upstream API buy_price
  const coinApiBuyPrice = isBuyActiveOnApi && matched ? parseApiPrice(matched.sell_price) : null;
  const coinApiSellPrice = isSellActiveOnApi && matched ? parseApiPrice(matched.buy_price) : null;

  const coinConfig = (configs || {})['coin-naqd-farda'];

  const { buyPrice: coinFinalBuy, sellPrice: coinFinalSell } =
    calculateEffectiveProductPrice(coinApiBuyPrice, coinApiSellPrice, coinConfig);

  return {
    finalBuyPrice: coinFinalBuy !== null && Number.isFinite(coinFinalBuy) && coinFinalBuy > 0 ? coinFinalBuy : null,
    finalSellPrice: coinFinalSell !== null && Number.isFinite(coinFinalSell) && coinFinalSell > 0 ? coinFinalSell : null,
  };
}

/**
 * Calculates the derived API base prices for gold-mesghal based on the final/effective
 * prices of coin-naqd-farda.
 *
 * Rules:
 * - gold-mesghal API buy base = coin-naqd-farda final buy price
 * - gold-mesghal API sell base = coin-naqd-farda final sell price
 *
 * If coin-naqd-farda's final price on a side cannot be calculated (or is <= 0),
 * that side remains null (unavailable/pending). Original gold-mesghal upstream
 * price is NEVER used as fallback.
 */
export function getDerivedGoldMesghalBasePrices(
  rawItems: any[] = [],
  configs: Record<string, Partial<ProductServerConfig>> = {}
): { apiBuyPrice: number | null; apiSellPrice: number | null } {
  const { finalBuyPrice, finalSellPrice } = getCoinNaqdFardaFinalPrices(rawItems, configs);
  return {
    apiBuyPrice: finalBuyPrice,
    apiSellPrice: finalSellPrice,
  };
}

/**
 * Conversion constant for deriving gold-18k base prices from coin-naqd-farda final prices.
 */
export const GOLD_18K_CONVERSION_CONSTANT = 4.3318;

/**
 * Calculates the derived API base prices for gold-18k based on the final/effective
 * prices of coin-naqd-farda divided by 4.3318, rounded UP to the nearest 1,000 Toman.
 *
 * Formula:
 * derivedGold18SellBase = Math.ceil((coin-naqd-farda FINAL SELL PRICE / 4.3318) / 1000) * 1000
 * derivedGold18BuyBase  = Math.ceil((coin-naqd-farda FINAL BUY PRICE / 4.3318) / 1000) * 1000
 *
 * Rules:
 * - The source is the FINAL/EFFECTIVE price of coin-naqd-farda (API mode with adjustments OR manual mode).
 * - Division by 4.3318 and ceiling rounding to 1,000 produces the API BASE values of gold-18k (not final prices).
 * - gold-18k keeps its own independent configuration:
 *     finalSellPrice = derivedGold18SellBase + gold-18k sellAdjustment (or manualSellPrice in manual mode)
 *     finalBuyPrice  = derivedGold18BuyBase + gold-18k buyAdjustment (or manualBuyPrice in manual mode)
 * - If coin-naqd-farda's final price on a side is null/invalid/unavailable:
 *     derived gold-18k base for that side remains null (never falls back to upstream gold-18k API price).
 * - Never produces NaN, Infinity, zero, or a negative derived price.
 */
export function getDerivedGold18kBasePrices(
  rawItems: any[] = [],
  configs: Record<string, Partial<ProductServerConfig>> = {}
): { apiBuyPrice: number | null; apiSellPrice: number | null } {
  const { finalBuyPrice, finalSellPrice } = getCoinNaqdFardaFinalPrices(rawItems, configs);

  const derivedBuy =
    finalBuyPrice !== null && Number.isFinite(finalBuyPrice) && finalBuyPrice > 0
      ? Math.ceil((finalBuyPrice / GOLD_18K_CONVERSION_CONSTANT) / 1000) * 1000
      : null;

  const derivedSell =
    finalSellPrice !== null && Number.isFinite(finalSellPrice) && finalSellPrice > 0
      ? Math.ceil((finalSellPrice / GOLD_18K_CONVERSION_CONSTANT) / 1000) * 1000
      : null;

  return {
    apiBuyPrice: derivedBuy !== null && Number.isFinite(derivedBuy) && derivedBuy > 0 ? derivedBuy : null,
    apiSellPrice: derivedSell !== null && Number.isFinite(derivedSell) && derivedSell > 0 ? derivedSell : null,
  };
}

export const GOLD_24K_999_PURITY = 999.9;
export const GOLD_24K_995_PURITY = 995.9;

/**
 * Resolves the final/effective buy and sell prices of gold-18k.
 *
 * Rules:
 * - Source is the derived gold-18k base (from coin-naqd-farda) plus gold-18k's own configuration:
 *     In API mode: derived gold-18k API base + gold-18k buyAdjustment/sellAdjustment
 *     In Manual mode: gold-18k manualBuyPrice / manualSellPrice
 * - Uses the project's existing calculateEffectiveProductPrice logic
 * - If final price on a side is null, undefined, NaN, Infinity, or <= 0, returns null for that side
 */
export function getGold18kFinalPrices(
  rawItems: any[] = [],
  configs: Record<string, Partial<ProductServerConfig>> = {}
): { finalBuyPrice: number | null; finalSellPrice: number | null } {
  const derivedGold18kBase = getDerivedGold18kBasePrices(rawItems, configs);
  const gold18kConfig = (configs || {})['gold-18k'];

  const { buyPrice, sellPrice } = calculateEffectiveProductPrice(
    derivedGold18kBase.apiBuyPrice,
    derivedGold18kBase.apiSellPrice,
    gold18kConfig
  );

  return {
    finalBuyPrice: buyPrice !== null && Number.isFinite(buyPrice) && buyPrice > 0 ? buyPrice : null,
    finalSellPrice: sellPrice !== null && Number.isFinite(sellPrice) && sellPrice > 0 ? sellPrice : null,
  };
}

/**
 * Calculates the derived API base prices for 24K gold based on the final/effective
 * prices of gold-18k and target purity (999.9 for 24k-999, or 995.9 for 24k-995).
 *
 * Formula:
 * derivedGold24kBuy  = (finalGold18kBuy * purity) / 750
 * derivedGold24kSell = (finalGold18kSell * purity) / 750
 *
 * Rules:
 * - Source is the FINAL/EFFECTIVE price of gold-18k (API mode with adjustments OR manual mode).
 * - Target purity uses decimal constants 999.9 or 995.9.
 * - This produces the API BASE / COMPUTED API values of the 24k product (not its final price).
 * - The 24k product keeps its own independent configuration:
 *     finalPrice = apiBasePrice + ownAdjustment (in API mode) or manualPrice (in manual mode)
 * - If final gold-18k price on a side is null, undefined, NaN, Infinity, or <= 0:
 *     derived 24k base for that side remains null (never falls back to raw upstream gold-24k API price).
 * - Never produces NaN, Infinity, zero, or a negative derived price.
 * - No custom or arbitrary rounding is introduced; maintains standard exact formula.
 */
export function getDerivedGold24kBasePrices(
  rawItems: any[] = [],
  configs: Record<string, Partial<ProductServerConfig>> = {},
  purity: number = GOLD_24K_999_PURITY
): { apiBuyPrice: number | null; apiSellPrice: number | null } {
  const { finalBuyPrice, finalSellPrice } = getGold18kFinalPrices(rawItems, configs);

  const derivedBuy =
    finalBuyPrice !== null && Number.isFinite(finalBuyPrice) && finalBuyPrice > 0
      ? (finalBuyPrice * purity) / 750
      : null;

  const derivedSell =
    finalSellPrice !== null && Number.isFinite(finalSellPrice) && finalSellPrice > 0
      ? (finalSellPrice * purity) / 750
      : null;

  return {
    apiBuyPrice: derivedBuy !== null && Number.isFinite(derivedBuy) && derivedBuy > 0 ? derivedBuy : null,
    apiSellPrice: derivedSell !== null && Number.isFinite(derivedSell) && derivedSell > 0 ? derivedSell : null,
  };
}
