import DailyEntry from '../models/DailyEntry.js';
import User from '../models/User.js';

/**
 * Get date string (YYYY-MM-DD) for a given timestamp/Date in a specific timezone
 */
export const getFormattedDate = (date = new Date(), timeZone = 'UTC') => {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone || 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch (err) {
    // If timezone is invalid, fallback to UTC
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  }
};

/**
 * Add or subtract days from a YYYY-MM-DD string
 */
export const shiftDateString = (dateStr, days) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

/**
 * Calculate difference in calendar days between two YYYY-MM-DD strings
 */
export const dateDiffInDays = (dateStrA, dateStrB) => {
  const [yA, mA, dA] = dateStrA.split('-').map(Number);
  const [yB, mB, dB] = dateStrB.split('-').map(Number);
  const utcA = Date.UTC(yA, mA - 1, dA);
  const utcB = Date.UTC(yB, mB - 1, dB);
  return Math.round((utcB - utcA) / (1000 * 60 * 60 * 24));
};

/**
 * Calculate user streaks and tracking summary
 */
export const calculateStreaks = async (userId, customTimezone = null) => {
  // Fetch user timezone if not provided
  let timezone = customTimezone;
  if (!timezone) {
    const user = await User.findById(userId).select('timezone');
    timezone = user?.timezone || 'UTC';
  }

  // Fetch all entry dates sorted ascending
  const entries = await DailyEntry.find({ userId })
    .select('date')
    .sort({ date: 1 })
    .lean();

  if (!entries || entries.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalTrackedDays: 0,
      isStreakActiveToday: false,
      isLoggedToday: false,
      todayDate: getFormattedDate(new Date(), timezone),
      yesterdayDate: shiftDateString(getFormattedDate(new Date(), timezone), -1),
    };
  }

  // Deduplicate and ensure sorted unique dates
  const uniqueDates = Array.from(new Set(entries.map((e) => e.date))).sort();
  const dateSet = new Set(uniqueDates);
  const totalTrackedDays = uniqueDates.length;

  // 1. Calculate historical longest streak
  let longestStreak = 0;
  let currentRun = 0;
  let prevDate = null;

  for (const dateStr of uniqueDates) {
    if (!prevDate) {
      currentRun = 1;
    } else {
      const diff = dateDiffInDays(prevDate, dateStr);
      if (diff === 1) {
        currentRun += 1;
      } else if (diff > 1) {
        currentRun = 1;
      }
      // diff === 0 handled by Set
    }
    prevDate = dateStr;
    if (currentRun > longestStreak) {
      longestStreak = currentRun;
    }
  }

  // 2. Calculate current active streak based on today & yesterday in user's timezone
  const todayStr = getFormattedDate(new Date(), timezone);
  const yesterdayStr = shiftDateString(todayStr, -1);

  const isLoggedToday = dateSet.has(todayStr);
  const isLoggedYesterday = dateSet.has(yesterdayStr);

  let currentStreak = 0;

  if (isLoggedToday) {
    // Streak ends today: count backwards from today
    let checkDate = todayStr;
    while (dateSet.has(checkDate)) {
      currentStreak += 1;
      checkDate = shiftDateString(checkDate, -1);
    }
  } else if (isLoggedYesterday) {
    // If today is not logged but yesterday was logged, streak remains active until today ends!
    let checkDate = yesterdayStr;
    while (dateSet.has(checkDate)) {
      currentStreak += 1;
      checkDate = shiftDateString(checkDate, -1);
    }
  } else {
    // Both today and yesterday missing: streak is broken
    currentStreak = 0;
  }

  // Ensure longest streak is at least current streak
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return {
    currentStreak,
    longestStreak,
    totalTrackedDays,
    isStreakActiveToday: currentStreak > 0,
    isLoggedToday,
    todayDate: todayStr,
    yesterdayDate: yesterdayStr,
  };
};
