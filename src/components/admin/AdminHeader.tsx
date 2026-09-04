import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FereshtehLogo } from '../brand/FereshtehLogo';
import { adminService } from '../../services/adminService';
import { LogOut, ExternalLink, ShieldCheck, Home, Monitor } from 'lucide-react';

interface AdminHeaderProps {
  onLogout?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    adminService.logout();
    if (onLogout) {
      onLogout();
    } else {
      navigate('/adminfereshteh/');
    }
  };

  return (
    <header className="bg-[#001D3D] border-b border-[#003566] sticky top-0 z-40 shadow-xl backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <FereshtehLogo size="sm" />
            </Link>

            <div className="hidden sm:block h-8 w-[1px] bg-[#003566]" />

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#12366F]/80 border border-[#FFC300]/30 text-[#FFD60A]">
                <ShieldCheck size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-white">
                    پنل مدیریت نرخ و محصولات
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#12366F] text-[#FFD60A] border border-[#FFC300]/30">
                    نسخه آزمایشی
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  فرشته کوین • سامانه مدیریت دستی قیمت‌ها و وضعیت انتشار
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Monitoring Display Button */}
            <Link
              to="/admin/monitoring"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FFC300]/20 to-[#FFD60A]/10 hover:from-[#FFC300]/30 hover:to-[#FFD60A]/20 text-[#FFD60A] hover:text-white border border-[#FFC300]/40 hover:border-[#FFD60A] text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer group"
              title="باز کردن تابلوی مانیتورینگ ویترین در پنجره جدید"
            >
              <Monitor size={16} className="text-[#FFC300] group-hover:scale-110 transition-transform" />
              <span>مانیتورینگ</span>
              <ExternalLink size={12} className="opacity-70" />
            </Link>

            {/* Return to Website */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#000814]/70 hover:bg-[#000814] text-slate-200 hover:text-white border border-[#003566] hover:border-[#FFC300]/40 text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              <Home size={16} className="text-[#FFC300]" />
              <span className="hidden sm:inline">مشاهده و بازگشت به وب‌سایت</span>
              <span className="sm:hidden">سایت</span>
            </Link>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs sm:text-sm font-bold transition-all cursor-pointer"
              title="خروج از حساب مدیریت"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
