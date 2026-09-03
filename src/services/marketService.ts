import { MarketStatusData, MarketSummaryMetric, PriceItem } from '../types';
import { priceService } from './priceService';
import { adminService } from './adminService';
import { getCurrentCycleTimeFormatted, getRemainingCycleSeconds } from '../utils/formatters';

/**
 * Service for fetching market operational status and high-level summaries derived from live API prices.
 */
export const marketService = {
  /**
   * Fetches the current market status
   */
  async getMarketStatus(): Promise<MarketStatusData> {
    const now = new Date();
    return {
      isOpen: true,
      statusText: 'بازار فعال و نرخ‌ها برخط می‌باشند',
      lastUpdated: `امروز، ${getCurrentCycleTimeFormatted(now)}`,
      nextUpdateSeconds: getRemainingCycleSeconds(now),
      marketMessage: 'نرخ‌های اعلامی به صورت برخط و زنده از وب‌سرویس مرجع بازار استعلام می‌گردند.',
      totalVolumeStatus: 'بالا',
      isApiConnected: true,
    };
  },

  /**
   * Fetches the key metrics summary derived dynamically from live product prices
   */
  async getMarketSummary(): Promise<MarketSummaryMetric[]> {
    const allProducts = await priceService.getAllPrices();
    const configs = adminService.getStoredConfigs();

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

    return metricDefinitions
      .filter((metric) => {
        const config = configs[metric.productId];
        if (config && config.isVisible === false) {
          return false;
        }
        return true;
      })
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
