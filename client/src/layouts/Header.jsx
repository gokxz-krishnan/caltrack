import React from 'react';
import { Menu, PlusCircle, Activity, Flame, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDisplayDate, formatDateKey } from '../utils/dateUtils';

export const Header = ({ onOpenMobileMenu, onOpenLogModal, currentStreak = 0 }) => {
  const { user, logout } = useAuth();
  const todayFormatted = formatDisplayDate(formatDateKey(new Date()), {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-[#0d121e]/90 backdrop-blur-md border-b border-[#24304d]/70 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Mobile brand & hamburger */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden text-slate-400 hover:text-white p-2 rounded-xl hover:bg-[#161e31]"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="md:hidden flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-bold text-base text-white">CalTrack</span>
        </div>

        {/* Desktop Header Left */}
        <div className="hidden md:block">
          <p className="text-xs font-medium text-slate-400">{todayFormatted}</p>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            Welcome back, <span className="text-emerald-400">{user?.name || 'Friend'}</span>
          </h2>
        </div>
      </div>

      {/* Header Right */}
      <div className="flex items-center space-x-3">
        {/* Streak badge */}
        {currentStreak > 0 && (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold font-mono">
            <Flame className="w-3.5 h-3.5 text-emerald-400" />
            <span>{currentStreak}d Streak</span>
          </div>
        )}

        {/* Quick Log button */}
        <button
          onClick={onOpenLogModal}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-sm shadow-emerald-950/40"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Log Today</span>
          <span className="sm:hidden">Log</span>
        </button>

        <button
          onClick={logout}
          className="md:hidden text-slate-400 hover:text-rose-400 p-2 rounded-xl hover:bg-[#161e31] transition-colors"
          title="Log Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
