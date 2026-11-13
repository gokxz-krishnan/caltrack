import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';
import { StatCard } from '../components/dashboard/StatCard';
import { StreakCard } from '../components/dashboard/StreakCard';
import { ContributionCalendar } from '../components/dashboard/ContributionCalendar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { formatDisplayDate } from '../utils/dateUtils';
import {
  Flame,
  Trophy,
  CalendarCheck,
  Scale,
  Sparkles,
  ArrowUpRight,
  Edit2,
  PlusCircle,
  Award,
} from 'lucide-react';

export const Dashboard = () => {
  const { onOpenLogModal } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchDashboard = useCallback(async (year) => {
    try {
      const res = await api.get(`/dashboard?year=${year}`);
      if (res.data?.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(selectedYear);
  }, [fetchDashboard, selectedYear]);

  // Listen for global custom event when an entry is saved or deleted
  useEffect(() => {
    const handleEntrySaved = () => {
      fetchDashboard(selectedYear);
    };
    window.addEventListener('caltrack:entry-saved', handleEntrySaved);
    return () => window.removeEventListener('caltrack:entry-saved', handleEntrySaved);
  }, [fetchDashboard, selectedYear]);

  if (loading) {
    return <LoadingSpinner text="Loading your consistency dashboard..." />;
  }

  const {
    streaks = {},
    todayEntry,
    nextMilestone,
    calendar = {},
    recentEntries = [],
    recentAchievements = [],
  } = dashboardData || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner: Philosophy & Motivational Quote */}
      <div className="relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#111c2a] via-[#121f33] to-[#14233a] border border-emerald-500/25 shadow-xl shadow-black/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Core Philosophy</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              "Consistency over perfection."
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Imperfect estimates logged consistently beat sporadic perfection every single time.
            </p>
          </div>

          <button
            onClick={() => onOpenLogModal(null)}
            className="inline-flex items-center space-x-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-2xl transition-all shadow-lg shadow-emerald-950/50 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{todayEntry ? 'Edit Today\'s Intake' : 'Log Today\'s Calorie Estimate'}</span>
          </button>
        </div>
      </div>

      {/* Hero Streak & Key Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Streak Main Card (2 columns on lg) */}
        <div className="lg:col-span-2">
          <StreakCard
            currentStreak={streaks.currentStreak || 0}
            longestStreak={streaks.longestStreak || 0}
            totalTrackedDays={streaks.totalTrackedDays || 0}
            isLoggedToday={streaks.isLoggedToday}
            isStreakActiveToday={streaks.isStreakActiveToday}
            onLogTodayClick={() => onOpenLogModal(streaks.todayDate)}
          />
        </div>

        {/* Today's Calorie Card */}
        <div className="bg-[#111726] border border-[#24304d] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Today's Calorie Intake
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Scale className="w-4 h-4" />
              </div>
            </div>

            {todayEntry ? (
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Estimated Range</span>
                  <p className="text-2xl font-bold font-mono text-white mt-0.5">
                    {todayEntry.minCalories} – {todayEntry.maxCalories} <span className="text-sm font-sans text-slate-400">kcal</span>
                  </p>
                </div>

                <div className="p-3 bg-[#0d1322] border border-[#24304d]/70 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-medium">Midpoint:</span>
                  <span className="text-lg font-extrabold font-mono text-emerald-400">
                    {todayEntry.midpointCalories} kcal
                  </span>
                </div>

                {todayEntry.notes && (
                  <p className="text-xs text-slate-400 italic line-clamp-2">
                    "{todayEntry.notes}"
                  </p>
                )}
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-sm text-slate-400 mb-2">No calorie intake recorded yet for today.</p>
                <button
                  onClick={() => onOpenLogModal(streaks.todayDate)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4"
                >
                  Log today's estimate to maintain your streak →
                </button>
              </div>
            )}
          </div>

          {todayEntry && (
            <button
              onClick={() => onOpenLogModal(streaks.todayDate)}
              className="mt-4 w-full flex items-center justify-center space-x-1.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#161e31] hover:bg-[#1a243a] border border-[#24304d] rounded-xl transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Today's Entry</span>
            </button>
          )}
        </div>
      </div>

      {/* Next Milestone Progress Highlight */}
      {nextMilestone && (
        <div className="p-5 bg-[#111726] border border-[#24304d] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                  Next Milestone
                </span>
                <span className="text-xs text-slate-400">({nextMilestone.targetDays} days streak goal)</span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {nextMilestone.title}
              </h3>
            </div>
          </div>

          <div className="sm:w-72 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">
                {nextMilestone.remainingDays > 0
                  ? `${nextMilestone.remainingDays} days remaining`
                  : 'Goal reached!'}
              </span>
              <span className="text-emerald-400 font-semibold">{nextMilestone.progressPercentage}%</span>
            </div>
            <div className="w-full bg-[#161e31] h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${nextMilestone.progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* GitHub-Style Contribution Calendar */}
      <div>
        <ContributionCalendar
          daysMap={calendar.daysMap || {}}
          selectedYear={selectedYear}
          availableYears={calendar.availableYears || [new Date().getFullYear()]}
          onYearChange={(yr) => setSelectedYear(yr)}
          onDayClick={(dateStr) => onOpenLogModal(dateStr)}
        />
      </div>

      {/* Two Columns: Recent Entries & Recent Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Daily Entries (2 columns) */}
        <div className="lg:col-span-2 bg-[#111726] border border-[#24304d] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white tracking-tight">
              Recent Calorie Logs
            </h3>
            <span className="text-xs text-slate-400">Last 7 logged entries</span>
          </div>

          {recentEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#24304d]/70 text-[11px] text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Calorie Range</th>
                    <th className="pb-3 font-semibold">Midpoint</th>
                    <th className="pb-3 font-semibold">Notes</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24304d]/40">
                  {recentEntries.map((entry) => (
                    <tr
                      key={entry.date}
                      className="hover:bg-[#161e31]/60 transition-colors group"
                    >
                      <td className="py-3 font-medium text-slate-200">
                        {formatDisplayDate(entry.date)}
                      </td>
                      <td className="py-3 font-mono text-emerald-300 font-semibold">
                        {entry.minCalories} – {entry.maxCalories} kcal
                      </td>
                      <td className="py-3 font-mono text-slate-300">
                        {entry.midpointCalories} kcal
                      </td>
                      <td className="py-3 text-slate-400 text-xs max-w-xs truncate">
                        {entry.notes || '—'}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onOpenLogModal(entry.date)}
                          className="inline-flex items-center space-x-1 p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-[#1f2a44] transition-colors"
                          title="Edit Entry"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No entries logged yet"
              description="Click the Log Today button above to record your first estimated calorie intake."
              actionText="Log Today"
              onAction={() => onOpenLogModal(null)}
            />
          )}
        </div>

        {/* Unlocked Achievements Preview */}
        <div className="bg-[#111726] border border-[#24304d] rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white tracking-tight">
              Unlocked Badges
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              {recentAchievements.length} Unlocked
            </span>
          </div>

          {recentAchievements.length > 0 ? (
            <div className="space-y-3 flex-1">
              {recentAchievements.map((ach) => (
                <div
                  key={ach.id}
                  className="p-3 bg-[#161e31]/80 border border-emerald-500/20 rounded-xl flex items-center space-x-3"
                >
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{ach.title}</p>
                    <p className="text-[11px] text-slate-400 truncate">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#0c121e]/50 border border-[#24304d]/40 rounded-xl">
              <Trophy className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-300">No achievements yet</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Log your first calorie estimate to unlock "First Step"!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
