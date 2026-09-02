import { ApiPriceItem } from '../types';

/**
 * Centralized API Client for Gold, Silver, and Coin Prices API
 * Endpoint: ${VITE_API_BASE_URL}/result
 */
export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost';

/**
 * Fetches raw price items from the /result endpoint
 */
export async function fetchApiPrices(): Promise<ApiPriceItem[]> {
  const cleanBase = API_BASE_URL.replace(/\/+$/, '');
  const url = `${cleanBase}/result`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    if (!Array.isArray(json)) {
      throw new Error('Invalid API response format: expected an array of items');
    }

    return json as ApiPriceItem[];
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    console.warn(`[PriceAPI] Failed to fetch live prices from ${url}:`, error);
    throw error;
  }
}
