import DailyEntry from '../models/DailyEntry.js';
import { calculateStreaks, getFormattedDate } from '../services/streakService.js';
import { checkAndUnlockAchievements } from '../services/achievementService.js';

export const getEntries = async (req, res, next) => {
  try {
    const { startDate, endDate, month, year, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user._id };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = { $gte: startDate };
    } else if (endDate) {
      query.date = { $lte: endDate };
    } else if (year && month) {
      const formattedMonth = String(month).padStart(2, '0');
      query.date = { $regex: new RegExp(`^${year}-${formattedMonth}`) };
    } else if (year) {
      query.date = { $regex: new RegExp(`^${year}-`) };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [entries, total] = await Promise.all([
      DailyEntry.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      DailyEntry.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: entries,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getEntryByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    const entry = await DailyEntry.findOne({ userId: req.user._id, date });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: `No calorie entry found for date ${date}`,
      });
    }

    res.status(200).json({
      success: true,
      data: entry,
    });
  } catch (err) {
    next(err);
  }
};

export const createEntry = async (req, res, next) => {
  try {
    const { date, minCalories, maxCalories, notes } = req.body;

    const targetDate = date || getFormattedDate(new Date(), req.user.timezone);
    const min = Number(minCalories);
    const max = Number(maxCalories);

    if (isNaN(min) || isNaN(max)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid numbers for minimum and maximum calories.',
      });
    }

    if (min < 0 || max < 0) {
      return res.status(400).json({
        success: false,
        message: 'Calorie values cannot be negative.',
      });
    }

    if (min > max) {
      return res.status(400).json({
        success: false,
        message: 'Minimum calories cannot exceed maximum calories.',
      });
    }

    // Check if entry already exists for this date
    const existing = await DailyEntry.findOne({ userId: req.user._id, date: targetDate });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `An entry for ${targetDate} already exists. Please edit it instead.`,
      });
    }

    const entry = await DailyEntry.create({
      userId: req.user._id,
      date: targetDate,
      minCalories: min,
      maxCalories: max,
      midpointCalories: Math.round((min + max) / 2),
      notes: notes || '',
    });

    // Recalculate streak & evaluate achievements
    const streakData = await calculateStreaks(req.user._id, req.user.timezone);
    const { newlyUnlocked } = await checkAndUnlockAchievements(req.user._id, streakData);

    res.status(201).json({
      success: true,
      data: entry,
      streakData,
      newlyUnlocked,
      message: 'Daily calorie entry saved successfully!',
    });
  } catch (err) {
    next(err);
  }
};

export const updateEntry = async (req, res, next) => {
  try {
    const { date } = req.params;
    const { minCalories, maxCalories, notes } = req.body;

    const min = Number(minCalories);
    const max = Number(maxCalories);

    if (isNaN(min) || isNaN(max)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid numbers for minimum and maximum calories.',
      });
    }

    if (min < 0 || max < 0) {
      return res.status(400).json({
        success: false,
        message: 'Calorie values cannot be negative.',
      });
    }

    if (min > max) {
      return res.status(400).json({
        success: false,
        message: 'Minimum calories cannot exceed maximum calories.',
      });
    }

    let entry = await DailyEntry.findOne({ userId: req.user._id, date });

    if (!entry) {
      // Upsert if user requests update for date that doesn't exist yet
      entry = await DailyEntry.create({
        userId: req.user._id,
        date,
        minCalories: min,
        maxCalories: max,
        midpointCalories: Math.round((min + max) / 2),
        notes: notes || '',
      });
    } else {
      entry.minCalories = min;
      entry.maxCalories = max;
      entry.midpointCalories = Math.round((min + max) / 2);
      if (notes !== undefined) {
        entry.notes = notes;
      }
      await entry.save();
    }

    // Recalculate streak & achievements
    const streakData = await calculateStreaks(req.user._id, req.user.timezone);
    const { newlyUnlocked } = await checkAndUnlockAchievements(req.user._id, streakData);

    res.status(200).json({
      success: true,
      data: entry,
      streakData,
      newlyUnlocked,
      message: 'Daily calorie entry updated successfully!',
    });
  } catch (err) {
    next(err);
  }
};

export const deleteEntry = async (req, res, next) => {
  try {
    const { date } = req.params;
    const entry = await DailyEntry.findOneAndDelete({ userId: req.user._id, date });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: `No entry found for date ${date}`,
      });
    }

    const streakData = await calculateStreaks(req.user._id, req.user.timezone);

    res.status(200).json({
      success: true,
      message: 'Entry deleted successfully.',
      streakData,
    });
  } catch (err) {
    next(err);
  }
};
