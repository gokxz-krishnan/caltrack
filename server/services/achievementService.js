import Achievement from '../models/Achievement.js';
import { ACHIEVEMENT_DEFINITIONS } from '../utils/achievementDefinitions.js';
import { calculateStreaks } from './streakService.js';

/**
 * Check and unlock any eligible achievements for a user.
 * Returns an array of newly unlocked achievement definitions (for celebratory toast/modal).
 */
export const checkAndUnlockAchievements = async (userId, customStreakData = null) => {
  const streakData = customStreakData || (await calculateStreaks(userId));
  const longestStreak = streakData.longestStreak || 0;

  // Find currently unlocked achievements for this user
  const existingUnlocked = await Achievement.find({ userId }).lean();
  const existingUnlockedMap = new Map(
    existingUnlocked.map((a) => [a.achievementId, a.unlockedAt])
  );

  const newlyUnlocked = [];

  for (const def of ACHIEVEMENT_DEFINITIONS) {
    const isUnlocked = existingUnlockedMap.has(def.id);
    const isEligible = longestStreak >= def.milestoneDays;

    if (!isUnlocked && isEligible) {
      try {
        const doc = await Achievement.create({
          userId,
          achievementId: def.id,
          unlockedAt: new Date(),
        });
        existingUnlockedMap.set(def.id, doc.unlockedAt);
        newlyUnlocked.push({
          ...def,
          unlockedAt: doc.unlockedAt,
        });
      } catch (err) {
        // Ignore duplicate key error (race condition safeguard)
        if (err.code !== 11000) {
          console.error(`Error saving achievement ${def.id}:`, err);
        }
      }
    }
  }

  return {
    newlyUnlocked,
    streakData,
  };
};

/**
 * Get all achievements with unlocked status, unlock timestamps, and milestone progress
 */
export const getUserAchievementsWithProgress = async (userId) => {
  const streakData = await calculateStreaks(userId);
  const longestStreak = streakData.longestStreak || 0;

  const existingUnlocked = await Achievement.find({ userId }).lean();
  const unlockedMap = new Map(
    existingUnlocked.map((a) => [a.achievementId, a.unlockedAt])
  );

  let nextMilestone = null;

  const achievements = ACHIEVEMENT_DEFINITIONS.map((def) => {
    const unlockedAt = unlockedMap.get(def.id) || null;
    const isUnlocked = !!unlockedAt || longestStreak >= def.milestoneDays;
    const progress = Math.min(100, Math.round((longestStreak / def.milestoneDays) * 100));

    if (!isUnlocked && !nextMilestone) {
      nextMilestone = {
        id: def.id,
        title: def.title,
        targetDays: def.milestoneDays,
        currentDays: longestStreak,
        remainingDays: Math.max(0, def.milestoneDays - longestStreak),
        progressPercentage: progress,
      };
    }

    return {
      ...def,
      isUnlocked,
      unlockedAt,
      progressPercentage: progress,
      currentDays: longestStreak,
    };
  });

  return {
    achievements,
    nextMilestone,
    longestStreak,
    totalTrackedDays: streakData.totalTrackedDays,
    currentStreak: streakData.currentStreak,
    totalUnlocked: achievements.filter((a) => a.isUnlocked).length,
    totalAvailable: achievements.length,
  };
};
