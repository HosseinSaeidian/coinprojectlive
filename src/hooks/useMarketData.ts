import { useState, useEffect, useCallback, useRef } from 'react';
import { PriceItem, CoinBubbleItem, MarketStatusData, MarketSummaryMetric, HistoricalPricePoint, BackendMarketState } from '../types';
import { priceService, mapBackendStateToPriceItems } from '../services/priceService';
import { marketService, isIranMarketOpen } from '../services/marketService';
import { getMarketState } from '../services/apiClient';
import { PRICE_UPDATE_EVENT } from '../services/adminService';
import {
  getCurrentCycleTimeFormatted,
  getRemainingCycleSeconds,
  getCurrentCycleStartDate,
} from '../utils/formatters';

export function useMarketData() {
  const [goldPrices, setGoldPrices] = useState<PriceItem[]>([]);
  const [coinPrices, setCoinPrices] = useState<PriceItem[]>([]);
  const [silverPrices, setSilverPrices] = useState<PriceItem[]>([]);
  const [bubbles, setBubbles] = useState<CoinBubbleItem[]>([]);
  const [marketStatus, setMarketStatus] = useState<MarketStatusData | null>(null);
  const [marketSummary, setMarketSummary] = useState<MarketSummaryMetric[]>([]);
  
  // Gate to ensure chart effect never runs before initial state is established
  const [hasInitialMarketState, setHasInitialMarketState] = useState<boolean>(false);

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
  const [secondsUntilNextRefresh, setSecondsUntilNextRefresh] = useState<number>(() =>
    isIranMarketOpen() ? getRemainingCycleSeconds() : 0
  );
  const lastCycleRef = useRef<number>(getCurrentCycleStartDate().getTime());
  const previousMarketOpenRef = useRef<boolean>(isIranMarketOpen());

  const fetchAllData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Local market status calculation BEFORE any network request
      const statusRes = await marketService.getMarketStatus();
      setMarketStatus(statusRes);
      const isOpen = statusRes.isOpen;

      let backendState: BackendMarketState;

      if (isOpen) {
        backendState = await priceService.syncWithBackend();
      } else {
        try {
          backendState = await getMarketState();
          priceService.setBackendState(backendState);
        } catch (stateError) {
          console.warn('[useMarketData] Failed to get market state in CLOSED mode:', stateError);
          const cachedState = priceService.getCachedState();
          if (cachedState) {
            backendState = cachedState;
          } else {
            const fallbackState: BackendMarketState = {
              version: 1,
              marketItems: [],
              productConfigs: {},
              lastSyncAttemptAt: null,
              lastSuccessfulSyncAt: null,
            };
            priceService.setBackendState(fallbackState);
            backendState = fallbackState;
          }
        }
      }

      const now = new Date();
      const cycleTimeFormatted = getCurrentCycleTimeFormatted(now);

      // Derive all public views from the consolidated backend state
      const allPrices = mapBackendStateToPriceItems(backendState, cycleTimeFormatted, false);
      const goldRes = allPrices.filter((item) => item.category === 'gold' || item.category === 'global');
      const coinRes = allPrices.filter((item) => item.category === 'coin');
      const silverRes = allPrices.filter((item) => item.category === 'silver');
      const bubblesRes = priceService.calculateCoinBubbles(allPrices, cycleTimeFormatted);

      const summaryRes = await marketService.getMarketSummary(allPrices);

      setGoldPrices(goldRes);
      setCoinPrices(coinRes);
      setSilverPrices(silverRes);
      setBubbles(bubblesRes);
      setMarketSummary(summaryRes);
      setLastRefreshTime(`امروز، ${cycleTimeFormatted}`);
      setSecondsUntilNextRefresh(isOpen ? getRemainingCycleSeconds(now) : 0);

      // If currently selected chart symbol becomes hidden, automatically select the first visible fallback symbol
      const allVisible = [...goldRes, ...coinRes, ...silverRes];
      if (allVisible.length > 0) {
        setSelectedChartSymbol((prevSymbol) => {
          const isStillVisible = allVisible.some((p) => p.id === prevSymbol);
          return isStillVisible ? prevSymbol : allVisible[0].id;
        });
      }

      setHasInitialMarketState(true);
    } catch (err: unknown) {
      console.error('Error fetching market data:', err);
      if (isIranMarketOpen()) {
        setError('دریافت اطلاعات با مشکل مواجه شد. لطفاً اتصال اینترنت خود را بررسی نموده و مجدداً تلاش فرمایید.');
      }
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

  // Chart update on symbol/timeframe change, strictly guarded until initial market state is ready
  useEffect(() => {
    if (!hasInitialMarketState) return;
    fetchChart(selectedChartSymbol, selectedTimeframe);
  }, [fetchChart, selectedChartSymbol, selectedTimeframe, hasInitialMarketState]);

  // 1-second interval for countdown, periodic refresh, and market transition tracking
  useEffect(() => {
    // Sync initial state
    const initialOpen = isIranMarketOpen();
    setSecondsUntilNextRefresh(initialOpen ? getRemainingCycleSeconds() : 0);

    const timer = setInterval(() => {
      const now = new Date();
      const currentIsOpen = isIranMarketOpen(now);
      const wasOpen = previousMarketOpenRef.current;

      // Handle OPEN -> CLOSED transition (e.g. 21:00:00)
      if (wasOpen && !currentIsOpen) {
        previousMarketOpenRef.current = false;
        setSecondsUntilNextRefresh(0);
        marketService.getMarketStatus().then((status) => {
          setMarketStatus(status);
        });
        return;
      }

      // Handle CLOSED -> OPEN transition (e.g. 10:30:00)
      if (!wasOpen && currentIsOpen) {
        previousMarketOpenRef.current = true;
        lastCycleRef.current = getCurrentCycleStartDate(now).getTime();
        setSecondsUntilNextRefresh(getRemainingCycleSeconds(now));
        fetchAllData(false);
        return;
      }

      // When market is CLOSED: freeze countdown at 00:00 and skip periodic refresh
      if (!currentIsOpen) {
        setSecondsUntilNextRefresh(0);
        return;
      }

      // When market is OPEN: update countdown and trigger refresh on 1-minute cycle boundary
      const remaining = getRemainingCycleSeconds(now);
      setSecondsUntilNextRefresh(remaining);

      const currentCycleStart = getCurrentCycleStartDate(now).getTime();
      if (currentCycleStart !== lastCycleRef.current) {
        lastCycleRef.current = currentCycleStart;
        fetchAllData(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchAllData]);

  const handleManualRefresh = async () => {
    await fetchAllData(true);
    if (hasInitialMarketState || priceService.getCachedState()) {
      await fetchChart(selectedChartSymbol, selectedTimeframe);
    }
  };

  return {
    goldPrices,
    coinPrices,
    silverPrices,
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
