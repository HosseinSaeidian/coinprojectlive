import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ShieldCheck, Award, ArrowUp, Globe } from 'lucide-react';
import { FereshtehLogo } from '../brand/FereshtehLogo';
import { BrandPattern } from '../brand/BrandPattern';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#000814] border-t border-[#001D3D] text-slate-300 pt-16 pb-8 overflow-hidden" id="main-footer">
      {/* Background Brand Pattern */}
      <BrandPattern opacity={0.04} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#001D3D]">
          {/* Column 1: Brand & Bio */}
          <div className="space-y-4 lg:col-span-1">
            <FereshtehLogo size="lg" />
            <p className="text-sm text-slate-400 leading-relaxed pt-2">
              سامانه جامع «فرشته کوین»، مرجع معتبر و تخصصی استعلام لحظه‌ای نرخ طلا، انواع مسکوکات بهار آزادی، مظنه مثقال و حباب قیمت در بازار ایران با شفافیت و دقت کامل.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#001D3D] border border-[#003566] text-xs text-[#FFD60A]">
                <ShieldCheck size={16} />
                <span>مرجع مستقل داده‌های بازار</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#001D3D] border border-[#003566] text-xs text-[#FFD60A]">
                <Award size={16} />
                <span>دقت و شفافیت</span>
              </div>
            </div>
          </div>

          {/* Column 2: Fast Navigation */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#FFC300] rounded-sm" />
              دسترسی سریع
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-[#FFD60A] transition-colors">
                  صفحه اصلی و جدول قیمت‌ها
                </Link>
              </li>
              <li>
                <a href="/#gold-section" className="text-slate-400 hover:text-[#FFD60A] transition-colors">
                  قیمت انواع طلای ۱۸ و ۲۴ عیار
                </a>
              </li>
              <li>
                <a href="/#coin-section" className="text-slate-400 hover:text-[#FFD60A] transition-colors">
                  نرخ سکه امامی و بهار آزادی
                </a>
              </li>
              <li>
                <a href="/#bubbles-section" className="text-slate-400 hover:text-[#FFD60A] transition-colors">
                  تحلیل و محاسبه حباب سکه
                </a>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-[#FFD60A] transition-colors">
                  درباره پلتفرم فرشته کوین
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-[#FFD60A] transition-colors">
                  ارتباط با ما و ثبت نظرات
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Market Commodities */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#FFC300] rounded-sm" />
              مظنه‌ها و نمادها
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex justify-between items-center">
                <span>طلای ۱۸ عیار / ۷۵۰</span>
                <span className="text-[#FFD60A] text-xs">گرم</span>
              </li>
              <li className="flex justify-between items-center">
                <span>سکه امامی (طرح جدید)</span>
                <span className="text-[#FFD60A] text-xs">۸.۱۳۳ گرم</span>
              </li>
              <li className="flex justify-between items-center">
                <span>مثقال طلای تهران</span>
                <span className="text-[#FFD60A] text-xs">۱۷ عیار</span>
              </li>
              <li className="flex justify-between items-center">
                <span>ربع سکه بهار آزادی</span>
                <span className="text-[#FFD60A] text-xs">۲.۰۳۳ گرم</span>
              </li>
              <li className="flex justify-between items-center">
                <span>اونس جهانی طلا</span>
                <span className="text-[#FFD60A] text-xs">XAU/USD</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact info */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#FFC300] rounded-sm" />
              اطلاعات تماس
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin size={18} className="text-[#FFC300] shrink-0 mt-0.5" />
                <span className="leading-relaxed">تهران، خیابان امام خمینی، خیابان جیحون، تقاطع مالک اشتر، پاساژ مسعود، طبقه اول</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={18} className="text-[#FFC300] shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <a href="tel:02166834042" dir="ltr" className="tabular-nums font-mono text-slate-200 hover:text-[#FFD60A] transition-colors">021-66834042</a>
                  <a href="tel:09121309277" dir="ltr" className="tabular-nums font-mono text-slate-200 hover:text-[#FFD60A] transition-colors">09121309277</a>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Globe size={18} className="text-[#FFC300] shrink-0" />
                <a href="http://www.fereshteh-coin.com" target="_blank" rel="noreferrer" className="font-mono text-slate-200 hover:text-[#FFD60A] transition-colors">
                  www.fereshteh-coin.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock size={18} className="text-[#FFC300] shrink-0" />
                <span>شنبه تا چهارشنبه: ۹:۰۰ الی ۱۸:۰۰</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="text-center md:text-right leading-relaxed">
            تمامی حقوق مادی و معنوی این وب‌سایت متعلق به <strong className="text-slate-300 font-bold">فرشته کوین (Fereshteh Coin)</strong> می‌باشد. قیمت‌های نمایش داده شده صرفاً جهت اطلاع‌رسانی از میانگین معاملات رسمی بازار زرگران است.
          </p>

          <button
            onClick={scrollToTop}
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#001D3D] hover:bg-[#003566] border border-[#003566] text-slate-300 hover:text-[#FFD60A] transition-all shrink-0 cursor-pointer"
            aria-label="بازگشت به بالای صفحه"
          >
            <span>بالای صفحه</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
};
