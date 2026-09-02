import React from 'react';

interface FereshtehLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  variant?: 'full' | 'mark-only';
}

export const FereshtehLogo: React.FC<FereshtehLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  variant = 'full',
}) => {
  const sizeMap = {
    sm: { icon: 34, title: 'text-base', sub: 'text-[10px]' },
    md: { icon: 42, title: 'text-xl', sub: 'text-xs' },
    lg: { icon: 54, title: 'text-2xl', sub: 'text-sm' },
    xl: { icon: 68, title: 'text-3xl', sub: 'text-base' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`} id="fereshteh-brand-logo">
      {/* Brand Icon Mark */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_12px_rgba(255,195,0,0.35)]"
        >
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD60A" />
              <stop offset="50%" stopColor="#FFC300" />
              <stop offset="100%" stopColor="#D4A000" />
            </linearGradient>
            <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#12366F" />
              <stop offset="100%" stopColor="#001D3D" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#FFD60A" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Outer Coin Ring */}
          <circle cx="50" cy="50" r="46" stroke="url(#goldGrad)" strokeWidth="3" fill="#001D3D" />
          
          {/* Inner Decorative Beaded Rim */}
          <circle cx="50" cy="50" r="41" stroke="#FFC300" strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
          
          {/* Inner Navy Medallion Surface */}
          <circle cx="50" cy="50" r="37" fill="url(#navyGrad)" />

          {/* Stylized Angel Wings & Coin Crown Symbolism */}
          {/* Left Wing */}
          <path
            d="M50 48C42 36 28 32 18 42C23 48 30 52 38 52C43 52 47 50 50 48Z"
            fill="url(#goldGrad)"
            opacity="0.95"
          />
          <path
            d="M50 54C43 45 32 44 24 51C28 56 34 58 42 57C45 56 48 55 50 54Z"
            fill="#FFD60A"
            opacity="0.8"
          />
          
          {/* Right Wing */}
          <path
            d="M50 48C58 36 72 32 82 42C77 48 70 52 62 52C57 52 53 50 50 48Z"
            fill="url(#goldGrad)"
            opacity="0.95"
          />
          <path
            d="M50 54C57 45 68 44 76 51C72 56 66 58 58 57C55 56 52 55 50 54Z"
            fill="#FFD60A"
            opacity="0.8"
          />

          {/* Center Crown / Halo & Diamond Gold Monogram */}
          <circle cx="50" cy="30" r="4.5" fill="#FFD60A" filter="url(#glow)" />
          <path
            d="M50 36L55 48L50 67L45 48L50 36Z"
            fill="url(#goldGrad)"
          />
          <circle cx="50" cy="48" r="2.5" fill="#000814" />
          
          {/* Base Pedestal / Ingot */}
          <rect x="39" y="70" width="22" height="3.5" rx="1.5" fill="url(#goldGrad)" />
          <rect x="43" y="75" width="14" height="2.5" rx="1" fill="#FFC300" opacity="0.8" />
        </svg>
      </div>

      {/* Brand Name Typography */}
      {variant === 'full' && (
        <div className="flex flex-col text-right">
          <span className={`font-bold tracking-tight text-white leading-none ${currentSize.title} flex items-center gap-1.5`}>
            <span>فرشته</span>
            <span className="text-[#FFD60A]">کوین</span>
          </span>
          {showSubtitle && (
            <span className={`text-slate-400 font-medium tracking-wider uppercase mt-1 ${currentSize.sub}`}>
              Fereshteh Coin • طلا و سکه
            </span>
          )}
        </div>
      )}
    </div>
  );
};
