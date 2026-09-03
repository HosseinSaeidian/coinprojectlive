export type TrendDirection = 'up' | 'down' | 'neutral';

/**
 * Raw API item interface returned from GET /result
 */
export interface ApiPriceItem {
  id: string;
  title: string;
  buy_price: string | number;
  sell_price: string | number;
  unit: string;
  is_active: boolean;
  is_buy_active: boolean;
  is_sell_active: boolean;
}

export interface PriceItem {
  id: string;
  apiId?: string;
  name: string;
  category: 'gold' | 'coin' | 'currency' | 'global';
  buyPrice: number | null; // In Tomans (or USD for Ounce), null if unavailable/pending
  sellPrice: number | null; // In Tomans (or USD for Ounce), null if unavailable/pending
  unit: 'تومان' | 'دلار';
  changeAmount: number;
  changePercentage: number;
  direction: TrendDirection;
  highToday?: number | null;
  lowToday?: number | null;
  updatedAt: string; // Persian formatted time, e.g. "۱۴:۳۵:۱۰"
  isHot?: boolean;
  purity?: string; // e.g. "۷۵۰/۱۰۰۰"
  weight?: string; // e.g. "۸.۱۳۳ گرم"
  isPricePending?: boolean; // در انتظار قیمت / در انتظار به‌روزرسانی
  isBuyActive?: boolean;
  isSellActive?: boolean;
  isRemoved?: boolean; // حذف از سایت
}

export interface CoinBubbleItem {
  id: string;
  name: string;
  price: number;
  realValue: number; // ارزش ذاتی
  bubbleAmount: number; // مبلغ حباب
  bubblePercentage: number; // درصد حباب
  direction: TrendDirection;
  updatedAt: string;
  isPricePending?: boolean;
}

export interface HistoricalPricePoint {
  time: string;
  price: number;
  formattedPrice: string;
}

export interface MarketSummaryMetric {
  id: string;
  title: string;
  subTitle?: string;
  value: number;
  unit: string;
  changePercentage: number;
  direction: TrendDirection;
  changeAmount: number;
  isPricePending?: boolean;
}

export interface MarketStatusData {
  isOpen: boolean;
  statusText: string;
  lastUpdated: string;
  nextUpdateSeconds: number;
  marketMessage: string;
  totalVolumeStatus: 'بالا' | 'متوسط' | 'پایین';
  isApiConnected?: boolean;
}

export interface ContactFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  subject: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export type PriceMode = 'api' | 'manual';
export type PriceSource = PriceMode; // For backwards compatibility

/**
 * Server-persisted configuration for an individual product
 */
export interface ProductServerConfig {
  id: string;
  isVisible: boolean;
  priceMode: PriceMode;
  buyAdjustment: number;
  sellAdjustment: number;
  manualBuyPrice: number | null;
  manualSellPrice: number | null;
  updatedAt?: string | null;
}

/**
 * Raw market item persisted on the FastAPI backend
 */
export interface BackendRawMarketItem {
  id: string;
  title: string;
  buy_price: number | string;
  sell_price: number | string;
  unit?: string;
  is_active?: boolean;
  is_buy_active?: boolean;
  is_sell_active?: boolean;
  lastSeenAt?: string;
}

/**
 * Consolidated market state returned by the FastAPI backend
 */
export interface BackendMarketState {
  version: number;
  marketItems: BackendRawMarketItem[];
  productConfigs: Record<string, ProductServerConfig>;
  lastSyncAttemptAt: string | null;
  lastSuccessfulSyncAt: string | null;
}

/**
 * Response structure for POST /api/v1/market/sync
 */
export interface SyncResponse {
  ok: boolean;
  sync?: {
    attempted: boolean;
    succeeded: boolean;
    skippedBecauseFresh: boolean;
    error: string | null;
    lastSyncAttemptAt: string | null;
    lastSuccessfulSyncAt: string | null;
  };
  state: BackendMarketState;
}

/**
 * Response structure for GET /api/v1/market/state
 */
export interface StateResponse {
  ok?: boolean;
  state: BackendMarketState;
}

/**
 * Backwards compatibility alias for AdminProductConfig
 */
export interface AdminProductConfig extends ProductServerConfig {
  // Optional legacy fields for backward compatibility
  isPricePending?: boolean;
  priceSource?: PriceSource;
  manualOverride?: boolean;
  lastEditedAt?: string;
  manualEditedTimestamp?: number;
}

export interface ManagedProductItem extends PriceItem {
  isVisible: boolean;
  priceMode: PriceMode;
  buyAdjustment: number;
  sellAdjustment: number;
  apiBuyPrice: number | null;
  apiSellPrice: number | null;
  manualBuyPrice: number | null;
  manualSellPrice: number | null;
  lastEditedAt?: string;
  manualEditedTimestamp?: number;
  // Deprecated/compat properties
  priceSource: PriceSource;
  manualOverride: boolean;
}

