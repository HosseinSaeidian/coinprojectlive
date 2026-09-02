import React from 'react';
import { BrandPattern } from '../../components/brand/BrandPattern';
import { SectionHeader } from '../../components/common/SectionHeader';
import { ContactForm } from '../../components/forms/ContactForm';
import { Phone, Mail, MapPin, Clock, MessageSquare, ShieldAlert, Globe } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="py-10 space-y-16" id="contact-page-container">
      {/* Contact Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#001D3D] via-[#000814] to-[#000814] border-b border-[#001D3D] py-16">
        <BrandPattern opacity={0.06} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#001D3D] border border-[#FFC300]/30 text-xs font-semibold text-[#FFD60A]">
            <span>پشتیبانی و ارتباط با کارشناسان</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            تماس با <span className="text-[#FFD60A]">فرشته کوین</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            مشتاقانه آماده شنیدن نظرات، پیشنهادات، گزارش‌های مغایرت قیمت و همکاری‌های تجاری با شما هستیم.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left / Top Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <SectionHeader
              title="اطلاعات ارتباطی"
              subtitle="راه‌های دسترسی مستقیم به دفتر مرکزی فرشته کوین"
            />

            <div className="space-y-4">
              {/* Phone */}
              <div className="bg-[#001D3D]/80 border border-[#003566] hover:border-[#FFC300]/40 rounded-2xl p-5 flex items-start gap-4 transition-all">
                <div className="p-3 rounded-xl bg-[#12366F] text-[#FFD60A] shrink-0">
                  <Phone size={22} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-bold block">شماره تلفن‌های رسمی و پشتیبانی:</span>
                  <div className="flex flex-col gap-1 pt-0.5">
                    <a href="tel:02166834042" className="font-mono text-base font-bold text-white tracking-wider hover:text-[#FFD60A] transition-colors" dir="ltr">
                      021-66834042
                    </a>
                    <a href="tel:09121309277" className="font-mono text-sm font-bold text-slate-200 hover:text-[#FFD60A] transition-colors" dir="ltr">
                      09121309277
                    </a>
                  </div>
                </div>
              </div>

              {/* Website */}
              <div className="bg-[#001D3D]/80 border border-[#003566] hover:border-[#FFC300]/40 rounded-2xl p-5 flex items-start gap-4 transition-all">
                <div className="p-3 rounded-xl bg-[#12366F] text-[#FFD60A] shrink-0">
                  <Globe size={22} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-bold block">وب‌سایت رسمی:</span>
                  <a
                    href="http://www.fereshteh-coin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-sm font-bold text-[#FFD60A] hover:underline block pt-0.5"
                  >
                    www.fereshteh-coin.com
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="bg-[#001D3D]/80 border border-[#003566] hover:border-[#FFC300]/40 rounded-2xl p-5 flex items-start gap-4 transition-all">
                <div className="p-3 rounded-xl bg-[#12366F] text-[#FFD60A] shrink-0">
                  <MapPin size={22} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-bold block">نشانی دفتر مرکزی:</span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    تهران، خیابان امام خمینی، خیابان جیحون، تقاطع مالک اشتر، پاساژ مسعود، طبقه اول
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="bg-[#001D3D]/80 border border-[#003566] hover:border-[#FFC300]/40 rounded-2xl p-5 flex items-start gap-4 transition-all">
                <div className="p-3 rounded-xl bg-[#12366F] text-[#FFD60A] shrink-0">
                  <Clock size={22} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-bold block">ساعات پاسخگویی و فعالیت:</span>
                  <p className="text-xs text-slate-300">شنبه تا چهارشنبه: ۹:۰۰ الی ۱۸:۰۰</p>
                  <p className="text-xs text-slate-300">پنج‌شنبه‌ها: ۹:۰۰ الی ۱۴:۰۰</p>
                </div>
              </div>
            </div>

            {/* Disclaimer notice */}
            <div className="bg-[#000814] border border-[#003566] p-4 rounded-2xl flex items-start gap-2.5 text-xs text-slate-400">
              <ShieldAlert size={16} className="text-[#FFC300] shrink-0 mt-0.5" />
              <span>
                توجه: ثبت سفارش خرید یا فروش طلا از طریق این فرم امکان‌پذیر نیست و این درگاه صرفاً برای مشاوره اطلاعاتی و پشتیبانی فنی می‌باشد.
              </span>
            </div>
          </div>

          {/* Right Form Area */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
};
