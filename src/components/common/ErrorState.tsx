import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  title?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'دریافت اطلاعات با مشکل مواجه شد. لطفاً اتصال اینترنت خود را بررسی نمایید.',
  title = 'خطا در بارگذاری اطلاعات بازار',
  onRetry,
}) => {
  return (
    <div
      className="bg-[#001D3D]/90 border border-rose-500/30 rounded-2xl p-8 text-center max-w-lg mx-auto my-8 shadow-xl"
      id="error-state-card"
    >
      <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
        <AlertCircle size={28} />
      </div>

      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-300 mb-6 leading-relaxed">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FFC300] to-[#FFD60A] text-[#000814] font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          <RefreshCw size={16} />
          <span>تلاش مجدد</span>
        </button>
      )}
    </div>
  );
};
