import Budget from '../models/Budget.js';

// Add or update budget
export const setBudget = async (req, res) => {
  try {
    const { category, amount, month } = req.body;

    // Validate required fields
    if (!category || !amount || !month) {
      return res.status(400).json({
        error: 'Category, amount, and month are required'
      });
    }

    // Parse amount
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        error: 'Amount must be a valid positive number'
      });
    }

    // Validate month format (YYYY-MM)
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return res.status(400).json({
        error: 'Month must be in YYYY-MM format'
      });
    }

    // Find existing budget or create new one
    const budget = await Budget.findOneAndUpdate(
      {
        userId: req.user._id,
        category,
        month
      },
      {
        amount: parsedAmount,
        userId: req.user._id,
        category,
        month
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.status(201).json(budget);
  } catch (err) {
    console.error('Error in setBudget:', err);

    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }

    res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

// Get all budgets for authenticated user
export const getBudgets = async (req, res) => {
  try {
    const { month } = req.query;

    const query = { userId: req.user._id };
    if (month) {
      query.month = month;
    }

    const budgets = await Budget.find(query).sort({ category: 1 });
    res.json(budgets);
  } catch (err) {
    console.error('Error in getBudgets:', err);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
};

// Delete budget
export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const budget = await Budget.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        error: 'Budget not found or unauthorized'
      });
    }

    await budget.deleteOne();
    res.json({ message: 'Budget deleted successfully', id });
  } catch (err) {
    console.error('Error in deleteBudget:', err);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
};

// Get budget by category and month
export const getBudgetByCategory = async (req, res) => {
  try {
    const { category, month } = req.params;

    const budget = await Budget.findOne({
      userId: req.user._id,
      category,
      month
    });

    if (!budget) {
      return res.status(404).json({ message: 'No budget set for this category' });
    }

    res.json(budget);
  } catch (err) {
    console.error('Error in getBudgetByCategory:', err);
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
};
