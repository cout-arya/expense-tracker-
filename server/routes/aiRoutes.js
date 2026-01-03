import express from 'express';
import {
    getSpendingPatterns,
    getBudgetRecommendations,
    getFinancialAdvice,
    categorizeSuggestion,
    getMonthlyReport
} from '../controllers/aiInsightsController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// All AI routes are protected
router.get('/insights/spending-patterns', protect, getSpendingPatterns);
router.get('/insights/budget-recommendations', protect, getBudgetRecommendations);
router.get('/insights/financial-advice', protect, getFinancialAdvice);
router.get('/insights/monthly-report', protect, getMonthlyReport);
router.post('/categorize', protect, categorizeSuggestion);

export default router;
