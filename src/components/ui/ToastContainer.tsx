/**
 * ToastContainer.tsx
 * ─────────────────────────────────────────────────────────────
 * Custom Toast Notifications Container:
 *   • Renders active toasts with smooth enter & exit animations
 *   • Supports 'success', 'error', 'info', 'warning' types
 *   • Modern glassmorphism & dark/light mode compatible
 * ─────────────────────────────────────────────────────────────
 */

import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useBuilderStore } from '../../store/useBuilderStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast, studioTheme } = useBuilderStore();
  const isLight = studioTheme === 'light';

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[20000] flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none select-none px-3">
      {toasts.map((toast) => {
        let icon = <Info className="w-4 h-4 text-blue-500 shrink-0" />;
        let borderBg = isLight
          ? 'bg-white/95 border-slate-200 text-slate-800'
          : 'bg-slate-900/95 border-slate-800 text-slate-100';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
          borderBg = isLight
            ? 'bg-emerald-50/95 border-emerald-300 text-emerald-950'
            : 'bg-emerald-950/90 border-emerald-800 text-emerald-200';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
          borderBg = isLight
            ? 'bg-rose-50/95 border-rose-300 text-rose-950'
            : 'bg-rose-950/90 border-rose-800 text-rose-200';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
          borderBg = isLight
            ? 'bg-amber-50/95 border-amber-300 text-amber-950'
            : 'bg-amber-950/90 border-amber-800 text-amber-200';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start space-x-3 p-3.5 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 transform animate-in slide-in-from-bottom-5 fade-in ${borderBg}`}
          >
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 text-xs font-semibold leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
