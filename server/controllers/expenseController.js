import Expense from '../models/Expense.js';

// Add new expense with user authentication
export const addExpense = async (req, res) => {
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

    // Create expense with authenticated user's ID
    const expense = new Expense({
      title: title.trim(),
      amount: parsedAmount,
      date: parsedDate,
      icon: icon || '💰',
      category,
      userId: req.user._id // From auth middleware
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    console.error('Error in addExpense:', err);

    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }

    res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

// Get all expenses for authenticated user
export const getExpenses = async (req, res) => {
  try {
    // Filter by authenticated user's ID
    const expenses = await Expense.find({ userId: req.user._id })
      .sort({ date: -1 });

    res.json(expenses);
  } catch (err) {
    console.error('Error in getExpenses:', err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

// Delete expense
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure user can only delete their own expenses
    const expense = await Expense.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!expense) {
      return res.status(404).json({
        error: 'Expense not found or unauthorized'
      });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense deleted successfully', id });
  } catch (err) {
    console.error('Error in deleteExpense:', err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};

// Get expenses by category for authenticated user
export const getExpensesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const expenses = await Expense.find({
      userId: req.user._id,
      category
    }).sort({ date: -1 });

    res.json(expenses);
  } catch (err) {
    console.error('Error in getExpensesByCategory:', err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};
