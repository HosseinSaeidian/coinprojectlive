import React from 'react';
import { PriceItem } from '../../types';
import { SectionHeader } from '../common/SectionHeader';
import { PriceCard } from './PriceCard';

interface CoinPricesSectionProps {
  items: PriceItem[];
}

export const CoinPricesSection: React.FC<CoinPricesSectionProps> = ({ items }) => {
  return (
    <section className="py-8 scroll-mt-24" id="coin-section">
      <SectionHeader
        title="قیمت سکه و مسکوکات بانکی"
        subtitle="نرخ خرید و فروش انواع سکه تمام امامی، بهار آزادی، نقد فردا، پس فردایی، نیم، ربع و سکه گرمی"
        badge="بانکی و استاندارد"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {items.map((item) => (
          <PriceCard
            key={item.id}
            item={item}
            highlight={item.id === 'coin-emami' || item.id === 'coin-rob'}
          />
        ))}
      </div>
    </section>
  );
};
