import {
  BackendMarketState,
  ManagedProductItem,
  ProductServerConfig,
} from '../types';
import {
  saveAdminProduct,
  saveAdminProducts,
  resetAdminProducts,
} from './apiClient';
import { priceService } from './priceService';
import { PRODUCT_CATALOG, findMatchingApiItem, parseApiPrice } from './productCatalog';
import { calculateEffectiveProductPrice } from '../utils/priceCalculations';
import { getCurrentCycleTimeFormatted } from '../utils/formatters';

export const ADMIN_AUTH_KEY = 'fereshteh_admin_auth';
export const PRICE_UPDATE_EVENT = 'fereshteh_price_updated';

export const adminService = {
  /**
   * Check if current user is authenticated as admin
   */
  isAuthenticated(): boolean {
    try {
      return (
        sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true' ||
        localStorage.getItem(ADMIN_AUTH_KEY) === 'true'
      );
    } catch {
      return false;
    }
  },

  /**
   * Admin login verification
   */
  login(username: string, pass: string): { success: boolean; message?: string } {
    // TEMPORARY DEVELOPMENT ADMIN LOGIN
    // TODO: REMOVE AFTER BACKEND AUTHENTICATION IS CONNECTED
    const isTemporaryDevLogin =
      (username === 'admin' || username.trim() === 'admin') &&
      pass === '123459';

    if (isTemporaryDevLogin) {
      try {
        sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
        localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      } catch (err) {
        console.warn('Storage error during login:', err);
      }
      return { success: true };
    }

    const validUser = 'admin';
    const validPass = 'admin123';

    if (username.trim() === validUser && pass === validPass) {
      try {
        sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
        localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      } catch (err) {
        console.warn('Storage error during login:', err);
      }
      return { success: true };
    }
    return { success: false, message: 'نام کاربری یا رمز عبور اشتباه است.' };
  },

  /**
   * Admin logout
   */
  logout(): void {
    try {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
      localStorage.removeItem(ADMIN_AUTH_KEY);
    } catch (err) {
      console.warn('Storage error during logout:', err);
    }
  },

  /**
   * Builds the comprehensive ManagedProductItem list for the Admin Panel
   * from the consolidated BackendMarketState.
   *
   * Preserves:
   * - website.buyPrice = upstream API sell_price
   * - website.sellPrice = upstream API buy_price
   * - isVisible=false products remain fully present in this list so Admin can manage/restore them
   */
  getManagedProducts(state?: BackendMarketState | null): ManagedProductItem[] {
    const currentState = state || priceService.getCachedState();
    const rawItems = currentState?.marketItems || [];
    const configs = currentState?.productConfigs || {};

    const now = new Date();
    const cycleStartTimeFormatted = getCurrentCycleTimeFormatted(now);

    const processedApiIds = new Set<string>();
    const managedList: ManagedProductItem[] = [];

    // 1. Process standard products in canonical catalog
    for (const p of PRODUCT_CATALOG) {
      const matched = findMatchingApiItem(p, rawItems as any);
      if (matched) {
        processedApiIds.add(matched.id);
      }

      const isBuyActiveOnApi = matched ? matched.is_active !== false && matched.is_buy_active !== false : false;
      const isSellActiveOnApi = matched ? matched.is_active !== false && matched.is_sell_active !== false : false;

      // Upstream Mapping: website.buyPrice = upstream API sell_price; website.sellPrice = upstream API buy_price
      const apiBuyPrice = isBuyActiveOnApi && matched ? parseApiPrice(matched.sell_price) : null;
      const apiSellPrice = isSellActiveOnApi && matched ? parseApiPrice(matched.buy_price) : null;

      const config: ProductServerConfig | undefined = configs[p.id];
      const isVisible = config ? config.isVisible !== false : true;
      const priceMode = config?.priceMode || 'api';
      const buyAdjustment = config?.buyAdjustment ?? 0;
      const sellAdjustment = config?.sellAdjustment ?? 0;
      const manualBuyPrice = config?.manualBuyPrice ?? null;
      const manualSellPrice = config?.manualSellPrice ?? null;

      const { buyPrice, sellPrice, isBuyActive, isSellActive, isPricePending } =
        calculateEffectiveProductPrice(apiBuyPrice, apiSellPrice, config);

      managedList.push({
        id: p.id,
        apiId: matched?.id || p.apiId,
        name: p.name,
        category: p.category,
        buyPrice,
        sellPrice,
        unit: p.unit,
        changeAmount: 0,
        changePercentage: 0,
        direction: 'neutral',
        updatedAt: cycleStartTimeFormatted,
        isHot: p.isHot,
        purity: p.purity,
        weight: p.weight,
        isVisible,
        isRemoved: !isVisible,
        isPricePending,
        isBuyActive,
        isSellActive,
        priceMode,
        buyAdjustment,
        sellAdjustment,
        apiBuyPrice,
        apiSellPrice,
        manualBuyPrice,
        manualSellPrice,
        lastEditedAt: config?.updatedAt,
        // Deprecated compat
        priceSource: priceMode,
        manualOverride: priceMode === 'manual',
      });
    }

    // 2. Process any newly discovered dynamic API items
    for (const apiItem of rawItems) {
      if (!processedApiIds.has(apiItem.id)) {
        const isBuyActiveOnApi = apiItem.is_active !== false && apiItem.is_buy_active !== false;
        const isSellActiveOnApi = apiItem.is_active !== false && apiItem.is_sell_active !== false;

        const apiBuyPrice = isBuyActiveOnApi ? parseApiPrice(apiItem.sell_price) : null;
        const apiSellPrice = isSellActiveOnApi ? parseApiPrice(apiItem.buy_price) : null;

        const config: ProductServerConfig | undefined = configs[apiItem.id];
        const isVisible = config ? config.isVisible !== false : true;
        const priceMode = config?.priceMode || 'api';
        const buyAdjustment = config?.buyAdjustment ?? 0;
        const sellAdjustment = config?.sellAdjustment ?? 0;
        const manualBuyPrice = config?.manualBuyPrice ?? null;
        const manualSellPrice = config?.manualSellPrice ?? null;

        const { buyPrice, sellPrice, isBuyActive, isSellActive, isPricePending } =
          calculateEffectiveProductPrice(apiBuyPrice, apiSellPrice, config);

        const isGold = apiItem.title.includes('طلا') || apiItem.unit === 'gram';

        managedList.push({
          id: apiItem.id,
          apiId: apiItem.id,
          name: apiItem.title,
          category: isGold ? 'gold' : 'coin',
          buyPrice,
          sellPrice,
          unit: 'تومان',
          changeAmount: 0,
          changePercentage: 0,
          direction: 'neutral',
          updatedAt: cycleStartTimeFormatted,
          isVisible,
          isRemoved: !isVisible,
          isPricePending,
          isBuyActive,
          isSellActive,
          priceMode,
          buyAdjustment,
          sellAdjustment,
          apiBuyPrice,
          apiSellPrice,
          manualBuyPrice,
          manualSellPrice,
          lastEditedAt: config?.updatedAt,
          priceSource: priceMode,
          manualOverride: priceMode === 'manual',
        });
      }
    }

    return managedList;
  },

  /**
   * Saves one product row configuration to the FastAPI backend (PATCH /api/v1/admin/products/{productId})
   */
  async saveProduct(productId: string, updates: Partial<ProductServerConfig>): Promise<ProductServerConfig> {
    const saved = await saveAdminProduct(productId, updates);

    // Update in-memory state
    const current = priceService.getCachedState();
    if (current) {
      if (!current.productConfigs) {
        current.productConfigs = {};
      }
      current.productConfigs[productId] = {
        ...current.productConfigs[productId],
        ...saved,
      };
      priceService.setBackendState(current);
    }

    this.notifyPriceUpdate();
    return saved;
  },

  /**
   * Saves all dirty product rows to the FastAPI backend (PATCH /api/v1/admin/products)
   */
  async saveAllProducts(
    items: Array<{ id: string } & Partial<ProductServerConfig>>
  ): Promise<void> {
    const res = await saveAdminProducts(items);

    if (res.state) {
      priceService.setBackendState(res.state);
    } else {
      // Re-fetch state
      await priceService.fetchCurrentState();
    }

    this.notifyPriceUpdate();
  },

  /**
   * Resets all product configurations on the backend (POST /api/v1/admin/products/reset)
   * Resets adjustments to 0, mode to 'api', isVisible to true, without deleting API marketItems.
   */
  async resetAllProducts(): Promise<void> {
    const res = await resetAdminProducts();

    if (res.state) {
      priceService.setBackendState(res.state);
    } else {
      await priceService.fetchCurrentState();
    }

    this.notifyPriceUpdate();
  },

  /**
   * Backward-compatibility alias for saveProduct
   */
  async saveProductConfig(productId: string, updates: Partial<ProductServerConfig>): Promise<ProductServerConfig> {
    return this.saveProduct(productId, updates);
  },

  /**
   * Backward-compatibility alias for resetAllProducts
   */
  async resetAllToDefault(): Promise<void> {
    return this.resetAllProducts();
  },

  /**
   * Dispatches price update event for instant public page reactivity
   */
  notifyPriceUpdate(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(PRICE_UPDATE_EVENT));
    }
  },
};
