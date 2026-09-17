import React from 'react';
import { ProductCategory } from '../../types';

export type ProductIconType = 'coin' | 'gold-bar' | 'scale' | 'global-gold' | 'silver-bar';

export type CoinVariant = 'emami' | 'bahar-azadi' | 'nim' | 'rob' | 'gerami' | 'parsian';

export interface CoinIconMeta {
  type: 'coin';
  variant: CoinVariant;
  size: number;
  color: string;
  secondaryColor: string;
  accentColor: string;
  label: string;
}

/**
 * Dedicated helper and metadata configuration for official Iranian minted coins.
 * Preserves strict relative sizing:
 * Emami / Bahar Azadi (22px) > Nim (20px) > Rob (18px) > Parsian (17px) > Gerami (16px).
 */
export function getCoinIconMeta(
  id?: string,
  name?: string
): CoinIconMeta {
  const normId = (id || '').toLowerCase().trim();
  const normName = (name || '').toLowerCase().trim();

  // 1. Coin Emami (تمام سکه بهار آزادی طرح جدید / امامی) -> 22px
  if (normId === 'coin-emami' || normId.includes('emami') || normName.includes('امامی')) {
    return {
      type: 'coin',
      variant: 'emami',
      size: 22,
      color: '#FFD60A',
      secondaryColor: '#FFC300',
      accentColor: '#E6B800',
      label: 'سکه تمام بهار آزادی (امامی)',
    };
  }

  // 2. Coin Bahar Azadi (تمام سکه بهار آزادی طرح قدیم) -> 22px
  if (
    normId === 'coin-bahar-azadi' ||
    normId.includes('bahar') ||
    normName.includes('بهار آزادی') ||
    normName.includes('طرح قدیم')
  ) {
    return {
      type: 'coin',
      variant: 'bahar-azadi',
      size: 22,
      color: '#FFD60A',
      secondaryColor: '#FFC300',
      accentColor: '#E6B800',
      label: 'تمام سکه بهار آزادی (طرح قدیم)',
    };
  }

  // 3. Coin Nim (نیم سکه بهار آزادی) -> 20px
  if (normId === 'coin-nim' || normId.includes('nim') || normName.includes('نیم سکه')) {
    return {
      type: 'coin',
      variant: 'nim',
      size: 20,
      color: '#FFD60A',
      secondaryColor: '#FFC300',
      accentColor: '#E6B800',
      label: 'نیم سکه بهار آزادی',
    };
  }

  // 4. Coin Rob (ربع سکه بهار آزادی) -> 18px
  if (normId === 'coin-rob' || normId.includes('rob') || normName.includes('ربع سکه')) {
    return {
      type: 'coin',
      variant: 'rob',
      size: 18,
      color: '#FFD60A',
      secondaryColor: '#FFC300',
      accentColor: '#E6B800',
      label: 'ربع سکه بهار آزادی',
    };
  }

  // 5. Coin Gerami Banki / Parsian 1g (سکه پارسیان ۱ گرمی) -> 17px distinct gold token plaque
  if (
    normId === 'coin-gerami-banki' ||
    normId.includes('parsian') ||
    normName.includes('پارسیان')
  ) {
    return {
      type: 'coin',
      variant: 'parsian',
      size: 17,
      color: '#FFD60A',
      secondaryColor: '#FFC300',
      accentColor: '#E6B800',
      label: 'سکه پارسیان (پلاک ۱ گرمی)',
    };
  }

  // 6. Coin Gerami (سکه یک گرمی رسمی بانکی) -> 16px (کوچکترین عضو مدالیون گرد بانکی)
  if (
    normId === 'coin-gerami' ||
    normId.includes('gerami') ||
    normName.includes('یک گرمی') ||
    normName.includes('۱ گرمی') ||
    normName.includes('1 گرمی') ||
    normName.includes('سکه گرمی')
  ) {
    return {
      type: 'coin',
      variant: 'gerami',
      size: 16,
      color: '#FFD60A',
      secondaryColor: '#FFC300',
      accentColor: '#E6B800',
      label: 'سکه یک گرمی بانکی',
    };
  }

  // Fallback for newly added coin products (keeps Iranian minted coin characteristics)
  return {
    type: 'coin',
    variant: 'emami',
    size: 20,
    color: '#FFD60A',
    secondaryColor: '#FFC300',
    accentColor: '#E6B800',
    label: 'سکه بهار آزادی رسمی',
  };
}

export interface ProductIconMeta {
  type: ProductIconType;
  coinVariant?: CoinVariant;
  /**
   * Approximate pixel size for standard display (PriceCard / Desktop).
   * Notice relative sizes for coins:
   * emami / bahar: 22px
   * nim: 20px
   * rob: 18px
   * parsian: 17px
   * gerami: 16px
   */
  size: number;
  /** Primary accent color */
  color: string;
  /** Secondary subtle tone for highlights/gradients */
  secondaryColor: string;
  /** Accessible label */
  label: string;
}

/**
 * Returns metadata (icon type, exact relative pixel size, brand colors)
 * based on product id, category, and display name.
 */
export function getProductIconMeta(
  id?: string,
  category?: ProductCategory | string,
  name?: string
): ProductIconMeta {
  const normId = (id || '').toLowerCase().trim();
  const normName = (name || '').toLowerCase().trim();

  // 1. Coins with precise relative sizing and official Iranian mint styling
  const isCoinProduct =
    normId === 'coin-emami' ||
    normId === 'coin-bahar-azadi' ||
    normId === 'coin-nim' ||
    normId === 'coin-rob' ||
    normId === 'coin-gerami' ||
    normId === 'coin-gerami-banki' ||
    normId.includes('emami') ||
    normId.includes('bahar') ||
    normId.includes('nim') ||
    normId.includes('rob') ||
    normId.includes('gerami') ||
    normName.includes('سکه') ||
    (category === 'coin' && !normId.startsWith('gold') && !normId.startsWith('silver'));

  if (isCoinProduct && normId !== 'coin-naqd-farda' && normId !== 'coin-pas-fardayi') {
    return getCoinIconMeta(id, name);
  }

  // 2. Global Gold Ounce -> global cue
  if (
    normId === 'gold-ounce' ||
    normId.includes('ounce') ||
    normId.includes('xau') ||
    category === 'global' ||
    normName.includes('اونس')
  ) {
    return {
      type: 'global-gold',
      size: 20,
      color: '#FFD60A',
      secondaryColor: '#FFC300',
      label: 'اونس جهانی طلا',
    };
  }

  // 3. Mesghal & Mozaneh -> scale/measure indicator
  if (
    normId === 'gold-mesghal' ||
    normId.includes('mesghal') ||
    normId.includes('mozaneh') ||
    normName.includes('مثقال') ||
    normName.includes('مظنه')
  ) {
    return {
      type: 'scale',
      size: 20,
      color: '#FFD60A',
      secondaryColor: '#FFC300',
      label: 'مظنه و مثقال طلا',
    };
  }

  // 4. Silver items -> silver bullion bar / steel tones
  if (
    normId.startsWith('silver') ||
    category === 'silver' ||
    normName.includes('نقره') ||
    normName.includes('نادیر') ||
    normName.includes('اماراتی')
  ) {
    return {
      type: 'silver-bar',
      size: 20,
      color: '#D6DCE6',
      secondaryColor: '#94A3B8',
      label: 'شمش نقره',
    };
  }

  // 5. Gold Bars & General Gold (18k, 24k, 995, 750, 740, abshodeh, used, naqd farda, pas fardayi)
  if (
    normId.startsWith('gold') ||
    normId === 'coin-naqd-farda' ||
    normId === 'coin-pas-fardayi' ||
    category === 'gold' ||
    normName.includes('طلا') ||
    normName.includes('آبشده') ||
    normName.includes('عیار')
  ) {
    return {
      type: 'gold-bar',
      size: 20,
      color: '#FFD60A',
      secondaryColor: '#FFC300',
      label: 'طلا و شمش طلا',
    };
  }

  // 6. Generic Fallback by Category
  if (category === 'coin') {
    return {
      type: 'coin',
      size: 20,
      color: '#FFD60A',
      secondaryColor: '#FFC300',
      label: 'سکه',
    };
  }

  // Default safe gold bar
  return {
    type: 'gold-bar',
    size: 20,
    color: '#FFD60A',
    secondaryColor: '#FFC300',
    label: 'محصول طلا',
  };
}

export interface ProductIconProps {
  id?: string;
  category?: ProductCategory | string;
  name?: string;
  className?: string;
  /** Custom size override; if omitted, uses standard mathematical size from getProductIconMeta */
  size?: number;
  /** Scale modifier, e.g. 'sm' for monitoring / table rows */
  scaleMultiplier?: number;
}

/**
 * Premium, clean vector product icons for Fereshteh Coin products.
 * Aligns naturally beside RTL Persian product titles.
 */
/**
 * Dedicated renderer for Iranian official minted coins and gold tokens.
 * Renders high-precision, small-size-friendly SVG vectors with distinct motifs:
 * - 'emami': Full-size official medallion with shrine dome, minarets, and wheat garland
 * - 'bahar-azadi': Full-size classic medallion with authentic Islamic 6-fold arabesque rosette & wreath
 * - 'nim': Half coin proportion with balanced dome arch and wheat sprigs
 * - 'rob': Quarter coin proportion with crisp pointed arch relief
 * - 'gerami': Smallest official round minted coin with 8-point gold mint star
 * - 'parsian': Distinct rectangular beveled gold blister plaque token with 1g central medallion
 */
export function renderCoinSvg(
  variant: CoinVariant = 'emami',
  size: number = 20,
  color: string = '#FFD60A',
  secondaryColor: string = '#FFC300',
  accentColor: string = '#E6B800'
) {
  switch (variant) {
    case 'emami':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform group-hover:scale-105"
          aria-hidden="true"
        >
          {/* Outer Raised Coin Rim (حاشیه برجسته دور سکه امامی) */}
          <circle cx="12" cy="12" r="10.2" stroke={color} strokeWidth="1.5" />

          {/* Official Reeded / Serrated Edge (کنگره‌های ضرب ضرابخانه) */}
          <circle
            cx="12"
            cy="12"
            r="8.8"
            stroke={secondaryColor}
            strokeWidth="0.9"
            strokeDasharray="1.2 1.4"
            opacity="0.95"
          />

          {/* Embossed Gold Relief Basin (زمینه فرورفته طلایی) */}
          <circle cx="12" cy="12" r="7.4" fill={color} fillOpacity="0.15" />

          {/* Traditional Iranian Wheat Garland at base (خوشه گندم و شاخه اسلیمی) */}
          <path
            d="M6.8 14.5C6.2 12.6 6.8 9.8 8.6 8.5"
            stroke={secondaryColor}
            strokeWidth="0.85"
            strokeLinecap="round"
          />
          <path
            d="M17.2 14.5C17.8 12.6 17.2 9.8 15.4 8.5"
            stroke={secondaryColor}
            strokeWidth="0.85"
            strokeLinecap="round"
          />
          <path
            d="M10.2 16.2C11.2 16.7 12.8 16.7 13.8 16.2"
            stroke={secondaryColor}
            strokeWidth="0.8"
            strokeLinecap="round"
          />

          {/* Sacred Shrine Dome & Minarets (بارگاه، گنبد و گلدسته‌های حرم مطهر) */}
          {/* Central Sacred Dome */}
          <path
            d="M9.2 13.8V12.2C9.2 10.5 10.4 9.1 12 7.8C13.6 9.1 14.8 10.5 14.8 12.2V13.8H9.2Z"
            stroke={color}
            strokeWidth="1.2"
            strokeLinejoin="round"
            fill={color}
            fillOpacity="0.32"
          />
          {/* Minaret / Finial Top */}
          <path
            d="M12 6.2V7.8"
            stroke={color}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Flanking Minarets */}
          <path
            d="M8.2 10.2V13.8"
            stroke={secondaryColor}
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          <path
            d="M15.8 10.2V13.8"
            stroke={secondaryColor}
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          {/* Mihrab Gateway Arch */}
          <path
            d="M10.8 13.8V12.5C10.8 11.8 11.3 11.2 12 11.2C12.7 11.2 13.2 11.8 13.2 12.5V13.8"
            stroke={secondaryColor}
            strokeWidth="0.85"
            strokeLinecap="round"
          />
          {/* Center Radiance Point */}
          <circle cx="12" cy="9.8" r="0.85" fill={color} />
        </svg>
      );

    case 'bahar-azadi':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform group-hover:scale-105"
          aria-hidden="true"
        >
          {/* Outer Raised Coin Rim (حاشیه برجسته دور سکه بهار آزادی طرح قدیم) */}
          <circle cx="12" cy="12" r="10.2" stroke={color} strokeWidth="1.5" />

          {/* Serrated Edge (کنگره‌های دور سکه) */}
          <circle
            cx="12"
            cy="12"
            r="8.8"
            stroke={secondaryColor}
            strokeWidth="0.9"
            strokeDasharray="1.2 1.4"
            opacity="0.95"
          />

          {/* Embossed Gold Relief Basin */}
          <circle cx="12" cy="12" r="7.4" fill={color} fillOpacity="0.15" />

          {/* Authentic Islamic 6-fold Arabesque Star / Hexagonal Medallion (طرح شش‌ضلعی اسلیمی اصیل بهار آزادی) */}
          <polygon
            points="12,7 15.6,9.1 15.6,13.3 12,15.4 8.4,13.3 8.4,9.1"
            stroke={color}
            strokeWidth="1.15"
            strokeLinejoin="round"
            fill={color}
            fillOpacity="0.25"
          />

          {/* Inner 3-Fold Floral / Islamic Rosette (نقش اسلیمی و کعبه/گل سه پر مرکزی) */}
          <circle
            cx="12"
            cy="11.2"
            r="2.3"
            stroke={secondaryColor}
            strokeWidth="0.85"
            fill={color}
            fillOpacity="0.3"
          />
          {/* Radiating Petal Star Accents */}
          <path
            d="M12 9V13.4M9.8 10.1L14.2 12.3M9.8 12.3L14.2 10.1"
            stroke={secondaryColor}
            strokeWidth="0.8"
            strokeLinecap="round"
          />
          <circle cx="12" cy="11.2" r="0.8" fill={color} />

          {/* Framing Laurel/Wheat Foliage Sprigs */}
          <path
            d="M6.5 14C6.5 11.2 7.8 9.2 9.2 8.2"
            stroke={secondaryColor}
            strokeWidth="0.85"
            strokeLinecap="round"
          />
          <path
            d="M17.5 14C17.5 11.2 16.2 9.2 14.8 8.2"
            stroke={secondaryColor}
            strokeWidth="0.85"
            strokeLinecap="round"
          />
          <path
            d="M10 16C11.2 16.6 12.8 16.6 14 16"
            stroke={secondaryColor}
            strokeWidth="0.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'nim':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform group-hover:scale-105"
          aria-hidden="true"
        >
          {/* Half Coin Proportional Rim (نیم سکه بهار آزادی - سایز ۲۰) */}
          <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.4" />
          <circle
            cx="12"
            cy="12"
            r="8.4"
            stroke={secondaryColor}
            strokeWidth="0.85"
            strokeDasharray="1.2 1.3"
            opacity="0.95"
          />
          <circle cx="12" cy="12" r="7" fill={color} fillOpacity="0.14" />

          {/* Balanced Persian Arch & Finial at Half Proportion */}
          <path
            d="M9.4 13.8V12.4C9.4 10.8 10.5 9.4 12 8.2C13.5 9.4 14.6 10.8 14.6 12.4V13.8H9.4Z"
            stroke={color}
            strokeWidth="1.15"
            strokeLinejoin="round"
            fill={color}
            fillOpacity="0.28"
          />
          <path
            d="M12 6.8V8.2"
            stroke={color}
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          {/* Side Wheat Sprigs */}
          <path
            d="M7 14.2C6.6 12.4 7.2 10.2 8.8 9.2"
            stroke={secondaryColor}
            strokeWidth="0.8"
            strokeLinecap="round"
          />
          <path
            d="M17 14.2C17.4 12.4 16.8 10.2 15.2 9.2"
            stroke={secondaryColor}
            strokeWidth="0.8"
            strokeLinecap="round"
          />
          <circle cx="12" cy="10.2" r="0.8" fill={color} />
        </svg>
      );

    case 'rob':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform group-hover:scale-105"
          aria-hidden="true"
        >
          {/* Quarter Coin Proportional Rim (ربع سکه بهار آزادی - سایز ۱۸) */}
          <circle cx="12" cy="12" r="9.8" stroke={color} strokeWidth="1.35" />
          <circle
            cx="12"
            cy="12"
            r="8"
            stroke={secondaryColor}
            strokeWidth="0.8"
            strokeDasharray="1 1.2"
            opacity="0.95"
          />

          {/* Clean Persian Pointed Arch Relief */}
          <path
            d="M9.6 13.8V12.6C9.6 11.2 10.6 10 12 8.8C13.4 10 14.4 11.2 14.4 12.6V13.8H9.6Z"
            stroke={color}
            strokeWidth="1.15"
            strokeLinejoin="round"
            fill={color}
            fillOpacity="0.28"
          />
          <path
            d="M12 7.4V8.8"
            stroke={color}
            strokeWidth="1"
            strokeLinecap="round"
          />
          <circle cx="12" cy="10.8" r="0.75" fill={color} />
        </svg>
      );

    case 'gerami':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform group-hover:scale-105"
          aria-hidden="true"
        >
          {/* Smallest Official Minted Coin Rim (سکه یک گرمی بانکی - سایز ۱۶) */}
          <circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth="1.3" />
          <circle
            cx="12"
            cy="12"
            r="7.4"
            stroke={secondaryColor}
            strokeWidth="0.75"
            strokeDasharray="0.9 1.1"
            opacity="0.95"
          />
          {/* Central 8-Point Official Mint Star Emblem */}
          <path
            d="M12 8L13 10.8L16 12L13 13.2L12 16L11 13.2L8 12L11 10.8L12 8Z"
            fill={color}
            fillOpacity="0.5"
            stroke={color}
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="1" fill={color} />
        </svg>
      );

    case 'parsian':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform group-hover:scale-105"
          aria-hidden="true"
        >
          {/* Parsian Gold Token Security Plaque (پلاک وکیوم طلای پارسیان ۱ گرمی - سایز ۱۷) */}
          {/* Outer Beveled Security Plaque Frame */}
          <rect
            x="4.2"
            y="4.2"
            width="15.6"
            height="15.6"
            rx="3.5"
            stroke={color}
            strokeWidth="1.3"
            fill={color}
            fillOpacity="0.12"
          />
          {/* Inner Security Hallmark Border Ring */}
          <rect
            x="6.5"
            y="6.5"
            width="11"
            height="11"
            rx="2.2"
            stroke={secondaryColor}
            strokeWidth="0.85"
            strokeDasharray="1.5 1"
            opacity="0.9"
          />
          {/* Central 1g Gold Bullion Token Medallion */}
          <circle
            cx="12"
            cy="12"
            r="3.4"
            stroke={color}
            strokeWidth="1"
            fill={color}
            fillOpacity="0.4"
          />
          {/* Fine Weight Hallmark Emblem (نشان عیار و وزن ۱ گرم) */}
          <path
            d="M12 10.2V13.8M10.2 12H13.8"
            stroke={color}
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="0.75" fill={color} />
        </svg>
      );
  }
}

export const ProductIcon: React.FC<ProductIconProps> = ({
  id,
  category,
  name,
  className = '',
  size: explicitSize,
  scaleMultiplier = 1,
}) => {
  const meta = getProductIconMeta(id, category, name);
  const targetSize = Math.round((explicitSize || meta.size) * scaleMultiplier);

  // High-precision SVGs tailored to luxury precious metals
  const renderSvg = () => {
    switch (meta.type) {
      case 'coin':
        return renderCoinSvg(
          meta.coinVariant,
          targetSize,
          meta.color,
          meta.secondaryColor
        );

      case 'gold-bar':
        return (
          <svg
            width={targetSize}
            height={targetSize}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0 transition-transform group-hover:scale-105"
            aria-hidden="true"
          >
            {/* 3D Isometric Gold Ingot / Bullion Bar */}
            {/* Front Face */}
            <path
              d="M4 14.5L6.5 8H17.5L20 14.5L18 18H6L4 14.5Z"
              stroke={meta.color}
              strokeWidth="1.6"
              strokeLinejoin="round"
              fill={meta.color}
              fillOpacity="0.15"
            />
            {/* Top Ingot Chamfer */}
            <path
              d="M6.5 8L17.5 8"
              stroke={meta.color}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            {/* Hallmark Ingot Stamp Line (AU 999.9) */}
            <path
              d="M8.5 13.5H15.5"
              stroke={meta.secondaryColor}
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <circle cx="12" cy="11" r="1.2" fill={meta.color} />
          </svg>
        );

      case 'scale':
        return (
          <svg
            width={targetSize}
            height={targetSize}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0 transition-transform group-hover:scale-105"
            aria-hidden="true"
          >
            {/* Traditional Jeweler's Precision Balance Scale for Mesghal/Mozaneh */}
            {/* Central Pillar */}
            <path
              d="M12 3V20M8 20H16"
              stroke={meta.color}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            {/* Top Pivot Loop */}
            <circle cx="12" cy="4" r="1.5" stroke={meta.color} strokeWidth="1.5" />
            {/* Balance Beam */}
            <path
              d="M4.5 7.5L12 6L19.5 7.5"
              stroke={meta.color}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            {/* Left Pan Strings & Pan */}
            <path d="M4.5 7.5L2.5 13M4.5 7.5L6.5 13" stroke={meta.secondaryColor} strokeWidth="1" />
            <path
              d="M2 13C2 15.2 7 15.2 7 13H2Z"
              stroke={meta.color}
              strokeWidth="1.4"
              fill={meta.color}
              fillOpacity="0.2"
            />
            {/* Right Pan Strings & Pan */}
            <path d="M19.5 7.5L17.5 13M19.5 7.5L21.5 13" stroke={meta.secondaryColor} strokeWidth="1" />
            <path
              d="M17 13C17 15.2 22 15.2 22 13H17Z"
              stroke={meta.color}
              strokeWidth="1.4"
              fill={meta.color}
              fillOpacity="0.2"
            />
          </svg>
        );

      case 'global-gold':
        return (
          <svg
            width={targetSize}
            height={targetSize}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0 transition-transform group-hover:scale-105"
            aria-hidden="true"
          >
            {/* Global Ounce (Globe Meridians + Gold Sparkle Indicator) */}
            <circle cx="12" cy="12" r="9" stroke={meta.color} strokeWidth="1.6" />
            <ellipse
              cx="12"
              cy="12"
              rx="4"
              ry="9"
              stroke={meta.secondaryColor}
              strokeWidth="1.2"
              strokeDasharray="3 1.5"
            />
            <path d="M3.5 12H20.5" stroke={meta.secondaryColor} strokeWidth="1.2" />
            {/* Center Gold Sparkle */}
            <path
              d="M12 8L13 11L16 12L13 13L12 16L11 13L8 12L11 11L12 8Z"
              fill={meta.color}
            />
          </svg>
        );

      case 'silver-bar':
        return (
          <svg
            width={targetSize}
            height={targetSize}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0 transition-transform group-hover:scale-105"
            aria-hidden="true"
          >
            {/* Silver Bullion 1000g Ingot (Cool Platinum/Silver Tones) */}
            <path
              d="M4 14.5L6.5 8H17.5L20 14.5L18 18H6L4 14.5Z"
              stroke={meta.color}
              strokeWidth="1.6"
              strokeLinejoin="round"
              fill={meta.color}
              fillOpacity="0.18"
            />
            <path
              d="M6.5 8L17.5 8"
              stroke={meta.color}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            {/* Ag 999.0 / 1000g Fine Silver Hallmark Lines */}
            <path
              d="M8 13.5H16"
              stroke={meta.secondaryColor}
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M9.5 15.8H14.5"
              stroke={meta.secondaryColor}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        );
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      title={meta.label}
      aria-hidden="true"
    >
      {renderSvg()}
    </span>
  );
};
