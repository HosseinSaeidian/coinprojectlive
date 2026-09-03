import { useState, useEffect, useCallback, useRef } from 'react';
import { PriceItem, CoinBubbleItem, MarketStatusData, MarketSummaryMetric, HistoricalPricePoint } from '../types';
import { priceService } from '../services/priceService';
import { marketService } from '../services/marketService';
import { PRICE_UPDATE_EVENT } from '../services/adminService';
import {
  getCurrentCycleTimeFormatted,
  getRemainingCycleSeconds,
  getCurrentCycleStartDate,
} from '../utils/formatters';

export function useMarketData() {
  const [goldPrices, setGoldPrices] = useState<PriceItem[]>([]);
  const [coinPrices, setCoinPrices] = useState<PriceItem[]>([]);
  const [bubbles, setBubbles] = useState<CoinBubbleItem[]>([]);
  const [marketStatus, setMarketStatus] = useState<MarketStatusData | null>(null);
  const [marketSummary, setMarketSummary] = useState<MarketSummaryMetric[]>([]);
  
  // Chart state
  const [selectedChartSymbol, setSelectedChartSymbol] = useState<string>('coin-emami');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1W' | '1M'>('1D');
  const [chartData, setChartData] = useState<HistoricalPricePoint[]>([]);
  const [chartLoading, setChartLoading] = useState<boolean>(false);

  // General loading & error states
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>(() => `امروز، ${getCurrentCycleTimeFormatted()}`);
  const [secondsUntilNextRefresh, setSecondsUntilNextRefresh] = useState<number>(() => getRemainingCycleSeconds());
  const lastCycleRef = useRef<number>(getCurrentCycleStartDate().getTime());

  const fetchAllData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [goldRes, coinRes, bubblesRes, statusRes, summaryRes] = await Promise.all([
        priceService.getGoldPrices(isManualRefresh),
        priceService.getCoinPrices(isManualRefresh),
        priceService.getCoinBubbles(isManualRefresh),
        marketService.getMarketStatus(),
        marketService.getMarketSummary(),
      ]);

      setGoldPrices(goldRes);
      setCoinPrices(coinRes);
      setBubbles(bubblesRes);
      setMarketStatus(statusRes);
      setMarketSummary(summaryRes);
      setLastRefreshTime(`امروز، ${getCurrentCycleTimeFormatted()}`);
      setSecondsUntilNextRefresh(getRemainingCycleSeconds());

      // If currently selected chart symbol becomes hidden, automatically select the first visible fallback symbol
      const allVisible = [...goldRes, ...coinRes];
      if (allVisible.length > 0) {
        setSelectedChartSymbol((prevSymbol) => {
          const isStillVisible = allVisible.some((p) => p.id === prevSymbol);
          return isStillVisible ? prevSymbol : allVisible[0].id;
        });
      }
    } catch (err: unknown) {
      console.error('Error fetching market data:', err);
      setError('دریافت اطلاعات با مشکل مواجه شد. لطفاً اتصال اینترنت خود را بررسی نموده و مجدداً تلاش فرمایید.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const fetchChart = useCallback(async (symbol: string, timeframe: '1D' | '1W' | '1M') => {
    try {
      setChartLoading(true);
      const data = await priceService.getHistoricalData(symbol, timeframe);
      setChartData(data);
    } catch (err) {
      console.error('Error fetching chart data:', err);
    } finally {
      setChartLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Reactive listener for Admin price / visibility changes
  useEffect(() => {
    const handlePriceUpdate = () => {
      fetchAllData(false);
    };
    window.addEventListener(PRICE_UPDATE_EVENT, handlePriceUpdate);
    window.addEventListener('storage', handlePriceUpdate);
    return () => {
      window.removeEventListener(PRICE_UPDATE_EVENT, handlePriceUpdate);
      window.removeEventListener('storage', handlePriceUpdate);
    };
  }, [fetchAllData]);

  // Chart update on symbol/timeframe change
  useEffect(() => {
    fetchChart(selectedChartSymbol, selectedTimeframe);
  }, [fetchChart, selectedChartSymbol, selectedTimeframe]);

  // Canonical global 15-minute countdown and cycle boundary trigger
  useEffect(() => {
    // Sync initial state
    setSecondsUntilNextRefresh(getRemainingCycleSeconds());

    const timer = setInterval(() => {
      const now = new Date();
      const remaining = getRemainingCycleSeconds(now);
      setSecondsUntilNextRefresh(remaining);

      // Check if 15-minute global cycle boundary has elapsed
      const currentCycleStart = getCurrentCycleStartDate(now).getTime();
      if (currentCycleStart !== lastCycleRef.current) {
        lastCycleRef.current = currentCycleStart;
        fetchAllData(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchAllData]);

  const handleManualRefresh = () => {
    fetchAllData(true);
    fetchChart(selectedChartSymbol, selectedTimeframe);
  };

  return {
    goldPrices,
    coinPrices,
    bubbles,
    marketStatus,
    marketSummary,
    loading,
    isRefreshing,
    error,
    lastRefreshTime,
    secondsUntilNextRefresh,
    selectedChartSymbol,
    setSelectedChartSymbol,
    selectedTimeframe,
    setSelectedTimeframe,
    chartData,
    chartLoading,
    handleManualRefresh,
    retryFetch: () => fetchAllData(false),
  };
}
