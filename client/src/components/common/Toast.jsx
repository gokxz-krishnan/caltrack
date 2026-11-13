import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-800/80 text-rose-100'
              : toast.type === 'info'
              ? 'bg-sky-950/90 border-sky-800/80 text-sky-100'
              : 'bg-[#111c26]/95 border-emerald-500/30 text-emerald-100 shadow-emerald-950/30'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            ) : toast.type === 'info' ? (
              <Info className="w-5 h-5 text-sky-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div className="flex-1 text-sm font-medium leading-snug">
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded-md hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
