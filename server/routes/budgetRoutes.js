import express from 'express';
import { addBudget, getBudgets } from '../controllers/budgetController.js';

const router = express.Router();

router.post('/add', addBudget);
router.get('/all', getBudgets);

export default router;
