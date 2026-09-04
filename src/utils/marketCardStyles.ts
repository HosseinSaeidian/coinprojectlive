/**
 * Shared styling configuration for public market cards to distinguish
 * between pending (waiting for price) and active (valid price data) states.
 *
 * Visual principles:
 * - Pending state: Subdued, darker/muted surface, softer border contrast,
 *   no strong glow, calm and inactive feel while remaining readable.
 * - Active state: Vibrant, slightly brighter deep-navy surface, crisp defined border,
 *   subtle active elevation shadow/glow, clear live presence.
 */

export interface MarketCardStyleOptions {
  isPending: boolean;
  highlight?: boolean;
}

export interface MarketCardStyles {
  container: string;
  innerBox: string;
  title: string;
  footer: string;
  ambientGlow: string;
}

export function getMarketCardStyles({
  isPending,
  highlight = false,
}: MarketCardStyleOptions): MarketCardStyles {
  if (isPending) {
    return {
      container:
        'bg-[#001020]/90 border-[#00254a]/50 shadow-none hover:border-[#003870]/60 transition-all duration-300',
      innerBox:
        'bg-[#000814]/40 border-[#001e3d]/40 transition-colors duration-300',
      title:
        'text-slate-300 group-hover:text-slate-100 transition-colors duration-200',
      footer:
        'border-[#002244]/40 text-slate-500 transition-colors duration-300',
      ambientGlow:
        'opacity-0 transition-opacity duration-300 pointer-events-none',
    };
  }

  // Active state: Valid real price data
  if (highlight) {
    return {
      container:
        'bg-gradient-to-b from-[#002247] via-[#001a38] to-[#000f20] border-[#FFC300]/50 shadow-[0_4px_24px_-2px_rgba(255,195,0,0.18)] hover:border-[#FFD60A] hover:shadow-[0_8px_32px_-2px_rgba(255,195,0,0.26)] transition-all duration-300',
      innerBox:
        'bg-[#000917] border-[#003870]/70 shadow-inner transition-colors duration-300',
      title:
        'text-white group-hover:text-[#FFD60A] transition-colors duration-200',
      footer:
        'border-[#003566]/60 text-slate-400 transition-colors duration-300',
      ambientGlow:
        'w-24 h-24 bg-[#FFC300]/10 rounded-full blur-xl group-hover:bg-[#FFC300]/20 transition-all duration-300 pointer-events-none',
    };
  }

  return {
    container:
      'bg-gradient-to-b from-[#002042] to-[#001428] border-[#004080] hover:border-[#FFC300]/45 shadow-[0_4px_20px_rgba(0,29,61,0.35)] hover:shadow-[0_6px_26px_rgba(0,29,61,0.55)] transition-all duration-300',
    innerBox:
      'bg-[#000917] border-[#003566]/70 shadow-inner transition-colors duration-300',
    title:
      'text-white group-hover:text-[#FFD60A] transition-colors duration-200',
    footer:
      'border-[#003566]/60 text-slate-400 transition-colors duration-300',
    ambientGlow:
      'w-24 h-24 bg-[#FFC300]/5 rounded-full blur-xl group-hover:bg-[#FFC300]/10 transition-all duration-300 pointer-events-none',
  };
}
