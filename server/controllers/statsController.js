import DailyEntry from '../models/DailyEntry.js';
import { calculateStreaks, getFormattedDate, shiftDateString } from '../services/streakService.js';

export const getStatistics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const timezone = req.user.timezone || 'UTC';

    // Fetch all entries for this user sorted by date ascending
    const entries = await DailyEntry.find({ userId }).sort({ date: 1 }).lean();

    const streakData = await calculateStreaks(userId, timezone);

    if (entries.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalTrackedDays: 0,
          averageDailyMidpoint: 0,
          averageMinCalories: 0,
          averageMaxCalories: 0,
          highestCalorieEstimate: 0,
          lowestCalorieEstimate: 0,
          weeklyAverage: 0,
          monthlyAverage: 0,
          last30DaysConsistencyPercentage: 0,
          trendData: [],
          weeklyDistribution: [],
          monthlyTrends: [],
        },
      });
    }

    // 1. Calculate overall averages and extremes
    let totalMidpoint = 0;
    let totalMin = 0;
    let totalMax = 0;
    let highestCalorieEstimate = -Infinity;
    let lowestCalorieEstimate = Infinity;

    entries.forEach((e) => {
      totalMidpoint += e.midpointCalories;
      totalMin += e.minCalories;
      totalMax += e.maxCalories;

      if (e.maxCalories > highestCalorieEstimate) {
        highestCalorieEstimate = e.maxCalories;
      }
      if (e.minCalories < lowestCalorieEstimate) {
        lowestCalorieEstimate = e.minCalories;
      }
    });

    const averageDailyMidpoint = Math.round(totalMidpoint / entries.length);
    const averageMinCalories = Math.round(totalMin / entries.length);
    const averageMaxCalories = Math.round(totalMax / entries.length);

    // 2. Weekly average (last 7 recorded days or past 7 calendar days)
    const todayStr = getFormattedDate(new Date(), timezone);
    const sevenDaysAgoStr = shiftDateString(todayStr, -7);
    const thirtyDaysAgoStr = shiftDateString(todayStr, -30);

    const past7DaysEntries = entries.filter((e) => e.date >= sevenDaysAgoStr && e.date <= todayStr);
    const weeklyAverage = past7DaysEntries.length > 0
      ? Math.round(past7DaysEntries.reduce((sum, e) => sum + e.midpointCalories, 0) / past7DaysEntries.length)
      : averageDailyMidpoint;

    // 3. Monthly average (past 30 calendar days)
    const past30DaysEntries = entries.filter((e) => e.date >= thirtyDaysAgoStr && e.date <= todayStr);
    const monthlyAverage = past30DaysEntries.length > 0
      ? Math.round(past30DaysEntries.reduce((sum, e) => sum + e.midpointCalories, 0) / past30DaysEntries.length)
      : averageDailyMidpoint;

    // Consistency percentage in last 30 days
    const last30DaysConsistencyPercentage = Math.min(100, Math.round((past30DaysEntries.length / 30) * 100));

    // 4. Trend chart data (last 30-60 entries or recent entries)
    const trendData = entries.slice(-45).map((e) => ({
      date: e.date,
      minCalories: e.minCalories,
      maxCalories: e.maxCalories,
      midpointCalories: e.midpointCalories,
      notes: e.notes || '',
    }));

    // 5. Monthly breakdown for aggregated view
    const monthlyMap = {};
    entries.forEach((e) => {
      const monthKey = e.date.slice(0, 7); // 'YYYY-MM'
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthKey,
          daysTracked: 0,
          totalMidpoint: 0,
          minCalAvg: 0,
          maxCalAvg: 0,
        };
      }
      monthlyMap[monthKey].daysTracked += 1;
      monthlyMap[monthKey].totalMidpoint += e.midpointCalories;
      monthlyMap[monthKey].minCalAvg += e.minCalories;
      monthlyMap[monthKey].maxCalAvg += e.maxCalories;
    });

    const monthlyTrends = Object.values(monthlyMap)
      .slice(-6)
      .map((m) => ({
        month: m.month,
        daysTracked: m.daysTracked,
        avgMidpoint: Math.round(m.totalMidpoint / m.daysTracked),
        avgMin: Math.round(m.minCalAvg / m.daysTracked),
        avgMax: Math.round(m.maxCalAvg / m.daysTracked),
      }));

    // 6. Day of week distribution (0 = Sun, 6 = Sat)
    const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
    const weekdaySumCalories = [0, 0, 0, 0, 0, 0, 0];
    const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    entries.forEach((e) => {
      const [y, m, d] = e.date.split('-').map(Number);
      const dayOfWeek = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
      weekdayCounts[dayOfWeek] += 1;
      weekdaySumCalories[dayOfWeek] += e.midpointCalories;
    });

    const weeklyDistribution = weekdayLabels.map((day, idx) => ({
      day,
      count: weekdayCounts[idx],
      avgCalories: weekdayCounts[idx] > 0 ? Math.round(weekdaySumCalories[idx] / weekdayCounts[idx]) : 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        totalTrackedDays: entries.length,
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        averageDailyMidpoint,
        averageMinCalories,
        averageMaxCalories,
        highestCalorieEstimate: highestCalorieEstimate === -Infinity ? 0 : highestCalorieEstimate,
        lowestCalorieEstimate: lowestCalorieEstimate === Infinity ? 0 : lowestCalorieEstimate,
        weeklyAverage,
        monthlyAverage,
        last30DaysConsistencyPercentage,
        trendData,
        weeklyDistribution,
        monthlyTrends,
      },
    });
  } catch (err) {
    next(err);
  }
};
