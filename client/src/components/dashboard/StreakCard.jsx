import React from 'react';
import { Flame, Trophy, CalendarCheck, CheckCircle2, Clock } from 'lucide-react';

export const StreakCard = ({
  currentStreak = 0,
  longestStreak = 0,
  totalTrackedDays = 0,
  isLoggedToday = false,
  isStreakActiveToday = false,
  onLogTodayClick,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#111726] to-[#162136] border border-[#24304d] rounded-2xl p-6 shadow-xl shadow-black/20">
      {/* Decorative subtle background emerald aura */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#24304d]/70">
          <div className="flex items-center space-x-4">
            <div
              className={`p-3.5 rounded-2xl border ${
                currentStreak > 0
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 emerald-glow-sm'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
              }`}
            >
              <Flame className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Consistency Streak
                </h3>
                {isLoggedToday ? (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Logged Today</span>
                  </span>
                ) : isStreakActiveToday ? (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    <Clock className="w-3 h-3" />
                    <span>Active – Log Today</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                    <span>Not Active</span>
                  </span>
                )}
              </div>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
                  {currentStreak}
                </span>
                <span className="text-slate-400 text-sm font-medium">
                  {currentStreak === 1 ? 'day streak' : 'days streak'}
                </span>
              </div>
            </div>
          </div>

          {!isLoggedToday && onLogTodayClick && (
            <button
              onClick={onLogTodayClick}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm rounded-xl transition-all duration-200 shadow-md shadow-emerald-950/50 hover:shadow-emerald-500/20 shrink-0"
            >
              Log Today's Intake
            </button>
          )}
        </div>

        {/* Milestone stats row */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="flex items-center space-x-3 p-3 bg-[#0d1321]/60 rounded-xl border border-[#24304d]/50">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                Longest Streak
              </p>
              <p className="text-base font-bold font-mono text-white">
                {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-[#0d1321]/60 rounded-xl border border-[#24304d]/50">
            <div className="p-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-lg">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                Total Days Logged
              </p>
              <p className="text-base font-bold font-mono text-white">
                {totalTrackedDays} {totalTrackedDays === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
