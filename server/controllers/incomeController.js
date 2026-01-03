import Income from '../models/Income.js';

// Add new income with user authentication
export const addIncome = async (req, res) => {
  try {
    const { title, amount, date, icon, category } = req.body;

    // Validate required fields
    if (!title || !amount || !date || !category) {
      return res.status(400).json({
        error: 'Title, amount, date, and category are required'
      });
    }

    // Parse and validate amount
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        error: 'Amount must be a valid positive number'
      });
    }

    // Validate date
    const parsedDate = new Date(date);
    if (parsedDate.toString() === 'Invalid Date') {
      return res.status(400).json({ error: 'Date must be valid' });
    }

    // Create income with authenticated user's ID
    const income = new Income({
      title: title.trim(),
      amount: parsedAmount,
      date: parsedDate,
      icon: icon || '💵',
      category,
      userId: req.user._id // From auth middleware
    });

    await income.save();
    res.status(201).json(income);
  } catch (err) {
    console.error('Error in addIncome:', err);

    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }

    res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

// Get all incomes for authenticated user
export const getIncomes = async (req, res) => {
  try {
    // Filter by authenticated user's ID
    const incomes = await Income.find({ userId: req.user._id })
      .sort({ date: -1 });

    res.json(incomes);
  } catch (err) {
    console.error('Error in getIncomes:', err);
    res.status(500).json({ error: 'Failed to fetch incomes' });
  }
};

// Delete income
export const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure user can only delete their own incomes
    const income = await Income.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!income) {
      return res.status(404).json({
        error: 'Income not found or unauthorized'
      });
    }

    await income.deleteOne();
    res.json({ message: 'Income deleted successfully', id });
  } catch (err) {
    console.error('Error in deleteIncome:', err);
    res.status(500).json({ error: 'Failed to delete income' });
  }
};

// Get incomes by category for authenticated user
export const getIncomesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const incomes = await Income.find({
      userId: req.user._id,
      category
    }).sort({ date: -1 });

    res.json(incomes);
  } catch (err) {
    console.error('Error in getIncomesByCategory:', err);
    res.status(500).json({ error: 'Failed to fetch incomes' });
  }
};
