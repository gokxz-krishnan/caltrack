import express from 'express';
import {
  getEntries,
  getEntryByDate,
  createEntry,
  updateEntry,
  deleteEntry,
} from '../controllers/entryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getEntries)
  .post(createEntry);

router.route('/:date')
  .get(getEntryByDate)
  .put(updateEntry)
  .delete(deleteEntry);

export default router;
