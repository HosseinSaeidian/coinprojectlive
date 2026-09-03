import {
  BackendMarketState,
  ProductServerConfig,
  SyncResponse,
  StateResponse,
} from '../types';

/**
 * Centralized FastAPI Backend URL
 * Consumes: VITE_BACKEND_API_BASE_URL (normalized without trailing slashes)
 */
export const BACKEND_API_BASE_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_API_BASE_URL) ||
  'http://localhost:8000'
).replace(/\/+$/, '');

/**
 * Helper to handle HTTP errors and parse JSON responses safely
 */
async function handleResponse<T>(res: Response, fallbackError = 'Request failed'): Promise<T> {
  if (!res.ok) {
    let errorDetail = '';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.error || errJson.message || '';
    } catch {
      // Ignore JSON parse error on non-ok responses
    }
    throw new Error(
      errorDetail
        ? `خطای سرور: ${errorDetail}`
        : `${fallbackError} (کد خطا: ${res.status} ${res.statusText})`
    );
  }
  return (await res.json()) as T;
}

/**
 * 1) POST /api/v1/market/sync
 * Syncs upstream market items with FastAPI persistent store and returns full consolidated state.
 */
export async function syncMarket(): Promise<SyncResponse> {
  const url = `${BACKEND_API_BASE_URL}/api/v1/market/sync`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const json = await handleResponse<any>(response, 'همگام‌سازی با وب‌سرویس انجام نشد');

    // Handle responses formatted as { ok: true, state: { ... } } or { state: { ... } }
    if (json.state) {
      return json as SyncResponse;
    }

    // Direct state response fallback
    if (Array.isArray(json.marketItems)) {
      return {
        ok: true,
        state: json as BackendMarketState,
      };
    }

    return json as SyncResponse;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`[API Client] syncMarket error at ${url}:`, error);
    throw error;
  }
}

/**
 * 2) GET /api/v1/market/state
 * Returns current persisted state without requiring a new upstream call.
 */
export async function getMarketState(): Promise<BackendMarketState> {
  const url = `${BACKEND_API_BASE_URL}/api/v1/market/state`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const json = await handleResponse<StateResponse | BackendMarketState>(
      response,
      'دریافت وضعیت بازار انجام نشد'
    );

    if ('state' in json && json.state) {
      return json.state;
    }
    return json as BackendMarketState;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`[API Client] getMarketState error at ${url}:`, error);
    throw error;
  }
}

/**
 * 3) PATCH /api/v1/admin/products/{productId}
 * Saves one product row configuration.
 */
export async function saveAdminProduct(
  productId: string,
  payload: {
    isVisible?: boolean;
    priceMode?: 'api' | 'manual';
    buyAdjustment?: number;
    sellAdjustment?: number;
    manualBuyPrice?: number | null;
    manualSellPrice?: number | null;
  }
): Promise<ProductServerConfig> {
  const url = `${BACKEND_API_BASE_URL}/api/v1/admin/products/${encodeURIComponent(productId)}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const json = await handleResponse<any>(response, `ذخیره نماد ${productId} انجام نشد`);

    // Handle responses like { ok: true, config: ... } or { ok: true, state: ... } or direct config
    if (json.config) {
      return json.config as ProductServerConfig;
    }
    if (json.state?.productConfigs?.[productId]) {
      return json.state.productConfigs[productId];
    }
    return json as ProductServerConfig;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`[API Client] saveAdminProduct error at ${url}:`, error);
    throw error;
  }
}

/**
 * 4) PATCH /api/v1/admin/products
 * Saves all dirty product rows in one request (all-or-nothing validation on backend).
 */
export async function saveAdminProducts(
  items: Array<{
    id: string;
    isVisible?: boolean;
    priceMode?: 'api' | 'manual';
    buyAdjustment?: number;
    sellAdjustment?: number;
    manualBuyPrice?: number | null;
    manualSellPrice?: number | null;
  }>
): Promise<{ ok: boolean; state?: BackendMarketState }> {
  const url = `${BACKEND_API_BASE_URL}/api/v1/admin/products`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return await handleResponse<{ ok: boolean; state?: BackendMarketState }>(
      response,
      'ذخیره گروهی تنظیمات نمادها انجام نشد'
    );
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`[API Client] saveAdminProducts error at ${url}:`, error);
    throw error;
  }
}

/**
 * 5) POST /api/v1/admin/products/reset
 * Resets all admin configurations to defaults without deleting persisted marketItems.
 */
export async function resetAdminProducts(): Promise<{ ok: boolean; state?: BackendMarketState }> {
  const url = `${BACKEND_API_BASE_URL}/api/v1/admin/products/reset`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return await handleResponse<{ ok: boolean; state?: BackendMarketState }>(
      response,
      'بازنشانی تنظیمات نمادها انجام نشد'
    );
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`[API Client] resetAdminProducts error at ${url}:`, error);
    throw error;
  }
}
