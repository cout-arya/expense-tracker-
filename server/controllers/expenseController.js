import Expense from '../models/Expense.js';

export const addExpense = async (req, res) => {
  try {
    const { title, amount, date, icon } = req.body;

    if (!title || !amount || !date) {
      return res.status(400).json({ error: 'Title, amount, and date are required' });
    }

    const parsedAmount = Number(amount);
    const parsedDate = new Date(date);

    if (isNaN(parsedAmount)) {
      return res.status(400).json({ error: 'Amount must be a valid number' });
    }

    if (parsedDate.toString() === 'Invalid Date') {
      return res.status(400).json({ error: 'Date must be valid' });
    }

    const expense = new Expense({
      title,
      amount: parsedAmount,
      date: parsedDate,
      icon,
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    console.error('Error in addExpense:', err);
    res.status(400).json({ error: err.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
