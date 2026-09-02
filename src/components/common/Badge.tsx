import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Minus } from 'lucide-react';
import { formatPercentage } from '../../utils/formatters';
import { TrendDirection } from '../../types';

interface TrendBadgeProps {
  direction: TrendDirection;
  percentage: number;
  showIcon?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TrendBadge: React.FC<TrendBadgeProps> = ({
  direction,
  percentage,
  showIcon = true,
  className = '',
  size = 'md',
}) => {
  const isUp = direction === 'up';
  const isDown = direction === 'down';

  const sizeClasses = {
    sm: 'text-[11px] px-1.5 py-0.5 gap-0.5',
    md: 'text-xs px-2.5 py-1 gap-1',
    lg: 'text-sm px-3 py-1.5 gap-1.5',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  let colorClasses = 'bg-slate-800/80 text-slate-300 border-slate-700';
  if (isUp) {
    colorClasses = 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30';
  } else if (isDown) {
    colorClasses = 'bg-rose-950/60 text-rose-400 border-rose-500/30';
  }

  return (
    <div
      className={`inline-flex items-center font-bold rounded-lg border tabular-nums ${colorClasses} ${sizeClasses[size]} ${className}`}
      dir="ltr"
    >
      {showIcon && (
        <span className="shrink-0">
          {isUp ? (
            <ArrowUpRight size={iconSizes[size]} className="stroke-[2.5]" />
          ) : isDown ? (
            <ArrowDownLeft size={iconSizes[size]} className="stroke-[2.5]" />
          ) : (
            <Minus size={iconSizes[size]} />
          )}
        </span>
      )}
      <span>{formatPercentage(percentage, false)}</span>
    </div>
  );
};
