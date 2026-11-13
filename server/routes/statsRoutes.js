import express from 'express';
import { getStatistics } from '../controllers/statsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', getStatistics);

export default router;
