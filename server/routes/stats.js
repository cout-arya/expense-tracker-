import express from 'express';
import Transaction from '../models/Expense.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect this route so req.user is populated
router.get('/spending-summary', protect, async (req, res) => {
  try {
    // req.user.id is available here thanks to protect middleware
    const summary = await Transaction.aggregate([
      { $match: { userId: req.user.id } }, 
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]);
    res.json(summary);
  } catch (err) {
    console.error('Failed to fetch spending summary:', err.message);
    res.status(500).json({ message: 'Failed to fetch summary' });
  }
});

export default router;
