import express from 'express';
import { addIncome, getIncomes, deleteIncome, getIncomesByCategory } from '../controllers/incomeController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected - require authentication
router.post('/', protect, addIncome);
router.get('/all', protect, getIncomes);
router.delete('/:id', protect, deleteIncome);
router.get('/category/:category', protect, getIncomesByCategory);

export default router;
