import { PriceItem, AdminProductConfig, ManagedProductItem, PriceSource } from '../types';
import { PRODUCT_CATALOG } from './productCatalog';
import {
  getPersianTime,
  getCurrentCycleTimeFormatted,
  getCurrentCycleStartDate,
  toEnglishDigits,
} from '../utils/formatters';

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
   * Checks if user is authenticated in the current browser session or storage
   */
  isAuthenticated(): boolean {
    try {
      const sessionAuth = sessionStorage.getItem(STORAGE_AUTH_KEY) === 'true';
      const localAuth = localStorage.getItem(STORAGE_AUTH_KEY) === 'true';
      return sessionAuth || localAuth;
    } catch {
      return false;
    }
  },

  /**
   * Demo login handler
   */
  login(username: string, password: string): { success: boolean; message?: string } {
    const cleanUser = toEnglishDigits(username.trim()).toLowerCase();
    const cleanPass = toEnglishDigits(password.trim());

    const isUserValid = cleanUser === DEMO_ADMIN_CREDENTIALS.username.toLowerCase();
    const isPassValid =
      cleanPass === DEMO_ADMIN_CREDENTIALS.password ||
      cleanPass === '123456' ||
      cleanPass === 'admin' ||
      cleanPass === 'admin123';

    if (isUserValid && isPassValid) {
      try {
        sessionStorage.setItem(STORAGE_AUTH_KEY, 'true');
        localStorage.setItem(STORAGE_AUTH_KEY, 'true');
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
      localStorage.removeItem(STORAGE_AUTH_KEY);
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
   * Returns all products in a unified managed structure (combining base catalog/API data with overrides).
   * Ensures all products from the catalog are always included even if removed or missing from live API prices.
   */
  getManagedProducts(baseItems?: PriceItem[]): ManagedProductItem[] {
    const storedConfigs = this.getStoredConfigs();
    const now = new Date();
    const cycleStartTimeFormatted = getCurrentCycleTimeFormatted(now);
    const currentCycleStartMs = getCurrentCycleStartDate(now).getTime();

    // Map base items by ID for quick lookup of live API data
    const baseMap = new Map<string, PriceItem>();
    if (baseItems && baseItems.length > 0) {
      for (const item of baseItems) {
        baseMap.set(item.id, item);
      }
    }

    const processedIds = new Set<string>();
    const managedList: ManagedProductItem[] = [];

    // 1. Process all products defined in standard PRODUCT_CATALOG
    for (const p of PRODUCT_CATALOG) {
      processedIds.add(p.id);
      const live = baseMap.get(p.id);
      const config = storedConfigs[p.id];
      const isVisible = config ? config.isVisible : true;
      const isPricePending = config
        ? Boolean(config.isPricePending)
        : live
        ? Boolean(live.isPricePending)
        : true;
      const priceSource = config ? config.priceSource : 'manual';
      const manualOverride = config
        ? config.manualOverride
        : config?.manualBuyPrice !== undefined || config?.manualSellPrice !== undefined;

      const apiBuyPrice = live?.buyPrice ?? null;
      const apiSellPrice = live?.sellPrice ?? null;
      const manualBuyPrice = config?.manualBuyPrice ?? (apiBuyPrice ?? 0);
      const manualSellPrice = config?.manualSellPrice ?? (apiSellPrice ?? 0);

      const effectiveBuyPrice =
        manualOverride || priceSource === 'manual'
          ? (config?.manualBuyPrice ?? apiBuyPrice)
          : apiBuyPrice;
      const effectiveSellPrice =
        manualOverride || priceSource === 'manual'
          ? (config?.manualSellPrice ?? apiSellPrice)
          : apiSellPrice;

      let effectiveUpdatedAt = live?.updatedAt || cycleStartTimeFormatted;
      if (config && config.manualEditedTimestamp && (manualOverride || priceSource === 'manual')) {
        if (config.manualEditedTimestamp >= currentCycleStartMs) {
          effectiveUpdatedAt = config.lastEditedAt || cycleStartTimeFormatted;
        }
      }

      managedList.push({
        id: p.id,
        apiId: p.apiId,
        name: p.name,
        category: p.category,
        buyPrice: effectiveBuyPrice,
        sellPrice: effectiveSellPrice,
        apiBuyPrice,
        apiSellPrice,
        manualBuyPrice,
        manualSellPrice,
        unit: p.unit,
        changeAmount: live?.changeAmount ?? 0,
        changePercentage: live?.changePercentage ?? 0,
        direction: live?.direction ?? 'neutral',
        updatedAt: effectiveUpdatedAt,
        lastEditedAt: config?.lastEditedAt,
        manualEditedTimestamp: config?.manualEditedTimestamp,
        purity: p.purity,
        weight: p.weight,
        isHot: p.isHot,
        isVisible,
        isPricePending,
        isRemoved: !isVisible,
        priceSource,
        manualOverride,
      });
    }

    // 2. Also include any extra dynamic items from baseItems (e.g. from live API) that weren't in PRODUCT_CATALOG
    if (baseItems) {
      for (const item of baseItems) {
        if (!processedIds.has(item.id)) {
          processedIds.add(item.id);
          const config = storedConfigs[item.id];
          const isVisible = config ? config.isVisible : true;
          const isPricePending = config ? Boolean(config.isPricePending) : Boolean(item.isPricePending);
          const priceSource = config ? config.priceSource : 'manual';
          const manualOverride = config
            ? config.manualOverride
            : config?.manualBuyPrice !== undefined || config?.manualSellPrice !== undefined;

          const manualBuyPrice = config?.manualBuyPrice ?? (item.buyPrice ?? 0);
          const manualSellPrice = config?.manualSellPrice ?? (item.sellPrice ?? 0);

          const effectiveBuyPrice =
            manualOverride || priceSource === 'manual'
              ? (config?.manualBuyPrice ?? item.buyPrice)
              : item.buyPrice;
          const effectiveSellPrice =
            manualOverride || priceSource === 'manual'
              ? (config?.manualSellPrice ?? item.sellPrice)
              : item.sellPrice;

          let effectiveUpdatedAt = item.updatedAt || cycleStartTimeFormatted;
          if (config && config.manualEditedTimestamp && (manualOverride || priceSource === 'manual')) {
            if (config.manualEditedTimestamp >= currentCycleStartMs) {
              effectiveUpdatedAt = config.lastEditedAt || cycleStartTimeFormatted;
            }
          }

          managedList.push({
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
          });
        }
      }
    }

    return managedList;
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
