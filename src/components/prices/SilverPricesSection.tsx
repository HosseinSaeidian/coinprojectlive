import React from 'react';
import { PriceItem } from '../../types';
import { SectionHeader } from '../common/SectionHeader';
import { PriceCard } from './PriceCard';

interface SilverPricesSectionProps {
  items: PriceItem[];
}

export const SilverPricesSection: React.FC<SilverPricesSectionProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="py-8 scroll-mt-24" id="silver-section">
      <SectionHeader
        title="قیمت نقره"
        subtitle="نرخ خرید و فروش انواع شمش نقره ۱۰۰۰ گرمی (یک کیلویی) نادیر و اماراتی با خلوص استاندارد"
        badge="خلوص استاندارد و معتبر"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {items.map((item) => (
          <PriceCard
            key={item.id}
            item={item}
            highlight={item.id === 'silver-nadir-1000'}
          />
        ))}
      </div>
    </section>
  );
};
