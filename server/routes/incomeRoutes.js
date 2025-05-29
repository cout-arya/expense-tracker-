import express from 'express';
import { addIncome, getIncomes } from '../controllers/incomeController.js';

const router = express.Router();

router.post('/add', addIncome);
router.get('/all', getIncomes);

export default router;
