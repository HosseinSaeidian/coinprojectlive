import { MarketStatusData, MarketSummaryMetric, PriceItem } from '../types';
import { priceService } from './priceService';
import { getCurrentCycleTimeFormatted, getRemainingCycleSeconds } from '../utils/formatters';

/**
 * Determines whether the physical gold and coin market in Iran is open,
 * based strictly on official Tehran local time (Asia/Tehran).
 * Working hours: 10:30:00 to 20:59:59 inclusive (i.e. < 21:00:00).
 */
export function isIranMarketOpen(now: Date = new Date()): boolean {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Tehran',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const hourPart = parts.find((p) => p.type === 'hour')?.value;
    const minutePart = parts.find((p) => p.type === 'minute')?.value;
    const secondPart = parts.find((p) => p.type === 'second')?.value;

    const hour = hourPart ? parseInt(hourPart, 10) : 0;
    const minute = minutePart ? parseInt(minutePart, 10) : 0;
    const second = secondPart ? parseInt(secondPart, 10) : 0;

    const normalizedHour = hour === 24 ? 0 : hour;
    const totalSeconds = normalizedHour * 3600 + minute * 60 + second;

    const OPEN_SECONDS = 10 * 3600 + 30 * 60; // 10:30:00 -> 37800
    const CLOSE_SECONDS = 21 * 3600;           // 21:00:00 -> 75600

    return totalSeconds >= OPEN_SECONDS && totalSeconds < CLOSE_SECONDS;
  } catch {
    // Safe deterministic fallback using Iran standard offset (UTC+3:30)
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const utcSeconds = now.getUTCSeconds();
    const totalUtcSeconds = utcHours * 3600 + utcMinutes * 60 + utcSeconds;
    const totalIranSeconds = (totalUtcSeconds + 12600) % 86400;

    const OPEN_SECONDS = 10 * 3600 + 30 * 60;
    const CLOSE_SECONDS = 21 * 3600;

    return totalIranSeconds >= OPEN_SECONDS && totalIranSeconds < CLOSE_SECONDS;
  }
}

/**
 * Service for fetching market operational status and high-level summaries derived from live API prices.
 */
export const marketService = {
  /**
   * Fetches the current market status based on official Iran time
   */
  async getMarketStatus(): Promise<MarketStatusData> {
    const now = new Date();
    const isOpen = isIranMarketOpen(now);

    return {
      isOpen,
      statusText: isOpen ? 'بازار فعال و نرخ‌ها برخط می‌باشند' : 'بازار بسته است',
      lastUpdated: `امروز، ${getCurrentCycleTimeFormatted(now)}`,
      nextUpdateSeconds: getRemainingCycleSeconds(now),
      marketMessage: isOpen
        ? 'نرخ‌های اعلامی به صورت برخط و زنده از وب‌سرویس مرجع بازار استعلام می‌گردند.'
        : 'ساعات فعالیت بازار: ۱۰:۳۰ تا ۲۱:۰۰ به وقت ایران',
      totalVolumeStatus: isOpen ? 'بالا' : 'پایین',
      isApiConnected: true,
    };
  },

  /**
   * Fetches the key metrics summary derived dynamically from live product prices
   */
  async getMarketSummary(providedPrices?: PriceItem[]): Promise<MarketSummaryMetric[]> {
    const allProducts = providedPrices || (await priceService.getAllPrices());

    const metricDefinitions: Array<{
      id: string;
      productId: string;
      title: string;
      subTitle: string;
      unit: string;
    }> = [
      {
        id: 'sum-emami',
        productId: 'coin-emami',
        title: 'سکه امامی',
        subTitle: 'تمام سکه ۸۶',
        unit: 'تومان',
      },
      {
        id: 'sum-gold18',
        productId: 'gold-18k',
        title: 'طلای ۱۸ عیار',
        subTitle: 'هر گرم ۷۵۰',
        unit: 'تومان',
      },
      {
        id: 'sum-mesghal',
        productId: 'gold-mesghal',
        title: 'مثقال طلا',
        subTitle: 'مظنه بازار تهران',
        unit: 'تومان',
      },
      {
        id: 'sum-ounce',
        productId: 'gold-ounce',
        title: 'اونس جهانی',
        subTitle: 'طلای جهانی (XAU/USD)',
        unit: 'دلار',
      },
    ];

    // Only include metrics where the product is visible in allProducts
    return metricDefinitions
      .filter((metric) => allProducts.some((p) => p.id === metric.productId))
      .map((metric) => {
        const prod = allProducts.find((p) => p.id === metric.productId);
        const isPending = !prod || prod.isPricePending || prod.sellPrice === null;
        const value = prod && prod.sellPrice ? prod.sellPrice : 0;
        const changePercentage = prod ? prod.changePercentage : 0;
        const changeAmount = prod ? prod.changeAmount : 0;
        const direction = prod ? prod.direction : 'neutral';

        return {
          id: metric.id,
          title: metric.title,
          subTitle: metric.subTitle,
          value,
          unit: metric.unit,
          changePercentage,
          changeAmount,
          direction,
          isPricePending: isPending,
        };
      });
  },
};
