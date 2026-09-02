import React from 'react';
import { Layers, Trash2, Clock, Edit3 } from 'lucide-react';
import { toPersianDigits, PENDING_UPDATE_TEXT } from '../../utils/formatters';

interface AdminStatsProps {
  totalCount: number;
  removedCount: number;
  pendingCount: number;
  manualOverrideCount: number;
}

export const AdminStats: React.FC<AdminStatsProps> = ({
  totalCount,
  removedCount,
  pendingCount,
  manualOverrideCount,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Products */}
      <div className="bg-[#001D3D]/90 border border-[#003566] rounded-2xl p-4 flex items-center justify-between">
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
      <div className="bg-[#001D3D]/90 border border-[#003566] rounded-2xl p-4 flex items-center justify-between">
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
      <div className="bg-[#001D3D]/90 border border-[#003566] rounded-2xl p-4 flex items-center justify-between">
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
      <div className="bg-[#001D3D]/90 border border-[#003566] rounded-2xl p-4 flex items-center justify-between">
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
