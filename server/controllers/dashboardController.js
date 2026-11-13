import DailyEntry from '../models/DailyEntry.js';
import { calculateStreaks, getFormattedDate } from '../services/streakService.js';
import { getUserAchievementsWithProgress } from '../services/achievementService.js';

export const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const timezone = req.user.timezone || 'UTC';
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    // 1. Calculate streaks & dates
    const streakData = await calculateStreaks(userId, timezone);
    const todayDate = streakData.todayDate;

    // 2. Fetch today's entry
    const todayEntry = await DailyEntry.findOne({ userId, date: todayDate }).lean();

    // 3. Fetch calendar contribution data for the specified year
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;

    const yearEntries = await DailyEntry.find({
      userId,
      date: { $gte: yearStart, $lte: yearEnd },
    })
      .select('date minCalories maxCalories midpointCalories notes')
      .lean();

    // Transform into a fast lookup map { [date]: { min, max, midpoint, notes } }
    const calendarData = {};
    yearEntries.forEach((entry) => {
      calendarData[entry.date] = {
        date: entry.date,
        minCalories: entry.minCalories,
        maxCalories: entry.maxCalories,
        midpointCalories: entry.midpointCalories,
        notes: entry.notes,
      };
    });

    // 4. Fetch recent entries (last 7)
    const recentEntries = await DailyEntry.find({ userId })
      .sort({ date: -1 })
      .limit(7)
      .lean();

    // 5. Fetch achievements & next milestone
    const achievementsData = await getUserAchievementsWithProgress(userId);

    // 6. Available years for calendar navigation
    const allYears = await DailyEntry.distinct('date', { userId });
    const availableYearsSet = new Set(allYears.map((d) => parseInt(d.slice(0, 4), 10)));
    availableYearsSet.add(new Date().getFullYear());
    const availableYears = Array.from(availableYearsSet).sort((a, b) => b - a);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          timezone: req.user.timezone,
        },
        streaks: {
          currentStreak: streakData.currentStreak,
          longestStreak: streakData.longestStreak,
          totalTrackedDays: streakData.totalTrackedDays,
          isLoggedToday: streakData.isLoggedToday,
          isStreakActiveToday: streakData.isStreakActiveToday,
          todayDate,
        },
        todayEntry: todayEntry || null,
        nextMilestone: achievementsData.nextMilestone,
        recentAchievements: achievementsData.achievements
          .filter((a) => a.isUnlocked)
          .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
          .slice(0, 3),
        calendar: {
          year,
          availableYears,
          totalLoggedDaysInYear: yearEntries.length,
          daysMap: calendarData,
        },
        recentEntries,
      },
    });
  } catch (err) {
    next(err);
  }
};
