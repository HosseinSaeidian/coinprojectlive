import React from 'react';

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-[#001D3D]/70 border border-[#003566] rounded-xl p-5 animate-pulse space-y-4"
        >
          <div className="flex justify-between items-start">
            <div className="h-5 bg-[#003566] rounded w-28" />
            <div className="h-5 bg-[#003566] rounded w-12" />
          </div>
          <div className="space-y-2">
            <div className="h-8 bg-[#12366F]/50 rounded w-40" />
            <div className="h-4 bg-[#003566]/60 rounded w-24" />
          </div>
          <div className="pt-3 border-t border-[#003566]/60 flex justify-between">
            <div className="h-3.5 bg-[#003566] rounded w-20" />
            <div className="h-3.5 bg-[#003566] rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div className="bg-[#001D3D]/80 border border-[#003566] rounded-xl overflow-hidden animate-pulse">
      <div className="h-12 bg-[#003566]/50 border-b border-[#003566]" />
      <div className="divide-y divide-[#003566]/40 p-2 space-y-2">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="h-14 bg-[#12366F]/20 rounded flex items-center justify-between px-4">
            <div className="h-4 bg-[#003566] rounded w-32" />
            <div className="h-4 bg-[#003566] rounded w-24" />
            <div className="h-4 bg-[#003566] rounded w-24" />
            <div className="h-4 bg-[#003566] rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-[#001D3D]/80 border border-[#003566] rounded-xl p-6 animate-pulse space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-6 bg-[#003566] rounded w-48" />
        <div className="h-8 bg-[#003566] rounded w-36" />
      </div>
      <div className="h-64 bg-[#12366F]/20 rounded-lg flex items-end justify-between p-4 gap-2">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div
            key={idx}
            className="w-full bg-[#003566]/40 rounded-t"
            style={{ height: `${30 + (idx * 5) % 60}%` }}
          />
        ))}
      </div>
    </div>
  );
};
