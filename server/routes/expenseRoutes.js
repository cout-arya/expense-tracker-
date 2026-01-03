import express from 'express';
import { addExpense, getExpenses, deleteExpense, getExpensesByCategory } from '../controllers/expenseController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected - require authentication
router.post('/', protect, addExpense);
router.get('/all', protect, getExpenses);
router.delete('/:id', protect, deleteExpense);
router.get('/category/:category', protect, getExpensesByCategory);

export default router;
