import React from 'react';
import { BrandPattern } from '../../components/brand/BrandPattern';
import { SectionHeader } from '../../components/common/SectionHeader';
import { FereshtehLogo } from '../../components/brand/FereshtehLogo';
import { ShieldCheck, Target, Eye, Gem, Users, Lock, Compass, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-10 space-y-16" id="about-page-container">
      {/* Hero Header for About Page */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#001D3D] via-[#000814] to-[#000814] border-b border-[#001D3D] py-16">
        <BrandPattern opacity={0.06} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#001D3D] border border-[#FFC300]/30 text-xs font-semibold text-[#FFD60A]">
            <span>درباره پلتفرم تخصصی فرشته کوین</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            مرجع شفاف و مطمئن <span className="text-[#FFD60A]">قیمت طلا و سکه</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            «فرشته کوین» با هدف دسترسی آسان، شفاف، بی‌طرفانه و لحظه‌ای به اطلاعات و مظنه‌های رسمی بازار طلای ۱۸ و ۲۴ عیار، انواع سکه و تحلیل دقیق حباب بازار راه‌اندازی شده است.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Story / About Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5 text-right">
            <SectionHeader
              title="داستان فرشته کوین"
              subtitle="تلفیق تجربه سنتی بازار زرگران با فناوری‌های نوین اطلاع‌رسانی مالی"
            />
            <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
              در بازارهای مالی پرتلاطم و پویای طلا و مسکوکات، دسترسی سریع به نرخ‌های موثق و قیمت‌های واقعی کف بازار یکی از مهم‌ترین نیازهای فعالان اقتصادی، صنف طلا و عموم هموطنان است.
            </p>
            <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
              مجموعه <strong className="text-white font-bold">فرشته کوین</strong> با تکیه بر سامانه‌های پیشرفته پایش داده و ارتباط مستقیم با مراجع رسمی صنفی در بازار تهران، بستری امن و مدرن را فراهم آورده تا بدون واسطه، دقیق‌ترین نرخ‌های خرید و فروش و فرمول‌های محاسبه حباب سکه در اختیار شما قرار گیرد.
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-3">
              <div className="bg-[#001D3D]/80 border border-[#003566] p-4 rounded-2xl">
                <span className="text-2xl font-black text-[#FFD60A] block tabular-nums">+۲۴</span>
                <span className="text-xs text-slate-400 font-medium">ساعت پایش مداوم بازار</span>
              </div>
              <div className="bg-[#001D3D]/80 border border-[#003566] p-4 rounded-2xl">
                <span className="text-2xl font-black text-[#FFD60A] block tabular-nums">۱۰۰٪</span>
                <span className="text-xs text-slate-400 font-medium">داده‌های موثق و شفاف</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative bg-gradient-to-br from-[#001D3D] via-[#003566] to-[#000814] border border-[#FFC300]/40 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center text-center space-y-6">
              <BrandPattern opacity={0.1} />
              <FereshtehLogo size="xl" />
              <div className="space-y-2 relative z-10">
                <h3 className="text-lg font-bold text-white">نماد اعتماد و اصالت</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
                  پایبندی به استانداردهای اعلام نرخ و رعایت حقوق مصرف‌کنندگان و معامله‌گران طلا
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vision & Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vision */}
          <div className="bg-[#001D3D]/70 border border-[#003566] hover:border-[#FFC300]/40 rounded-3xl p-8 space-y-4 shadow-xl transition-all">
            <div className="w-14 h-14 rounded-2xl bg-[#12366F] text-[#FFD60A] flex items-center justify-center shadow-md">
              <Eye size={28} />
            </div>
            <h3 className="text-xl font-extrabold text-white">چشم‌انداز ما (Vision)</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              تبدیل شدن به مرجع شماره یک و جامع‌ترین درگاه داده‌محور قیمت‌گذاری فلزات گرانبها در خاورمیانه با بهره‌گیری از هوش مصنوعی، ابزارهای تحلیل تکنیکال و الگوریتم‌های هوشمند سنجش نوسانات.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-[#001D3D]/70 border border-[#003566] hover:border-[#FFC300]/40 rounded-3xl p-8 space-y-4 shadow-xl transition-all">
            <div className="w-14 h-14 rounded-2xl bg-[#12366F] text-[#FFD60A] flex items-center justify-center shadow-md">
              <Target size={28} />
            </div>
            <h3 className="text-xl font-extrabold text-white">ماموریت ما (Mission)</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              ارتقای سطح سواد مالی و شفاف‌سازی فرآیند قیمت‌گذاری طلا و سکه، حذف رانت‌های اطلاعاتی و توانمندسازی افراد برای تصمیم‌گیری‌های هوشمندانه و مطمئن سرمایه‌گذاری.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <section className="space-y-8">
          <SectionHeader
            title="ارزش‌های بنیادین فرشته کوین"
            subtitle="اصولی که هر روز فعالیت‌های ما را هدایت می‌کنند"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-[#001D3D]/90 border border-[#003566] rounded-2xl p-6 space-y-3">
              <div className="p-3 rounded-xl bg-[#12366F] text-[#FFD60A] w-fit">
                <ShieldCheck size={22} />
              </div>
              <h4 className="text-base font-bold text-white">صداقت و بی‌طرفی</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                ارائه اطلاعات بدون سوگیری یا هدایت مصنوعی قیمت‌ها.
              </p>
            </div>

            <div className="bg-[#001D3D]/90 border border-[#003566] rounded-2xl p-6 space-y-3">
              <div className="p-3 rounded-xl bg-[#12366F] text-[#FFD60A] w-fit">
                <Gem size={22} />
              </div>
              <h4 className="text-base font-bold text-white">دقت و کیفیت داده</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                اعتبارسنجی چندمرحله‌ای مظنه‌ها پیش از انتشار در سامانه.
              </p>
            </div>

            <div className="bg-[#001D3D]/90 border border-[#003566] rounded-2xl p-6 space-y-3">
              <div className="p-3 rounded-xl bg-[#12366F] text-[#FFD60A] w-fit">
                <Users size={22} />
              </div>
              <h4 className="text-base font-bold text-white">احترام به کاربران</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                طراحی ساده، روان و عاری از پیچیدگی‌های غیرضروری برای عموم مردم.
              </p>
            </div>

            <div className="bg-[#001D3D]/90 border border-[#003566] rounded-2xl p-6 space-y-3">
              <div className="p-3 rounded-xl bg-[#12366F] text-[#FFD60A] w-fit">
                <Compass size={22} />
              </div>
              <h4 className="text-base font-bold text-white">توسعه مستمر</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                به‌کارگیری آخرین ابزارهای تحلیلی و ابزارهای سنجش ارزش بازار.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
