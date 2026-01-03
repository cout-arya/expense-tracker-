import express from 'express';
import {
  getSpendingSummary,
  getIncomeSummary,
  getMonthlyTrends,
  getOverview
} from '../controllers/statsController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.get('/spending-summary', protect, getSpendingSummary);
router.get('/income-summary', protect, getIncomeSummary);
router.get('/monthly-trends', protect, getMonthlyTrends);
router.get('/overview', protect, getOverview);

export default router;
