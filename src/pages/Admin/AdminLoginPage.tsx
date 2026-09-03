import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { FereshtehLogo } from '../../components/brand/FereshtehLogo';
import { ShieldCheck, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { BrandPattern } from '../../components/brand/BrandPattern';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect to /admin/
  useEffect(() => {
    if (adminService.isAuthenticated()) {
      navigate('/admin/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('لطفاً نام کاربری و کلمه عبور را وارد فرمایید.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = adminService.login(username, password);
      setIsLoading(false);

      if (result.success) {
        navigate('/admin/');
      } else {
        setError(result.message || 'نام کاربری یا رمز عبور اشتباه است.');
      }
    }, 300);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Pattern */}
      <BrandPattern opacity={0.08} />

      {/* Decorative Glows */}
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-[#FFC300]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-[#12366F]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="bg-[#001D3D]/90 border border-[#003566] hover:border-[#FFC300]/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md transition-all">
          {/* Header & Logo */}
          <div className="text-center space-y-3 mb-6">
            <div className="flex justify-center mb-1">
              <FereshtehLogo size="md" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#12366F]/60 border border-[#FFC300]/30 text-xs font-bold text-[#FFD60A]">
              <Lock size={13} />
              <span>ورود به پنل مدیریت</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white">
              سامانه کنترل نرخ و نمادها
            </h1>
            <p className="text-xs text-slate-400">
              مدیریت و اصلاح دستی قیمت‌ها و وضعیت نمایش محصولات
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5 text-right">
              <label
                htmlFor="admin-username"
                className="block text-xs font-bold text-slate-300"
              >
                نام کاربری مدیر
              </label>
              <div className="relative">
                <input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  dir="ltr"
                  autoFocus
                  required
                  className="w-full bg-[#000814] border border-[#003566] focus:border-[#FFC300] rounded-xl pr-4 pl-10 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
                />
                <User
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 text-right">
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold text-slate-300"
              >
                رمز عبور
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  dir="ltr"
                  required
                  className="w-full bg-[#000814] border border-[#003566] focus:border-[#FFC300] rounded-xl pr-4 pl-10 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? 'مخفی کردن رمز' : 'نمایش رمز'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FFC300] to-[#FFD60A] hover:brightness-110 active:scale-[0.99] text-[#000814] font-extrabold text-sm shadow-[0_4px_15px_rgba(255,195,0,0.25)] cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#000814] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>ورود به پنل مدیریت</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Back Link */}
          <div className="mt-6 pt-4 border-t border-[#003566]/60 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#FFD60A] transition-colors"
            >
              <ArrowRight size={14} />
              <span>بازگشت به صفحه اصلی فرشته کوین</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
