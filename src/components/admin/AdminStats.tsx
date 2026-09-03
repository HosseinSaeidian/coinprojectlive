import React from 'react';
import { Layers, Trash2, Clock, Edit3 } from 'lucide-react';
import { toPersianDigits, PENDING_UPDATE_TEXT } from '../../utils/formatters';

interface AdminStatsProps {
  totalCount: number;
  removedCount: number;
  pendingCount: number;
  manualOverrideCount: number;
  activeFilter?: string;
  onSelectFilter?: (filter: 'all' | 'removed' | 'pending' | 'manual') => void;
}

export const AdminStats: React.FC<AdminStatsProps> = ({
  totalCount,
  removedCount,
  pendingCount,
  manualOverrideCount,
  activeFilter,
  onSelectFilter,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Products */}
      <div
        onClick={() => onSelectFilter?.('all')}
        className={`bg-[#001D3D]/90 border rounded-2xl p-4 flex items-center justify-between transition-all ${
          onSelectFilter ? 'cursor-pointer hover:border-[#FFC300]/50' : ''
        } ${activeFilter === 'all' ? 'border-[#FFC300] shadow-md shadow-[#FFC300]/5' : 'border-[#003566]'}`}
      >
        <div>
          <span className="text-xs text-slate-400 font-medium block mb-1">
            کل نمادها
          </span>
          <span className="text-xl sm:text-2xl font-black text-white">
            {toPersianDigits(totalCount)} <span className="text-xs font-normal text-slate-400">محصول</span>
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#12366F]/50 border border-[#003566] text-[#FFD60A]">
          <Layers size={20} />
        </div>
      </div>

      {/* Removed from Site */}
      <div
        onClick={() => onSelectFilter?.('removed')}
        className={`bg-[#001D3D]/90 border rounded-2xl p-4 flex items-center justify-between transition-all ${
          onSelectFilter ? 'cursor-pointer hover:border-rose-500/60' : ''
        } ${
          activeFilter === 'removed'
            ? 'border-rose-500 ring-1 ring-rose-500/50 shadow-md shadow-rose-500/10'
            : 'border-[#003566]'
        }`}
      >
        <div>
          <span className="text-xs text-rose-400/90 font-medium block mb-1">
            حذف‌شده از سایت
          </span>
          <span className="text-xl sm:text-2xl font-black text-rose-400">
            {toPersianDigits(removedCount)} <span className="text-xs font-normal text-slate-400">مورد</span>
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
          <Trash2 size={20} />
        </div>
      </div>

      {/* Waiting for Update */}
      <div
        onClick={() => onSelectFilter?.('pending')}
        className={`bg-[#001D3D]/90 border rounded-2xl p-4 flex items-center justify-between transition-all ${
          onSelectFilter ? 'cursor-pointer hover:border-amber-500/60' : ''
        } ${
          activeFilter === 'pending'
            ? 'border-amber-500 ring-1 ring-amber-500/50 shadow-md shadow-amber-500/10'
            : 'border-[#003566]'
        }`}
      >
        <div>
          <span className="text-xs text-amber-400/90 font-medium block mb-1">
            {PENDING_UPDATE_TEXT}
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-400">
            {toPersianDigits(pendingCount)} <span className="text-xs font-normal text-slate-400">مورد</span>
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <Clock size={20} />
        </div>
      </div>

      {/* Manual Overrides */}
      <div
        onClick={() => onSelectFilter?.('manual')}
        className={`bg-[#001D3D]/90 border rounded-2xl p-4 flex items-center justify-between transition-all ${
          onSelectFilter ? 'cursor-pointer hover:border-[#FFC300]/60' : ''
        } ${
          activeFilter === 'manual'
            ? 'border-[#FFD60A] ring-1 ring-[#FFD60A]/50 shadow-md shadow-[#FFD60A]/10'
            : 'border-[#003566]'
        }`}
      >
        <div>
          <span className="text-xs text-[#FFD60A] font-medium block mb-1">
            قیمت‌گذاری دستی
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#FFD60A]">
            {toPersianDigits(manualOverrideCount)} <span className="text-xs font-normal text-slate-400">مورد</span>
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#12366F] border border-[#FFC300]/30 text-[#FFD60A]">
          <Edit3 size={20} />
        </div>
      </div>
    </div>
  );
};
