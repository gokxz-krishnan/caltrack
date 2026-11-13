import React from 'react';
import { CalendarX } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = CalendarX,
  title = 'No data recorded yet',
  description = 'Start tracking your daily calorie estimate to build your streak.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[#111726]/50 border border-[#24304d]/70 rounded-2xl">
      <div className="p-3 bg-[#161e31] border border-[#24304d] rounded-2xl mb-4 text-emerald-400">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-100">{title}</h3>
      <p className="mt-1 text-sm text-slate-400 max-w-sm leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-sm rounded-xl transition-all duration-200 shadow-md shadow-emerald-950/40"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
