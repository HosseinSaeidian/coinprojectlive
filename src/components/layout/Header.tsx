import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, Calculator, Clock, Activity, ShieldCheck } from 'lucide-react';
import { FereshtehLogo } from '../brand/FereshtehLogo';
import { getPersianTime, getPersianDate } from '../../utils/formatters';

interface HeaderProps {
  onOpenCalculator: () => void;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCalculator,
  onOpenMobileMenu,
}) => {
  const [time, setTime] = useState<string>(getPersianTime());
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getPersianTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#000814]/95 backdrop-blur-md border-b border-[#003566] shadow-xl py-3'
          : 'bg-[#000814] border-b border-[#001D3D] py-4'
      }`}
      id="main-header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <NavLink to="/" className="transition-transform hover:scale-[1.02]">
            <FereshtehLogo size="md" />
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-[#001D3D]/60 border border-[#003566]/80 rounded-full px-4 py-1.5 backdrop-blur-sm">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#12366F] text-[#FFD60A] shadow-sm border border-[#FFC300]/30'
                    : 'text-slate-300 hover:text-white hover:bg-[#003566]/40'
                }`
              }
            >
              خانه
            </NavLink>

            <a
              href="/#prices-section"
              className="px-4 py-2 rounded-full text-sm font-bold text-slate-300 hover:text-white hover:bg-[#003566]/40 transition-all duration-200"
            >
              قیمت طلا و سکه
            </a>

            <a
              href="/#bubbles-section"
              className="px-4 py-2 rounded-full text-sm font-bold text-slate-300 hover:text-white hover:bg-[#003566]/40 transition-all duration-200"
            >
              حباب سکه
            </a>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#12366F] text-[#FFD60A] shadow-sm border border-[#FFC300]/30'
                    : 'text-slate-300 hover:text-white hover:bg-[#003566]/40'
                }`
              }
            >
              درباره ما
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#12366F] text-[#FFD60A] shadow-sm border border-[#FFC300]/30'
                    : 'text-slate-300 hover:text-white hover:bg-[#003566]/40'
                }`
              }
            >
              تماس با ما
            </NavLink>
          </nav>

          {/* Header Actions / Clock / Quick Calculator */}
          <div className="flex items-center gap-3">
            {/* Live Clock & Persian Date Indicator */}
            <div className="hidden md:flex flex-col items-end pl-3 border-l border-[#003566] text-xs">
              <div className="flex items-center gap-1.5 text-[#FFD60A] font-bold">
                <Clock size={13} />
                <span className="tabular-nums tracking-wider">{time}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {getPersianDate()}
              </span>
            </div>

            {/* Quick Calculator Button */}
            <button
              onClick={onOpenCalculator}
              type="button"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#12366F] hover:bg-[#12366F]/80 text-[#FFD60A] border border-[#FFC300]/40 font-bold text-xs shadow-sm hover:shadow-[0_0_12px_rgba(255,195,0,0.2)] transition-all cursor-pointer"
            >
              <Calculator size={15} />
              <span>محاسبه‌گر طلا</span>
            </button>

            {/* Admin Panel Entry Link */}
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#12366F] text-[#FFD60A] border border-[#FFC300]/40 shadow-sm'
                    : 'bg-[#001D3D] text-slate-300 hover:text-white hover:bg-[#003566] border border-[#003566]'
                }`
              }
              title="ورود به پنل مدیریت دمو"
            >
              <ShieldCheck size={15} className="text-[#FFC300]" />
              <span>پنل مدیریت</span>
            </NavLink>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={onOpenMobileMenu}
              type="button"
              className="lg:hidden p-2.5 rounded-xl bg-[#001D3D] border border-[#003566] text-slate-200 hover:text-[#FFD60A] transition-colors"
              aria-label="باز کردن منوی موبایل"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
