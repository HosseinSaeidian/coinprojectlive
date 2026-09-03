import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { contactService } from '../../services/contactService';
import { ContactFormData } from '../../types';
import { toEnglishDigits } from '../../utils/formatters';

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    phoneNumber: '',
    email: '',
    subject: 'استعلام قیمت و مشاوره طلا',
    message: '',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [successResponse, setSuccessResponse] = useState<{ message: string; refId: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'لطفاً نام و نام خانوادگی خود را وارد نمایید.';
    }

    const cleanPhone = toEnglishDigits(formData.phoneNumber.trim());
    if (!cleanPhone) {
      errors.phoneNumber = 'لطفاً شماره تماس را وارد فرمایید.';
    } else if (!/^09\d{9}$/.test(cleanPhone)) {
      errors.phoneNumber = 'شماره موبایل باید ۱۱ رقمی و با ۰۹ شروع شود.';
    }

    if (!formData.message.trim()) {
      errors.message = 'لطفاً متن پیام خود را بنویسید.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) return;

    try {
      setLoading(true);
      const res = await contactService.submitContactForm(formData);
      setSuccessResponse({
        message: res.message || 'پیام شما با موفقیت ثبت گردید.',
        refId: res.data.referenceId,
      });
      setFormData({
        fullName: '',
        phoneNumber: '',
        email: '',
        subject: 'استعلام قیمت و مشاوره طلا',
        message: '',
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('خطایی در ارسال پیام رخ داد. لطفاً مجدداً تلاش فرمایید.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (successResponse) {
    return (
      <div className="bg-[#001D3D] border border-emerald-500/40 rounded-3xl p-8 text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 size={36} />
        </div>
        <h3 className="text-xl font-extrabold text-white">پیام شما با موفقیت ثبت شد</h3>
        <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
          {successResponse.message}
        </p>
        <div className="inline-block bg-[#000814] px-4 py-2 rounded-xl border border-[#003566] text-xs">
          <span className="text-slate-400 ml-2">کد پیگیری:</span>
          <strong className="text-[#FFD60A] font-mono text-sm tracking-wider">{successResponse.refId}</strong>
        </div>
        <div className="pt-3">
          <button
            onClick={() => setSuccessResponse(null)}
            type="button"
            className="px-6 py-2.5 rounded-xl bg-[#12366F] hover:bg-[#003566] text-white font-bold text-xs transition-colors cursor-pointer"
          >
            ارسال پیام جدید
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#001D3D]/90 border border-[#003566] rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white">ارسال پیام به کارشناسان فرشته کوین</h3>
        <p className="text-xs text-slate-400">
          فرم زیر را تکمیل فرمایید؛ در کوتاه‌ترین زمان ممکن پاسخگوی شما خواهیم بود.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-rose-950/70 border border-rose-500/30 rounded-xl p-3.5 flex items-start gap-2 text-xs text-rose-300">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            نام و نام خانوادگی <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="مثال: علی محمدی"
            className={`w-full bg-[#000814] border ${
              fieldErrors.fullName ? 'border-rose-500' : 'border-[#003566]'
            } focus:border-[#FFC300] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all`}
          />
          {fieldErrors.fullName && (
            <span className="text-[11px] text-rose-400 mt-1 block">{fieldErrors.fullName}</span>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            شماره تماس همراه <span className="text-rose-400">*</span>
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            dir="ltr"
            className={`w-full bg-[#000814] border ${
              fieldErrors.phoneNumber ? 'border-rose-500' : 'border-[#003566]'
            } focus:border-[#FFC300] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none text-right transition-all font-mono`}
          />
          {fieldErrors.phoneNumber && (
            <span className="text-[11px] text-rose-400 mt-1 block">{fieldErrors.phoneNumber}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            آدرس ایمیل (اختیاری)
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="name@domain.com"
            dir="ltr"
            className="w-full bg-[#000814] border border-[#003566] focus:border-[#FFC300] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none text-right transition-all"
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">موضوع پیام</label>
          <select
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full bg-[#000814] border border-[#003566] focus:border-[#FFC300] rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all"
          >
            <option value="استعلام قیمت و مشاوره طلا">استعلام قیمت و مشاوره طلا</option>
            <option value="پیشنهاد همکاری تجاری">پیشنهاد همکاری تجاری</option>
            <option value="گزارش خطا یا مغایرت قیمت">گزارش خطا یا مغایرت قیمت</option>
            <option value="سایر موضوعات">سایر موضوعات</option>
          </select>
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-bold text-slate-300 mb-1.5">
          متن پیام <span className="text-rose-400">*</span>
        </label>
        <textarea
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="پیام، نظر یا سوال خود را اینجا بنویسید..."
          className={`w-full bg-[#000814] border ${
            fieldErrors.message ? 'border-rose-500' : 'border-[#003566]'
          } focus:border-[#FFC300] rounded-xl p-4 text-sm text-white placeholder-slate-500 outline-none transition-all`}
        />
        {fieldErrors.message && (
          <span className="text-[11px] text-rose-400 mt-1 block">{fieldErrors.message}</span>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FFC300] to-[#FFD60A] text-[#000814] font-extrabold text-sm sm:text-base hover:brightness-110 active:scale-98 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>در حال ارسال پیام...</span>
          </>
        ) : (
          <>
            <Send size={18} />
            <span>ارسال پیام</span>
          </>
        )}
      </button>
    </form>
  );
};
