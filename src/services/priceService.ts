import {
  PriceItem,
  CoinBubbleItem,
  HistoricalPricePoint,
  TrendDirection,
  BackendMarketState,
  BackendRawMarketItem,
  ProductServerConfig,
} from '../types';
import { syncMarket, getMarketState } from './apiClient';
import { PRODUCT_CATALOG, findMatchingApiItem, parseApiPrice } from './productCatalog';
import { calculateEffectiveProductPrice } from '../utils/priceCalculations';
import { getCurrentCycleTimeFormatted } from '../utils/formatters';

interface PriceHistoryEntry {
  previousSell: number | null;
  previousBuy: number | null;
  highToday: number | null;
  lowToday: number | null;
  lastUpdated: string;
}

// In-memory runtime cache for tracking legitimate price movements across polling cycles
const priceMovementCache: Record<string, PriceHistoryEntry> = {};

// In-memory cached state returned by FastAPI backend
let currentBackendState: BackendMarketState | null = null;
let activeSyncPromise: Promise<BackendMarketState> | null = null;
let activeFetchStatePromise: Promise<BackendMarketState> | null = null;

/**
 * Calculates legitimate real-time price change between consecutive polling responses
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
 * Maps BackendMarketState (persisted marketItems + productConfigs) into unified PriceItem structures.
 *
 * MAPPING RULE:
 * website.buyPrice = upstream API sell_price (before adjustment)
 * website.sellPrice = upstream API buy_price (before adjustment)
 * DO NOT reverse this mapping!
 */
export function mapBackendStateToPriceItems(
  state: BackendMarketState,
  cycleTimeFormatted: string,
  includeHidden = false
): PriceItem[] {
  const processedApiIds = new Set<string>();
  const results: PriceItem[] = [];
  const rawItems = state.marketItems || [];
  const configs = state.productConfigs || {};

  // 1. Process standard products in canonical PRODUCT_CATALOG
  for (const def of PRODUCT_CATALOG) {
    const matched = findMatchingApiItem(def, rawItems as any);
    if (matched) {
      processedApiIds.add(matched.id);
    }

    const isBuyActiveOnApi = matched ? matched.is_active !== false && matched.is_buy_active !== false : false;
    const isSellActiveOnApi = matched ? matched.is_active !== false && matched.is_sell_active !== false : false;

    // Upstream Mapping: website.buyPrice = upstream API sell_price; website.sellPrice = upstream API buy_price
    const apiBuyPrice = isBuyActiveOnApi && matched ? parseApiPrice(matched.sell_price) : null;
    const apiSellPrice = isSellActiveOnApi && matched ? parseApiPrice(matched.buy_price) : null;

    const config: ProductServerConfig | undefined = configs[def.id];
    const isVisible = config ? config.isVisible !== false : true;

    // Filter hidden products from public site
    if (!includeHidden && !isVisible) {
      continue;
    }

    const { buyPrice, sellPrice, isBuyActive, isSellActive, isPricePending } =
      calculateEffectiveProductPrice(apiBuyPrice, apiSellPrice, config);

    const movement = calculatePriceMovement(def.id, sellPrice, buyPrice);

    results.push({
      id: def.id,
      apiId: matched?.id || def.apiId,
      name: def.name,
      category: def.category,
      buyPrice,
      sellPrice,
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
      isBuyActive,
      isSellActive,
      isRemoved: !isVisible,
    });
  }

  // 2. Process any newly discovered dynamic API items not covered by catalog
  for (const apiItem of rawItems) {
    if (!processedApiIds.has(apiItem.id)) {
      const isBuyActiveOnApi = apiItem.is_active !== false && apiItem.is_buy_active !== false;
      const isSellActiveOnApi = apiItem.is_active !== false && apiItem.is_sell_active !== false;

      const apiBuyPrice = isBuyActiveOnApi ? parseApiPrice(apiItem.sell_price) : null;
      const apiSellPrice = isSellActiveOnApi ? parseApiPrice(apiItem.buy_price) : null;

      const config: ProductServerConfig | undefined = configs[apiItem.id];
      const isVisible = config ? config.isVisible !== false : true;

      if (!includeHidden && !isVisible) {
        continue;
      }

      const { buyPrice, sellPrice, isBuyActive, isSellActive, isPricePending } =
        calculateEffectiveProductPrice(apiBuyPrice, apiSellPrice, config);

      const isGold = apiItem.title.includes('طلا') || apiItem.unit === 'gram';
      const movement = calculatePriceMovement(apiItem.id, sellPrice, buyPrice);

      results.push({
        id: apiItem.id,
        apiId: apiItem.id,
        name: apiItem.title,
        category: isGold ? 'gold' : 'coin',
        buyPrice,
        sellPrice,
        unit: 'تومان',
        changeAmount: movement.changeAmount,
        changePercentage: movement.changePercentage,
        direction: movement.direction,
        highToday: movement.highToday,
        lowToday: movement.lowToday,
        updatedAt: cycleTimeFormatted,
        isPricePending,
        isBuyActive,
        isSellActive,
        isRemoved: !isVisible,
      });
    }
  }

  return results;
}

export const priceService = {
  /**
   * Syncs with backend store (POST /api/v1/market/sync).
   * Deduplicates concurrent calls.
   * On failure, retains the last known state so the UI does not crash or replace valid prices with zeros.
   */
  async syncWithBackend(): Promise<BackendMarketState> {
    if (activeSyncPromise) {
      return activeSyncPromise;
    }

    activeSyncPromise = (async () => {
      try {
        const response = await syncMarket();
        if (response && response.state) {
          currentBackendState = response.state;
          return response.state;
        }
        throw new Error('Invalid backend state response');
      } catch (err) {
        console.warn('[priceService] Sync request failed:', err);
        if (currentBackendState) {
          return currentBackendState; // Retain last known state
        }
        // Fallback default state with empty market items
        const fallbackState: BackendMarketState = {
          version: 1,
          marketItems: [],
          productConfigs: {},
          lastSyncAttemptAt: new Date().toISOString(),
          lastSuccessfulSyncAt: null,
        };
        currentBackendState = fallbackState;
        return fallbackState;
      } finally {
        activeSyncPromise = null;
      }
    })();

    return activeSyncPromise;
  },

  /**
   * Fetches latest persisted state without upstream sync (GET /api/v1/market/state)
   */
  async fetchCurrentState(): Promise<BackendMarketState> {
    if (activeFetchStatePromise) {
      return activeFetchStatePromise;
    }

    activeFetchStatePromise = (async () => {
      try {
        const state = await getMarketState();
        if (state) {
          currentBackendState = state;
          return state;
        }
        throw new Error('No state received from getMarketState');
      } catch (err) {
        console.warn('[priceService] getMarketState failed, falling back to syncWithBackend:', err);
        return await this.syncWithBackend();
      } finally {
        activeFetchStatePromise = null;
      }
    })();

    return activeFetchStatePromise;
  },

  /**
   * Returns current in-memory cached state if available, otherwise initiates sync
   */
  async ensureState(forceSync = false): Promise<BackendMarketState> {
    if (forceSync || !currentBackendState) {
      return await this.syncWithBackend();
    }
    return currentBackendState;
  },

  /**
   * Updates in-memory backend state directly (e.g. after admin PATCH)
   */
  setBackendState(state: BackendMarketState): void {
    currentBackendState = state;
  },

  /**
   * Returns current backend state synchronously
   */
  getCachedState(): BackendMarketState | null {
    return currentBackendState;
  },

  /**
   * Fetches all visible prices for the public site (filters out hidden items).
   */
  async getAllPrices(forceSync = false): Promise<PriceItem[]> {
    const state = await this.ensureState(forceSync);
    const now = new Date();
    const cycleTimeFormatted = getCurrentCycleTimeFormatted(now);
    return mapBackendStateToPriceItems(state, cycleTimeFormatted, false);
  },

  /**
   * Fetches all prices for Admin management (includes hidden/removed items).
   */
  async getAllPricesForAdmin(forceSync = false): Promise<PriceItem[]> {
    const state = await this.ensureState(forceSync);
    const now = new Date();
    const cycleTimeFormatted = getCurrentCycleTimeFormatted(now);
    return mapBackendStateToPriceItems(state, cycleTimeFormatted, true);
  },

  /**
   * Fetches all visible gold prices
   */
  async getGoldPrices(forceSync = false): Promise<PriceItem[]> {
    const all = await this.getAllPrices(forceSync);
    return all.filter((item) => item.category === 'gold' || item.category === 'global');
  },

  /**
   * Fetches all visible coin prices
   */
  async getCoinPrices(forceSync = false): Promise<PriceItem[]> {
    const all = await this.getAllPrices(forceSync);
    return all.filter((item) => item.category === 'coin');
  },

  /**
   * Calculates coin bubbles using visible, effective prices.
   * If coin or 18k gold is hidden, the bubble is excluded from public display.
   */
  async getCoinBubbles(forceSync = false): Promise<CoinBubbleItem[]> {
    const allPrices = await this.getAllPrices(forceSync);
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

      // If coin is hidden or not offered, its bubble is excluded
      if (!prod) {
        continue;
      }

      const coinSellPrice = !prod.isPricePending ? prod.sellPrice : null;

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
   * Fetches trend data for charts using final visible prices
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
