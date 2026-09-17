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
        title="قیمت مسکوکات بانکی"
        subtitle="نرخ لحظه ای خرید و فروش انواع مسکوکات بانک مرکزی جمهوری اسلامی ایران"
        badge="بانکی و استاندارد"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {items.map((item) => (
          <PriceCard
            key={item.id}
            item={item}
          />
        ))}
      </div>
    </section>
  );
};
