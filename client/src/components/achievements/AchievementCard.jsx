import React from 'react';
import {
  Footprints,
  Flame,
  ShieldCheck,
  CalendarCheck,
  Zap,
  Award,
  Medal,
  Crown,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { formatDisplayDate } from '../../utils/dateUtils';

const ICON_MAP = {
  Footprints,
  Flame,
  ShieldCheck,
  CalendarCheck,
  Zap,
  Award,
  Medal,
  Crown,
};

export const AchievementCard = ({ achievement }) => {
  const {
    title,
    description,
    milestoneDays,
    icon,
    isUnlocked,
    unlockedAt,
    progressPercentage = 0,
    currentDays = 0,
  } = achievement;

  const IconComponent = ICON_MAP[icon] || Award;

  return (
    <div
      className={`relative overflow-hidden p-5 rounded-2xl border transition-all duration-200 ${
        isUnlocked
          ? 'bg-gradient-to-br from-[#111c2a] to-[#14263a] border-emerald-500/30 shadow-lg shadow-emerald-950/20'
          : 'bg-[#111726]/60 border-[#24304d]/60 opacity-80 hover:opacity-100'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-2xl border ${
            isUnlocked
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 emerald-glow-sm'
              : 'bg-[#161e31] border-[#24304d] text-slate-500'
          }`}
        >
          {isUnlocked ? (
            <IconComponent className="w-6 h-6" />
          ) : (
            <Lock className="w-6 h-6 text-slate-500" />
          )}
        </div>

        <span
          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            isUnlocked
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-slate-800/80 border-slate-700 text-slate-400'
          }`}
        >
          {isUnlocked ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Unlocked</span>
            </>
          ) : (
            <span>{milestoneDays} Days Goal</span>
          )}
        </span>
      </div>

      <h4 className="text-base font-bold text-white mb-1 tracking-tight">
        {title}
      </h4>
      <p className="text-xs text-slate-400 leading-relaxed mb-4 min-h-[34px]">
        {description}
      </p>

      {/* Progress bar */}
      <div className="space-y-1.5 pt-2 border-t border-[#24304d]/50">
        <div className="flex justify-between items-center text-[11px] font-mono">
          <span className="text-slate-400">
            {isUnlocked
              ? `Unlocked on ${formatDisplayDate(unlockedAt ? new Date(unlockedAt).toISOString().slice(0, 10) : '')}`
              : `Progress: ${Math.min(currentDays, milestoneDays)} / ${milestoneDays} days`}
          </span>
          <span className={isUnlocked ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
            {progressPercentage}%
          </span>
        </div>

        <div className="w-full bg-[#161e31] h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isUnlocked ? 'bg-emerald-400' : 'bg-slate-600'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
