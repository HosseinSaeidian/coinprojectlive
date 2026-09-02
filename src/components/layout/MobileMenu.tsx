import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, Home, Coins, Info, PhoneCall, Calculator, Sparkles, ShieldCheck } from 'lucide-react';
import { FereshtehLogo } from '../brand/FereshtehLogo';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCalculator: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  onOpenCalculator,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-[#001D3D] border-l border-[#003566] p-6 shadow-2xl flex flex-col justify-between z-10 overflow-y-auto">
        <div className="space-y-6">
          {/* Header & Close */}
          <div className="flex items-center justify-between pb-4 border-b border-[#003566]">
            <FereshtehLogo size="sm" />
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#003566]/60 text-slate-300 hover:text-white transition-colors"
              aria-label="بستن منو"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex flex-col gap-2">
            <NavLink
              to="/"
              onClick={onClose}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  isActive
                    ? 'bg-[#12366F] text-[#FFD60A] border border-[#FFC300]/30'
                    : 'text-slate-300 hover:bg-[#003566]/60 hover:text-white'
                }`
              }
            >
              <Home size={18} />
              <span>خانه</span>
            </NavLink>

            <a
              href="/#gold-section"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-300 hover:bg-[#003566]/60 hover:text-white transition-all"
            >
              <Coins size={18} />
              <span>قیمت طلا و سکه</span>
            </a>

            <a
              href="/#bubbles-section"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-300 hover:bg-[#003566]/60 hover:text-white transition-all"
            >
              <Sparkles size={18} />
              <span>حباب سکه</span>
            </a>

            <NavLink
              to="/about"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  isActive
                    ? 'bg-[#12366F] text-[#FFD60A] border border-[#FFC300]/30'
                    : 'text-slate-300 hover:bg-[#003566]/60 hover:text-white'
                }`
              }
            >
              <Info size={18} />
              <span>درباره ما</span>
            </NavLink>

            <NavLink
              to="/contact"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  isActive
                    ? 'bg-[#12366F] text-[#FFD60A] border border-[#FFC300]/30'
                    : 'text-slate-300 hover:bg-[#003566]/60 hover:text-white'
                }`
              }
            >
              <PhoneCall size={18} />
              <span>تماس با ما</span>
            </NavLink>

            <NavLink
              to="/admin"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  isActive
                    ? 'bg-[#12366F] text-[#FFD60A] border border-[#FFC300]/30'
                    : 'text-slate-300 hover:bg-[#003566]/60 hover:text-white'
                }`
              }
            >
              <ShieldCheck size={18} className="text-[#FFC300]" />
              <span>پنل مدیریت</span>
            </NavLink>
          </nav>
        </div>

        {/* Bottom CTA / Calculator */}
        <div className="pt-6 border-t border-[#003566] space-y-3">
          <button
            onClick={() => {
              onClose();
              onOpenCalculator();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#FFC300] to-[#FFD60A] text-[#000814] font-extrabold text-sm shadow-md cursor-pointer hover:brightness-110 active:scale-98 transition-all"
          >
            <Calculator size={18} />
            <span>محاسبه‌گر ارزش طلا</span>
          </button>

          <p className="text-[11px] text-center text-slate-400">
            سامانه تخصصی فرشته کوین • بروزرسانی لحظه‌ای
          </p>
        </div>
      </div>
    </div>
  );
};
