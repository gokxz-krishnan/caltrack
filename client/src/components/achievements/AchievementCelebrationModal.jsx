import React from 'react';
import { useToast } from '../../context/ToastContext';
import { Trophy, Sparkles, Check, X } from 'lucide-react';

export const AchievementCelebrationModal = () => {
  const { celebrationAchievement, dismissCelebration } = useToast();

  if (!celebrationAchievement) return null;

  const { title, description, milestoneDays } = celebrationAchievement;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#162338] to-[#0f1726] border-2 border-emerald-500/40 rounded-3xl p-8 shadow-2xl text-center overflow-hidden emerald-glow">
        {/* Decorative background radiance */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={dismissCelebration}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex p-4 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 mb-5 animate-bounce">
          <Trophy className="w-12 h-12" />
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Milestone Achieved!</span>
        </div>

        <h3 className="text-2xl font-extrabold text-white tracking-tight mb-2">
          {title}
        </h3>

        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          {description}
        </p>

        <div className="p-3 bg-[#0c121e]/80 rounded-2xl border border-emerald-500/20 mb-6 font-mono text-xs text-emerald-400">
          🔥 Consistency Streak reached: <strong>{milestoneDays} {milestoneDays === 1 ? 'day' : 'days'}</strong>
        </div>

        <button
          onClick={dismissCelebration}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/60 hover:shadow-emerald-500/30"
        >
          Keep Crushing It!
        </button>
      </div>
    </div>
  );
};
