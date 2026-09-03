import { PriceItem, CoinBubbleItem, HistoricalPricePoint, ApiPriceItem, TrendDirection } from '../types';
import { fetchApiPrices } from './apiClient';
import { PRODUCT_CATALOG, findMatchingApiItem, parseApiPrice, CatalogProductDefinition } from './productCatalog';
import { adminService } from './adminService';
import { getCurrentCycleTimeFormatted, getCurrentCycleStartDate } from '../utils/formatters';

interface PriceHistoryEntry {
  previousSell: number | null;
  previousBuy: number | null;
  highToday: number | null;
  lowToday: number | null;
  lastUpdated: string;
}

// In-memory runtime cache for tracking legitimate price movements across polling cycles
const priceMovementCache: Record<string, PriceHistoryEntry> = {};

interface LastKnownPriceEntry {
  buyPrice: number | null;
  sellPrice: number | null;
}

// In-memory runtime cache for retaining the last valid price per coin across polling cycles
const lastKnownPricesCache: Record<string, LastKnownPriceEntry> = {};

function getLastKnownPrice(id: string, altId?: string): LastKnownPriceEntry | undefined {
  return lastKnownPricesCache[id] || (altId ? lastKnownPricesCache[altId] : undefined);
}

function updateLastKnownPrice(
  id: string,
  buyPrice: number | null,
  sellPrice: number | null,
  altId?: string
): void {
  const existing = getLastKnownPrice(id, altId);
  const entry: LastKnownPriceEntry = {
    buyPrice: buyPrice !== null && buyPrice > 0 ? buyPrice : (existing?.buyPrice ?? null),
    sellPrice: sellPrice !== null && sellPrice > 0 ? sellPrice : (existing?.sellPrice ?? null),
  };

  lastKnownPricesCache[id] = entry;
  if (altId) {
    lastKnownPricesCache[altId] = entry;
  }
}

/**
 * Calculates legitimate real-time price change between consecutive API polling responses
 */
function calculatePriceMovement(
  id: string,
  currentSell: number | null,
  currentBuy: number | null
): {
  changeAmount: number;
  changePercentage: number;
  direction: TrendDirection;
  highToday: number | null;
  lowToday: number | null;
} {
  const effectivePrice = currentSell ?? currentBuy;

  if (effectivePrice === null || effectivePrice <= 0) {
    return {
      changeAmount: 0,
      changePercentage: 0,
      direction: 'neutral',
      highToday: null,
      lowToday: null,
    };
  }

  const cached = priceMovementCache[id];

  if (!cached || (cached.previousSell === null && cached.previousBuy === null)) {
    // Initial data point: record base high/low
    priceMovementCache[id] = {
      previousSell: currentSell,
      previousBuy: currentBuy,
      highToday: effectivePrice,
      lowToday: effectivePrice,
      lastUpdated: new Date().toISOString(),
    };

    return {
      changeAmount: 0,
      changePercentage: 0,
      direction: 'neutral',
      highToday: effectivePrice,
      lowToday: effectivePrice,
    };
  }

  const prevBase = cached.previousSell ?? cached.previousBuy ?? effectivePrice;
  const changeAmount = effectivePrice - prevBase;
  const changePercentage = prevBase > 0 ? (changeAmount / prevBase) * 100 : 0;
  const direction: TrendDirection = changeAmount > 0 ? 'up' : changeAmount < 0 ? 'down' : 'neutral';

  const newHigh = cached.highToday !== null ? Math.max(cached.highToday, effectivePrice) : effectivePrice;
  const newLow = cached.lowToday !== null ? Math.min(cached.lowToday, effectivePrice) : effectivePrice;

  // Update cache
  priceMovementCache[id] = {
    previousSell: currentSell ?? cached.previousSell,
    previousBuy: currentBuy ?? cached.previousBuy,
    highToday: newHigh,
    lowToday: newLow,
    lastUpdated: new Date().toISOString(),
  };

  return {
    changeAmount,
    changePercentage: Number(changePercentage.toFixed(2)),
    direction,
    highToday: newHigh,
    lowToday: newLow,
  };
}

/**
 * Transforms raw API response items and catalog definitions into unified PriceItem structures
 */
function mapToPriceItems(apiItems: ApiPriceItem[], cycleTimeFormatted: string): PriceItem[] {
  const processedApiIds = new Set<string>();
  const results: PriceItem[] = [];

  // 1. Process standard products in catalog
  for (const def of PRODUCT_CATALOG) {
    const matchedApiItem = findMatchingApiItem(def, apiItems);
    const stableKey = def.id;
    const secondaryKey = matchedApiItem?.id || def.apiId;
    const cached = getLastKnownPrice(stableKey, secondaryKey);

    if (matchedApiItem) {
      processedApiIds.add(matchedApiItem.id);

      const isOverallActive = matchedApiItem.is_active !== false;
      const isBuyActive = isOverallActive && matchedApiItem.is_buy_active !== false;
      const isSellActive = isOverallActive && matchedApiItem.is_sell_active !== false;

      // Existing price mapping rule:
      // website.buyPrice = API.sell_price
      // website.sellPrice = API.buy_price
      const incomingBuyPrice = isBuyActive ? parseApiPrice(matchedApiItem.sell_price) : null;
      const incomingSellPrice = isSellActive ? parseApiPrice(matchedApiItem.buy_price) : null;

      // Retain last known valid price per side if incoming value is missing or unavailable
      const effectiveBuyPrice =
        incomingBuyPrice !== null && incomingBuyPrice > 0
          ? incomingBuyPrice
          : (cached?.buyPrice ?? null);

      const effectiveSellPrice =
        incomingSellPrice !== null && incomingSellPrice > 0
          ? incomingSellPrice
          : (cached?.sellPrice ?? null);

      if (effectiveBuyPrice !== null || effectiveSellPrice !== null) {
        updateLastKnownPrice(stableKey, effectiveBuyPrice, effectiveSellPrice, secondaryKey);
      }

      const isPricePending = effectiveBuyPrice === null && effectiveSellPrice === null;
      const movement = calculatePriceMovement(def.id, effectiveSellPrice, effectiveBuyPrice);

      results.push({
        id: def.id,
        apiId: matchedApiItem.id,
        name: def.name,
        category: def.category,
        buyPrice: effectiveBuyPrice,
        sellPrice: effectiveSellPrice,
        unit: def.unit,
        changeAmount: movement.changeAmount,
        changePercentage: movement.changePercentage,
        direction: movement.direction,
        highToday: movement.highToday,
        lowToday: movement.lowToday,
        updatedAt: cycleTimeFormatted,
        isHot: def.isHot,
        purity: def.purity,
        weight: def.weight,
        isPricePending,
        isBuyActive: effectiveBuyPrice !== null,
        isSellActive: effectiveSellPrice !== null,
      });
    } else {
      // Product in frontend but not in API response: check for retained last valid price
      const effectiveBuyPrice = cached?.buyPrice ?? null;
      const effectiveSellPrice = cached?.sellPrice ?? null;
      const hasAnyPrice = effectiveBuyPrice !== null || effectiveSellPrice !== null;

      const movement = hasAnyPrice
        ? calculatePriceMovement(def.id, effectiveSellPrice, effectiveBuyPrice)
        : {
            changeAmount: 0,
            changePercentage: 0,
            direction: 'neutral' as TrendDirection,
            highToday: null,
            lowToday: null,
          };

      results.push({
        id: def.id,
        apiId: def.apiId,
        name: def.name,
        category: def.category,
        buyPrice: effectiveBuyPrice,
        sellPrice: effectiveSellPrice,
        unit: def.unit,
        changeAmount: movement.changeAmount,
        changePercentage: movement.changePercentage,
        direction: movement.direction,
        highToday: movement.highToday,
        lowToday: movement.lowToday,
        updatedAt: cycleTimeFormatted,
        isHot: def.isHot,
        purity: def.purity,
        weight: def.weight,
        isPricePending: !hasAnyPrice,
        isBuyActive: effectiveBuyPrice !== null,
        isSellActive: effectiveSellPrice !== null,
      });
    }
  }

  // 2. Process any newly discovered dynamic API items not covered by catalog
  for (const apiItem of apiItems) {
    if (!processedApiIds.has(apiItem.id)) {
      const stableKey = apiItem.id;
      const cached = getLastKnownPrice(stableKey);

      const isOverallActive = apiItem.is_active !== false;
      const isBuyActive = isOverallActive && apiItem.is_buy_active !== false;
      const isSellActive = isOverallActive && apiItem.is_sell_active !== false;

      const incomingBuyPrice = isBuyActive ? parseApiPrice(apiItem.sell_price) : null;
      const incomingSellPrice = isSellActive ? parseApiPrice(apiItem.buy_price) : null;

      const effectiveBuyPrice =
        incomingBuyPrice !== null && incomingBuyPrice > 0
          ? incomingBuyPrice
          : (cached?.buyPrice ?? null);

      const effectiveSellPrice =
        incomingSellPrice !== null && incomingSellPrice > 0
          ? incomingSellPrice
          : (cached?.sellPrice ?? null);

      if (effectiveBuyPrice !== null || effectiveSellPrice !== null) {
        updateLastKnownPrice(stableKey, effectiveBuyPrice, effectiveSellPrice);
      }

      const isPricePending = effectiveBuyPrice === null && effectiveSellPrice === null;
      const isGold = apiItem.title.includes('طلا') || apiItem.unit === 'gram';
      const movement = calculatePriceMovement(apiItem.id, effectiveSellPrice, effectiveBuyPrice);

      results.push({
        id: apiItem.id,
        apiId: apiItem.id,
        name: apiItem.title,
        category: isGold ? 'gold' : 'coin',
        buyPrice: effectiveBuyPrice,
        sellPrice: effectiveSellPrice,
        unit: 'تومان',
        changeAmount: movement.changeAmount,
        changePercentage: movement.changePercentage,
        direction: movement.direction,
        highToday: movement.highToday,
        lowToday: movement.lowToday,
        updatedAt: cycleTimeFormatted,
        isPricePending,
        isBuyActive: effectiveBuyPrice !== null,
        isSellActive: effectiveSellPrice !== null,
      });
    }
  }

  return results;
}

/**
 * Applies admin manual overrides, visibility filtering, and global 15-minute cycle timestamps
 */
function applyStoredOverrides(items: PriceItem[]): PriceItem[] {
  const configs = adminService.getStoredConfigs();
  const now = new Date();
  const cycleStartTimeFormatted = getCurrentCycleTimeFormatted(now);
  const currentCycleStartMs = getCurrentCycleStartDate(now).getTime();

  return items
    .filter((item) => {
      const config = configs[item.id];
      // If marked as removed/not visible, hide completely (takes absolute priority)
      if (config && config.isVisible === false) {
        return false;
      }
      return true;
    })
    .map((item) => {
      const config = configs[item.id];
      let buyPrice = item.buyPrice;
      let sellPrice = item.sellPrice;
      let isPricePending = Boolean(item.isPricePending);
      let isBuyActive = item.isBuyActive;
      let isSellActive = item.isSellActive;
      let effectiveUpdatedAt = item.updatedAt || cycleStartTimeFormatted;

      if (config) {
        if (config.isPricePending !== undefined) {
          isPricePending = Boolean(config.isPricePending);
        }

        const manualOverride = config.manualOverride || config.priceSource === 'manual';
        if (manualOverride && config.manualBuyPrice !== undefined && config.manualBuyPrice > 0) {
          buyPrice = config.manualBuyPrice;
          isBuyActive = true;
          if (isPricePending && config.isPricePending === false) {
            isPricePending = false;
          }
        }
        if (manualOverride && config.manualSellPrice !== undefined && config.manualSellPrice > 0) {
          sellPrice = config.manualSellPrice;
          isSellActive = true;
          if (isPricePending && config.isPricePending === false) {
            isPricePending = false;
          }
        }
        if (config.manualEditedTimestamp && manualOverride) {
          if (config.manualEditedTimestamp >= currentCycleStartMs) {
            effectiveUpdatedAt = config.lastEditedAt || cycleStartTimeFormatted;
          }
        }
      }

      return {
        ...item,
        buyPrice,
        sellPrice,
        isPricePending,
        isBuyActive,
        isSellActive,
        isRemoved: false,
        updatedAt: effectiveUpdatedAt,
      };
    });
}

/**
 * Service for fetching Gold, Silver & Coin prices directly from the /result API endpoint
 */
export const priceService = {
  /**
   * Fetches all live prices directly without filtering out removed items (specifically for Admin Panel management)
   */
  async getAllPricesForAdmin(): Promise<PriceItem[]> {
    const now = new Date();
    const cycleTimeFormatted = getCurrentCycleTimeFormatted(now);

    try {
      const apiItems = await fetchApiPrices();
      return mapToPriceItems(apiItems, cycleTimeFormatted);
    } catch (err) {
      console.warn('[priceService] API fetch failed for admin, rendering catalog with waiting states:', err);
      return mapToPriceItems([], cycleTimeFormatted);
    }
  },

  /**
   * Fetches all prices dynamically from the live API
   */
  async getAllPrices(): Promise<PriceItem[]> {
    const now = new Date();
    const cycleTimeFormatted = getCurrentCycleTimeFormatted(now);

    try {
      const apiItems = await fetchApiPrices();
      const mapped = mapToPriceItems(apiItems, cycleTimeFormatted);
      return applyStoredOverrides(mapped);
    } catch (err) {
      console.warn('[priceService] API fetch failed, rendering catalog with waiting states:', err);
      // Generate catalog items with pending/waiting state (NO fake mock prices)
      const pendingItems = mapToPriceItems([], cycleTimeFormatted);
      return applyStoredOverrides(pendingItems);
    }
  },

  /**
   * Fetches all visible gold prices
   */
  async getGoldPrices(): Promise<PriceItem[]> {
    const all = await this.getAllPrices();
    return all.filter((item) => item.category === 'gold' || item.category === 'global');
  },

  /**
   * Fetches all visible coin and precious metal prices
   */
  async getCoinPrices(): Promise<PriceItem[]> {
    const all = await this.getAllPrices();
    return all.filter((item) => item.category === 'coin');
  },

  /**
   * Calculates coin bubbles using live prices
   */
  async getCoinBubbles(): Promise<CoinBubbleItem[]> {
    const allPrices = await this.getAllPrices();
    const configs = adminService.getStoredConfigs();
    const now = new Date();
    const cycleStartTimeFormatted = getCurrentCycleTimeFormatted(now);

    const gold18k = allPrices.find((p) => p.id === 'gold-18k');
    const gold18kSellPrice = gold18k && !gold18k.isPricePending ? gold18k.sellPrice : null;

    const coinWeightMap: Record<string, { name: string; prodId: string; weight: number }> = {
      'bubble-emami': { name: 'حباب سکه امامی', prodId: 'coin-emami', weight: 8.133 },
      'bubble-bahar': { name: 'حباب سکه بهار آزادی', prodId: 'coin-bahar-azadi', weight: 8.133 },
      'bubble-nim': { name: 'حباب نیم سکه', prodId: 'coin-nim', weight: 4.066 },
      'bubble-rob': { name: 'حباب ربع سکه', prodId: 'coin-rob', weight: 2.033 },
      'bubble-gerami': { name: 'حباب سکه گرمی', prodId: 'coin-gerami', weight: 1.01 },
    };

    const bubbles: CoinBubbleItem[] = [];

    for (const [bubbleId, meta] of Object.entries(coinWeightMap)) {
      const prod = allPrices.find((p) => p.id === meta.prodId);
      const isVisible = !(configs[meta.prodId] && configs[meta.prodId].isVisible === false);

      if (!isVisible) continue;

      const coinSellPrice = prod && !prod.isPricePending ? prod.sellPrice : null;

      // Only calculate if both coin and 18k gold sell prices are available from API
      if (gold18kSellPrice && coinSellPrice && gold18kSellPrice > 0 && coinSellPrice > 0) {
        // Intrinsic Gold Value = (18K Price / 750) * 900 * Weight
        const realValue = Math.round((gold18kSellPrice / 750) * 900 * meta.weight);
        const bubbleAmount = Math.max(0, coinSellPrice - realValue);
        const bubblePercentage = Number(((bubbleAmount / coinSellPrice) * 100).toFixed(2));

        bubbles.push({
          id: bubbleId,
          name: meta.name,
          price: coinSellPrice,
          realValue,
          bubbleAmount,
          bubblePercentage,
          direction: 'up',
          updatedAt: cycleStartTimeFormatted,
          isPricePending: false,
        });
      } else {
        // Waiting state for bubble calculation
        bubbles.push({
          id: bubbleId,
          name: meta.name,
          price: coinSellPrice ?? 0,
          realValue: 0,
          bubbleAmount: 0,
          bubblePercentage: 0,
          direction: 'neutral',
          updatedAt: cycleStartTimeFormatted,
          isPricePending: true,
        });
      }
    }

    return bubbles;
  },

  /**
   * Fetches historical trend data for charts.
   * Handles absence of time-series endpoint by returning current real-time data point.
   */
  async getHistoricalData(
    symbol: string,
    _timeframe: '1D' | '1W' | '1M'
  ): Promise<HistoricalPricePoint[]> {
    const allPrices = await this.getAllPrices();
    const item = allPrices.find((p) => p.id === symbol);

    if (item && item.sellPrice && !item.isPricePending) {
      return [
        {
          time: 'نرخ لحظه‌ای',
          price: item.sellPrice,
          formattedPrice: item.sellPrice.toLocaleString('fa-IR'),
        },
      ];
    }

    return [];
  },
};
