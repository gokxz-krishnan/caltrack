import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  BarChart3,
  Trophy,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Activity,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isCollapsed, onToggleCollapse, onOpenLogModal, currentStreak = 0 }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'History', path: '/history', icon: History },
    { name: 'Statistics', path: '/statistics', icon: BarChart3 },
    { name: 'Achievements', path: '/achievements', icon: Trophy },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative hidden md:flex flex-col bg-[#0d121e] border-r border-[#24304d] transition-all duration-300 ease-in-out shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-[#24304d]/70">
        <NavLink to="/" className="flex items-center space-x-3 overflow-hidden">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <span className="font-extrabold text-base tracking-tight text-white block">
                CalTrack
              </span>
              <span className="text-[10px] text-emerald-400 font-medium tracking-wider uppercase block">
                Consistency Tracker
              </span>
            </div>
          )}
        </NavLink>

        <button
          onClick={onToggleCollapse}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#161e31] transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Action: Log Today */}
      <div className="p-4">
        <button
          onClick={onOpenLogModal}
          className={`w-full flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all shadow-md shadow-emerald-950/40 ${
            isCollapsed ? 'p-3' : 'px-4 py-2.5 text-sm'
          }`}
          title="Log Daily Calorie Estimate"
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Log Today</span>}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#141b2e]'
                }`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Streak badge */}
      {!isCollapsed && currentStreak > 0 && (
        <div className="mx-4 mb-4 p-3 bg-gradient-to-r from-emerald-950/40 to-[#121c2c] border border-emerald-500/20 rounded-xl flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
            <Flame className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">
              Current Streak
            </span>
            <span className="text-sm font-bold font-mono text-emerald-300">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>
      )}

      {/* User & Logout Footer */}
      <div className="p-3 border-t border-[#24304d]/70 bg-[#0a0f1a]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-xs text-emerald-400 shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-[#161e31] transition-colors shrink-0"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
