import Income from '../models/Income.js';

// Add new income with validation
export const addIncome = async (req, res) => {
  try {
    const { title, amount, date, icon } = req.body;

    // Validate required fields
    if (!title || !amount || !date) {
      return res.status(400).json({ error: 'Title, amount, and date are required' });
    }

    // Convert amount and date to correct types
    const parsedAmount = Number(amount);
    const parsedDate = new Date(date);

    if (isNaN(parsedAmount)) {
      return res.status(400).json({ error: 'Amount must be a valid number' });
    }

    if (parsedDate.toString() === 'Invalid Date') {
      return res.status(400).json({ error: 'Date must be valid' });
    }

    const income = new Income({
      title,
      amount: parsedAmount,
      date: parsedDate,
      icon
    });

    await income.save();
    res.status(201).json(income);
  } catch (err) {
    console.error('Error in addIncome:', err);
    res.status(400).json({ error: err.message });
  }
};

// Get all incomes sorted by date descending
export const getIncomes = async (req, res) => {
  try {
    const incomes = await Income.find().sort({ date: -1 });
    res.json(incomes);
  } catch (err) {
    console.error('Error in getIncomes:', err);
    res.status(500).json({ error: err.message });
  }
};
