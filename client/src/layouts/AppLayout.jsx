import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../components/common/Toast';
import { CalorieEntryModal } from '../components/entries/CalorieEntryModal';
import { AchievementCelebrationModal } from '../components/achievements/AchievementCelebrationModal';
import {
  LayoutDashboard,
  History,
  BarChart3,
  Trophy,
  Settings,
  X,
  Activity,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const AppLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Load streak for header/sidebar badges
  const loadStreak = async () => {
    try {
      const res = await api.get('/dashboard');
      if (res.data?.success && res.data?.data?.streaks) {
        setCurrentStreak(res.data.data.streaks.currentStreak || 0);
      }
    } catch (err) {
      // quiet fail on initial background load
    }
  };

  useEffect(() => {
    loadStreak();
  }, []);

  const handleOpenLogModal = (dateStr = null) => {
    setSelectedDateForModal(dateStr);
    setLogModalOpen(true);
  };

  const handleEntrySaved = () => {
    loadStreak();
    // Dispatch a custom event so child page (e.g. Dashboard or History) can refresh
    window.dispatchEvent(new CustomEvent('caltrack:entry-saved'));
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'History', path: '/history', icon: History },
    { name: 'Statistics', path: '/statistics', icon: BarChart3 },
    { name: 'Achievements', path: '/achievements', icon: Trophy },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#090d16] text-slate-100 overflow-hidden">
      {/* Desktop Collapsible Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        onOpenLogModal={() => handleOpenLogModal(null)}
        currentStreak={currentStreak}
      />

      {/* Mobile Drawer Backdrop & Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-4/5 max-w-xs bg-[#0d121e] border-r border-[#24304d] flex flex-col h-full p-4 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#24304d]">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-base text-white">CalTrack</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-[#161e31]'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-[#24304d]">
              <div className="flex items-center justify-between">
                <div className="truncate">
                  <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-lg"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenLogModal={() => handleOpenLogModal(null)}
          currentStreak={currentStreak}
        />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ onOpenLogModal: handleOpenLogModal }} />
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <CalorieEntryModal
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        initialDate={selectedDateForModal}
        onSaved={handleEntrySaved}
        onDeleted={handleEntrySaved}
      />
      <AchievementCelebrationModal />
      <ToastContainer />
    </div>
  );
};
