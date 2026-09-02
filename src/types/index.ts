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

export type PriceSource = 'api' | 'manual';

export interface AdminProductConfig {
  id: string;
  isVisible: boolean; // false means حذف از سایت (removed from site)
  isPricePending?: boolean; // true means در انتظار به‌روزرسانی
  priceSource: PriceSource; // 'api' | 'manual'
  manualOverride: boolean;
  manualBuyPrice?: number;
  manualSellPrice?: number;
  lastEditedAt?: string;
  manualEditedTimestamp?: number; // epoch timestamp in ms of manual edit
}

export interface ManagedProductItem extends PriceItem {
  isVisible: boolean;
  isPricePending?: boolean;
  priceSource: PriceSource;
  manualOverride: boolean;
  apiBuyPrice: number | null;
  apiSellPrice: number | null;
  manualBuyPrice: number;
  manualSellPrice: number;
  lastEditedAt?: string;
  manualEditedTimestamp?: number;
}

