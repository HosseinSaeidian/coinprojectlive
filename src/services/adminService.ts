import { PriceItem, AdminProductConfig, ManagedProductItem, PriceSource } from '../types';
import { PRODUCT_CATALOG } from './productCatalog';
import { getPersianTime, getCurrentCycleTimeFormatted, getCurrentCycleStartDate } from '../utils/formatters';

/**
 * Admin Service for Fereshteh Coin
 * Provides demo authentication, local storage configuration persistence, and reactive updates.
 */

const STORAGE_AUTH_KEY = 'fereshteh_admin_session_auth';
const STORAGE_CONFIGS_KEY = 'fereshteh_products_config_v1';
export const PRICE_UPDATE_EVENT = 'fereshteh_price_update';

// Admin Credentials (Authentication layer)
export const DEMO_ADMIN_CREDENTIALS = {
  username: 'admin',
  password: '123459',
};

export const adminService = {
  /**
   * Checks if user is authenticated in the current browser session
   */
  isAuthenticated(): boolean {
    try {
      return sessionStorage.getItem(STORAGE_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  },

  /**
   * Demo login handler
   */
  login(username: string, password: string): { success: boolean; message?: string } {
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (
      cleanUser === DEMO_ADMIN_CREDENTIALS.username &&
      cleanPass === DEMO_ADMIN_CREDENTIALS.password
    ) {
      try {
        sessionStorage.setItem(STORAGE_AUTH_KEY, 'true');
        return { success: true };
      } catch {
        return { success: false, message: 'خطا در ذخیره‌سازی نشست مرورگر' };
      }
    }

    return {
      success: false,
      message: 'نام کاربری یا رمز عبور اشتباه است.',
    };
  },

  /**
   * Logs out admin
   */
  logout(): void {
    try {
      sessionStorage.removeItem(STORAGE_AUTH_KEY);
    } catch (err) {
      console.error('Logout error:', err);
    }
  },

  /**
   * Retrieves stored product override configurations
   */
  getStoredConfigs(): Record<string, AdminProductConfig> {
    try {
      const raw = localStorage.getItem(STORAGE_CONFIGS_KEY);
      if (!raw) return {};
      return JSON.parse(raw) || {};
    } catch {
      return {};
    }
  },

  /**
   * Saves product override configurations
   */
  saveStoredConfigs(configs: Record<string, AdminProductConfig>): void {
    try {
      localStorage.setItem(STORAGE_CONFIGS_KEY, JSON.stringify(configs));
      this.notifyPriceUpdate();
    } catch (err) {
      console.error('Failed to save product configs to localStorage:', err);
    }
  },

  /**
   * Returns all products in a unified managed structure (combining base catalog/API data with overrides)
   */
  getManagedProducts(baseItems?: PriceItem[]): ManagedProductItem[] {
    const items: PriceItem[] =
      baseItems && baseItems.length > 0
        ? baseItems
        : PRODUCT_CATALOG.map((p) => ({
            id: p.id,
            apiId: p.apiId,
            name: p.name,
            category: p.category,
            buyPrice: null,
            sellPrice: null,
            unit: p.unit,
            changeAmount: 0,
            changePercentage: 0,
            direction: 'neutral',
            updatedAt: getCurrentCycleTimeFormatted(),
            purity: p.purity,
            weight: p.weight,
            isPricePending: true,
          }));

    const storedConfigs = this.getStoredConfigs();
    const now = new Date();
    const cycleStartTimeFormatted = getCurrentCycleTimeFormatted(now);
    const currentCycleStartMs = getCurrentCycleStartDate(now).getTime();

    return items.map((item) => {
      const config = storedConfigs[item.id];
      const isVisible = config ? config.isVisible : true;
      const isPricePending = config ? Boolean(config.isPricePending) : Boolean(item.isPricePending);
      const priceSource = config ? config.priceSource : 'manual';
      const manualOverride = config
        ? config.manualOverride
        : config?.manualBuyPrice !== undefined || config?.manualSellPrice !== undefined;

      const manualBuyPrice = config?.manualBuyPrice ?? (item.buyPrice ?? 0);
      const manualSellPrice = config?.manualSellPrice ?? (item.sellPrice ?? 0);

      // Calculate effective active price
      const effectiveBuyPrice =
        manualOverride || priceSource === 'manual'
          ? (config?.manualBuyPrice ?? item.buyPrice)
          : item.buyPrice;
      const effectiveSellPrice =
        manualOverride || priceSource === 'manual'
          ? (config?.manualSellPrice ?? item.sellPrice)
          : item.sellPrice;

      let effectiveUpdatedAt = cycleStartTimeFormatted;
      if (config && config.manualEditedTimestamp && (manualOverride || priceSource === 'manual')) {
        if (config.manualEditedTimestamp >= currentCycleStartMs) {
          effectiveUpdatedAt = config.lastEditedAt || cycleStartTimeFormatted;
        }
      }

      return {
        ...item,
        buyPrice: effectiveBuyPrice,
        sellPrice: effectiveSellPrice,
        apiBuyPrice: item.buyPrice,
        apiSellPrice: item.sellPrice,
        manualBuyPrice,
        manualSellPrice,
        isVisible,
        isPricePending,
        isRemoved: !isVisible,
        priceSource,
        manualOverride,
        updatedAt: effectiveUpdatedAt,
        lastEditedAt: config?.lastEditedAt,
        manualEditedTimestamp: config?.manualEditedTimestamp,
      };
    });
  },

  /**
   * Updates a single product configuration
   */
  updateProductConfig(id: string, updates: Partial<AdminProductConfig>): void {
    const configs = this.getStoredConfigs();
    const current = configs[id] || {
      id,
      isVisible: true,
      isPricePending: false,
      priceSource: 'manual',
      manualOverride: true,
    };

    const now = new Date();
    const isManualPriceEdit =
      updates.manualBuyPrice !== undefined ||
      updates.manualSellPrice !== undefined ||
      updates.priceSource === 'manual' ||
      updates.manualOverride === true;

    configs[id] = {
      ...current,
      ...updates,
      id,
      lastEditedAt: getPersianTime(now),
      manualEditedTimestamp: isManualPriceEdit ? now.getTime() : current.manualEditedTimestamp,
    };

    this.saveStoredConfigs(configs);
  },

  /**
   * Updates multiple product configurations at once
   */
  updateMultipleConfigs(items: { id: string; config: Partial<AdminProductConfig> }[]): void {
    const configs = this.getStoredConfigs();
    const now = new Date();
    const formattedNow = getPersianTime(now);
    const nowTimestamp = now.getTime();

    items.forEach(({ id, config }) => {
      const current = configs[id] || {
        id,
        isVisible: true,
        isPricePending: false,
        priceSource: 'manual',
        manualOverride: true,
      };

      const isManualPriceEdit =
        config.manualBuyPrice !== undefined ||
        config.manualSellPrice !== undefined ||
        config.priceSource === 'manual' ||
        config.manualOverride === true;

      configs[id] = {
        ...current,
        ...config,
        id,
        lastEditedAt: formattedNow,
        manualEditedTimestamp: isManualPriceEdit ? nowTimestamp : current.manualEditedTimestamp,
      };
    });

    this.saveStoredConfigs(configs);
  },

  /**
   * Resets all prices and visibilities back to default market values
   */
  resetAllToDefault(): void {
    try {
      localStorage.removeItem(STORAGE_CONFIGS_KEY);
      this.notifyPriceUpdate();
    } catch (err) {
      console.error('Reset error:', err);
    }
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
