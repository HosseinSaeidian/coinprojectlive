import React, { useState } from 'react';
import { useMarketData } from '../../hooks/useMarketData';
import { HeroSection } from '../../components/market/HeroSection';
import { MarketStatus } from '../../components/market/MarketStatus';
import { MarketSummary } from '../../components/market/MarketSummary';
import { GoldPricesSection } from '../../components/prices/GoldPricesSection';
import { CoinPricesSection } from '../../components/prices/CoinPricesSection';
import { PriceTable } from '../../components/prices/PriceTable';
import { TrendChart } from '../../components/market/TrendChart';
import { BubbleSection } from '../../components/market/BubbleSection';
import { GoldCalculatorModal } from '../../components/market/GoldCalculatorModal';
import { CardSkeleton, TableSkeleton } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { ShieldCheck, Zap, BarChart2, Award } from 'lucide-react';
import { BrandPattern } from '../../components/brand/BrandPattern';

export const HomePage: React.FC = () => {
  const {
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
    retryFetch,
  } = useMarketData();

  const [isCalcOpen, setIsCalcOpen] = useState(false);

  const gold18k = goldPrices.find((g) => g.id === 'gold-18k');
  const coinEmami = coinPrices.find((c) => c.id === 'coin-emami');

  return (
    <div className="space-y-10" id="home-page-container">
      {/* Hero Section */}
      <HeroSection
        gold18k={gold18k}
        coinEmami={coinEmami}
        onOpenCalculator={() => setIsCalcOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Market Operational Status Banner */}
        <MarketStatus
          status={marketStatus}
          lastUpdated={lastRefreshTime}
          isRefreshing={isRefreshing}
          onRefresh={handleManualRefresh}
          secondsLeft={secondsUntilNextRefresh}
        />

        {/* Global Error Notice if failed */}
        {error ? (
          <ErrorState message={error} onRetry={retryFetch} />
        ) : loading ? (
          <div className="space-y-10">
            <CardSkeleton count={4} />
            <TableSkeleton />
          </div>
        ) : (
          <>
            {/* Quick Market Summary (5 Key Indicators) */}
            {marketSummary.length > 0 && <MarketSummary metrics={marketSummary} />}

            {/* Dedicated Gold Prices Section */}
            <GoldPricesSection items={goldPrices} />

            {/* Dedicated Coin Prices Section */}
            <CoinPricesSection items={coinPrices} />

            {/* Comprehensive Table */}
            <PriceTable goldItems={goldPrices} coinItems={coinPrices} />

            {/* Price Movement Visualization Line Chart */}
            <TrendChart
              data={chartData}
              loading={chartLoading}
              selectedSymbol={selectedChartSymbol}
              onSelectSymbol={setSelectedChartSymbol}
              selectedTimeframe={selectedTimeframe}
              onSelectTimeframe={setSelectedTimeframe}
            />

            {/* Coin Bubble Info Section */}
            <BubbleSection bubbles={bubbles} />

            {/* Trust & Brand Value Banner */}
            <section className="relative bg-gradient-to-r from-[#001D3D] via-[#003566]/60 to-[#001D3D] border border-[#003566] rounded-3xl p-8 sm:p-10 overflow-hidden shadow-2xl">
              <BrandPattern opacity={0.05} />
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center md:text-right">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#12366F] text-[#FFD60A] flex items-center justify-center mx-auto md:mx-0 shadow-md">
                    <Zap size={24} />
                  </div>
                  <h4 className="text-base font-bold text-white">بروزرسانی پیوسته</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    پایش لحظه‌ای نوسانات طلا و سکه همگام با تغییرات بازار زرگران تهران و اونس جهانی.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#12366F] text-[#FFD60A] flex items-center justify-center mx-auto md:mx-0 shadow-md">
                    <ShieldCheck size={24} />
                  </div>
                  <h4 className="text-base font-bold text-white">شفافیت و صحت داده</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    عدم جانبداری در اعلام نرخ‌ها و ارائه مظنه‌های میانگین واقعی صنف طلا و جواهر.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#12366F] text-[#FFD60A] flex items-center justify-center mx-auto md:mx-0 shadow-md">
                    <BarChart2 size={24} />
                  </div>
                  <h4 className="text-base font-bold text-white">محاسبه علمی حباب</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ارزیابی دقیق ارزش ذاتی هر قطعه سکه به نسبت وزن طلا و تفکیک ارزش حباب بازار.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#12366F] text-[#FFD60A] flex items-center justify-center mx-auto md:mx-0 shadow-md">
                    <Award size={24} />
                  </div>
                  <h4 className="text-base font-bold text-white">پشتیبانی و مرجعیت</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    طراحی شده با استانداردهای مدرن مالی و زیرساخت ارتباطی سریع برای سرمایه‌گذاران.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Gold Calculator Modal */}
      <GoldCalculatorModal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
        gold18kPrice={gold18k?.sellPrice}
      />
    </div>
  );
};
