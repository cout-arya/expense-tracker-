import express from 'express';
import { setBudget, getBudgets, deleteBudget, getBudgetByCategory } from '../controllers/budgetController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected - require authentication
router.post('/', protect, setBudget);
router.get('/all', protect, getBudgets);
router.delete('/:id', protect, deleteBudget);
router.get('/:category/:month', protect, getBudgetByCategory);

export default router;
