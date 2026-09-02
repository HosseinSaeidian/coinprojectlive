import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
  id?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  action,
  id,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6" id={id}>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-7 rounded-sm bg-gradient-to-b from-[#FFD60A] to-[#FFC300] shadow-[0_0_10px_rgba(255,195,0,0.5)]" />
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            {title}
          </h2>
          {badge && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#12366F]/60 text-[#FFD60A] border border-[#FFC300]/30">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-slate-400 font-normal pr-5">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="flex items-center gap-2 self-start md:self-auto">
          {action}
        </div>
      )}
    </div>
  );
};
