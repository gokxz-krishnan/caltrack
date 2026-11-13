import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AchievementCard } from '../components/achievements/AchievementCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Trophy, Award, Flame, Sparkles } from 'lucide-react';

export const Achievements = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await api.get('/achievements');
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching achievements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading achievements and milestone progress..." />;
  }

  const {
    achievements = [],
    nextMilestone,
    longestStreak = 0,
    totalTrackedDays = 0,
    currentStreak = 0,
    totalUnlocked = 0,
    totalAvailable = 8,
  } = data || {};

  const completionRate = Math.round((totalUnlocked / totalAvailable) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#121c2d] to-[#16273d] border border-emerald-500/25 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              <span>Milestone System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Consistency Milestones
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Achievements are awarded based on your historical longest consistency streak. Once unlocked, your achievements remain permanently yours.
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-[#0c121e]/80 border border-[#24304d] p-4 rounded-2xl shrink-0">
            <div className="text-center px-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
                Unlocked
              </span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                {totalUnlocked} / {totalAvailable}
              </span>
            </div>
            <div className="h-8 w-px bg-[#24304d]" />
            <div className="text-center px-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
                Best Streak
              </span>
              <span className="text-2xl font-black font-mono text-white">
                {longestStreak}d
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Milestone Card */}
      {nextMilestone && (
        <div className="p-6 bg-[#111726] border border-[#24304d] rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Target In Sight
                </span>
                <span className="text-xs text-slate-400">
                  • {nextMilestone.remainingDays} days to go
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                {nextMilestone.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Reach an unbroken {nextMilestone.targetDays}-day consistency streak to claim this badge!
              </p>
            </div>
          </div>

          <div className="md:w-80 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">
                {nextMilestone.currentDays} / {nextMilestone.targetDays} days reached
              </span>
              <span className="text-emerald-400 font-bold">{nextMilestone.progressPercentage}%</span>
            </div>
            <div className="w-full bg-[#161e31] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${nextMilestone.progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* All 8 Milestones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
};
