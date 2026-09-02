import React, { useState, useMemo } from 'react';
import { HistoricalPricePoint } from '../../types';
import { SectionHeader } from '../common/SectionHeader';
import { formatNumberWithCommas, toPersianDigits } from '../../utils/formatters';
import { TrendingUp, Calendar, Layers } from 'lucide-react';
import { ChartSkeleton } from '../common/LoadingState';

interface TrendChartProps {
  data: HistoricalPricePoint[];
  loading?: boolean;
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  selectedTimeframe: '1D' | '1W' | '1M';
  onSelectTimeframe: (tf: '1D' | '1W' | '1M') => void;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  loading = false,
  selectedSymbol,
  onSelectSymbol,
  selectedTimeframe,
  onSelectTimeframe,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<HistoricalPricePoint | null>(null);

  const symbols = [
    { id: 'coin-emami', name: 'سکه امامی' },
    { id: 'coin-naqd-farda', name: 'سکه نقد فردا' },
    { id: 'coin-pas-fardayi', name: 'سکه پس فردایی' },
    { id: 'gold-18k', name: 'طلای ۱۸ عیار' },
    { id: 'gold-mesghal', name: 'مثقال طلا' },
    { id: 'gold-ounce', name: 'اونس جهانی' },
  ];

  const timeframes = [
    { id: '1D' as const, name: '۲۴ ساعت' },
    { id: '1W' as const, name: '۷ روز' },
    { id: '1M' as const, name: '۳۰ روز' },
  ];

  // Mathematical SVG chart calculation
  const { pathD, areaD, points, minPrice, maxPrice, startPrice, endPrice, isOverallUp } = useMemo(() => {
    if (!data || data.length < 2) {
      return {
        pathD: '',
        areaD: '',
        points: [],
        minPrice: 0,
        maxPrice: 0,
        startPrice: 0,
        endPrice: 0,
        isOverallUp: true,
      };
    }

    const prices = data.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const padding = range * 0.15; // 15% top/bottom margin for aesthetic balance
    const chartMin = min - padding;
    const chartMax = max + padding;
    const chartRange = chartMax - chartMin;

    const width = 800;
    const height = 300;

    const calculatedPoints = data.map((point, index) => {
      // In RTL, 0 is right, width is left or standard left-to-right timeline
      const x = (index / (data.length - 1)) * (width - 60) + 30;
      const y = height - 40 - ((point.price - chartMin) / chartRange) * (height - 80);
      return { ...point, x, y };
    });

    // Build SVG path
    let pD = `M ${calculatedPoints[0].x} ${calculatedPoints[0].y}`;
    for (let i = 0; i < calculatedPoints.length - 1; i++) {
      const current = calculatedPoints[i];
      const next = calculatedPoints[i + 1];
      const controlX = (current.x + next.x) / 2;
      pD += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }

    const aD = `${pD} L ${calculatedPoints[calculatedPoints.length - 1].x} ${height - 20} L ${calculatedPoints[0].x} ${height - 20} Z`;

    const startP = data[0].price;
    const endP = data[data.length - 1].price;

    return {
      pathD: pD,
      areaD: aD,
      points: calculatedPoints,
      minPrice: min,
      maxPrice: max,
      startPrice: startP,
      endPrice: endP,
      isOverallUp: endP >= startP,
    };
  }, [data]);

  if (loading) {
    return <ChartSkeleton />;
  }

  return (
    <section className="py-8 scroll-mt-24" id="trend-section">
      <SectionHeader
        title="نمودار روند نوسان قیمت"
        subtitle="تحلیل تغییرات و نوسان شاخص‌های مهم بازار طلا و مسکوکات در بازه‌های زمانی مختلف"
        badge="تحلیل تکنیکال"
      />

      <div className="bg-[#001D3D]/90 border border-[#003566] rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
        {/* Controls: Symbol Selector & Timeframe Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#003566]">
          {/* Symbols */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 ml-2 flex items-center gap-1">
              <Layers size={14} className="text-[#FFC300]" />
              نماد:
            </span>
            {symbols.map((sym) => (
              <button
                key={sym.id}
                onClick={() => onSelectSymbol(sym.id)}
                type="button"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedSymbol === sym.id
                    ? 'bg-gradient-to-r from-[#FFC300] to-[#FFD60A] text-[#000814] shadow-md'
                    : 'bg-[#000814]/80 text-slate-300 hover:text-white hover:bg-[#12366F]/50 border border-[#003566]'
                }`}
              >
                {sym.name}
              </button>
            ))}
          </div>

          {/* Timeframes */}
          <div className="flex items-center gap-1.5 self-start md:self-auto bg-[#000814] p-1 rounded-xl border border-[#003566]">
            <Calendar size={13} className="text-slate-400 mr-2" />
            {timeframes.map((tf) => (
              <button
                key={tf.id}
                onClick={() => onSelectTimeframe(tf.id)}
                type="button"
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedTimeframe === tf.id
                    ? 'bg-[#12366F] text-[#FFD60A] border border-[#FFC300]/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf.name}
              </button>
            ))}
          </div>
        </div>

        {/* Current Active Price & Hover Details */}
        <div className="py-4 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block mb-1">
              {hoveredPoint ? `قیمت در زمان (${hoveredPoint.time}):` : 'آخرین قیمت ثبت شده:'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight tabular-nums">
                {hoveredPoint
                  ? formatNumberWithCommas(hoveredPoint.price)
                  : formatNumberWithCommas(endPrice)}
              </span>
              <span className="text-sm font-semibold text-[#FFD60A]">
                {selectedSymbol === 'gold-ounce' ? 'دلار' : 'تومان'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="bg-[#000814]/60 px-3 py-1.5 rounded-lg border border-[#003566]">
              <span className="text-slate-400 ml-1.5">کف دوره:</span>
              <strong className="text-slate-200 tabular-nums">
                {formatNumberWithCommas(minPrice)}
              </strong>
            </div>
            <div className="bg-[#000814]/60 px-3 py-1.5 rounded-lg border border-[#003566]">
              <span className="text-slate-400 ml-1.5">سقف دوره:</span>
              <strong className="text-slate-200 tabular-nums">
                {formatNumberWithCommas(maxPrice)}
              </strong>
            </div>
          </div>
        </div>

        {/* SVG Interactive Chart Canvas */}
        <div className="relative w-full h-64 sm:h-72 mt-2 bg-[#000814]/70 rounded-xl p-2 border border-[#003566]/60 overflow-hidden flex flex-col justify-center items-center">
          {data.length >= 2 ? (
            <svg
              viewBox="0 0 800 300"
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFC300" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FFC300" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid horizontal guideline lines */}
              <line x1="20" y1="60" x2="780" y2="60" stroke="#003566" strokeDasharray="4 4" strokeWidth="1" opacity="0.4" />
              <line x1="20" y1="140" x2="780" y2="140" stroke="#003566" strokeDasharray="4 4" strokeWidth="1" opacity="0.4" />
              <line x1="20" y1="220" x2="780" y2="220" stroke="#003566" strokeDasharray="4 4" strokeWidth="1" opacity="0.4" />

              {/* Filled Area */}
              {areaD && <path d={areaD} fill="url(#chartGradient)" />}

              {/* Main Trend Line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#FFD60A"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_0_8px_rgba(255,214,10,0.5)]"
                />
              )}

              {/* Interactive Points */}
              {points.map((point, index) => {
                const isHovered = hoveredPoint?.time === point.time;
                return (
                  <g
                    key={index}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(point)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={isHovered ? 6 : 4}
                      fill={isHovered ? '#FFD60A' : '#001D3D'}
                      stroke="#FFC300"
                      strokeWidth={isHovered ? 3 : 2}
                      className="transition-all duration-150"
                    />
                    {/* Invisible enlarged hit target for mobile/touch */}
                    <circle cx={point.x} cy={point.y} r="18" fill="transparent" />
                  </g>
                );
              })}
            </svg>
          ) : (
            <div className="text-center p-6 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#001D3D] border border-[#003566] flex items-center justify-center text-[#FFD60A]">
                <TrendingUp size={24} />
              </div>
              <p className="text-sm font-bold text-white">نمودار زنده نوسانات نرخ</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                داده‌های روند تاریخی به محض تکمیل چرخه ثبت نوسانات وب‌سرویس در نمودار منعکس می‌گردند. نرخ لحظه‌ای معاملات در جدول قیمت‌ها به روز است.
              </p>
            </div>
          )}
        </div>


        {/* X-Axis Timeline Labels */}
        <div className="flex justify-between items-center text-[11px] sm:text-xs text-slate-400 pt-3 px-3">
          {data.map((point, i) => (
            <span
              key={i}
              className={`tabular-nums ${
                hoveredPoint?.time === point.time ? 'text-[#FFD60A] font-bold' : ''
              }`}
            >
              {point.time}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
