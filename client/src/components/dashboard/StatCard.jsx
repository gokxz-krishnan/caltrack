import React from 'react';

export const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  accent = 'emerald',
  badge,
  badgeType = 'neutral',
  onClick,
}) => {
  const accentClasses = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    blue: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  const badgeClasses = {
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <div
      onClick={onClick}
      className={`group relative p-5 bg-[#111726] border border-[#24304d] hover:border-[#324166] rounded-2xl transition-all duration-200 shadow-lg shadow-black/20 ${
        onClick ? 'cursor-pointer hover:bg-[#141b2e]' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 tracking-wider uppercase">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl border ${accentClasses[accent] || accentClasses.emerald}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold tracking-tight text-white font-mono">
          {value}
        </span>
        {badge && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
              badgeClasses[badgeType] || badgeClasses.neutral
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-2 text-xs text-slate-400 font-normal leading-relaxed">
          {subtext}
        </p>
      )}
    </div>
  );
};
