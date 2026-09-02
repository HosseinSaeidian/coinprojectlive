import React from 'react';
import { PriceItem } from '../../types';
import { SectionHeader } from '../common/SectionHeader';
import { PriceCard } from './PriceCard';

interface GoldPricesSectionProps {
  items: PriceItem[];
}

export const GoldPricesSection: React.FC<GoldPricesSectionProps> = ({ items }) => {
  return (
    <section className="py-8 scroll-mt-24" id="gold-section">
      <SectionHeader
        title="قیمت طلا"
        subtitle="نرخ لحظه‌ای طلای ۱۸ و ۲۴ عیار، مثقال مظنه بازار تهران، آبشده و اونس جهانی"
        badge="بروزرسانی زنده"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {items.map((item) => (
          <PriceCard
            key={item.id}
            item={item}
            highlight={item.id === 'gold-18k' || item.id === 'gold-mesghal'}
          />
        ))}
      </div>
    </section>
  );
};
