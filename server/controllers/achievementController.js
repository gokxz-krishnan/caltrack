import { getUserAchievementsWithProgress } from '../services/achievementService.js';

export const getAchievements = async (req, res, next) => {
  try {
    const data = await getUserAchievementsWithProgress(req.user._id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};
