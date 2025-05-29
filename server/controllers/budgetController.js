import Budget from '../models/Budget.js';

export const addBudget = async (req, res) => {
  try {
    const { category, amount, month } = req.body;
    if (!category || !amount || !month) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const budget = new Budget({ category, amount, month });
    await budget.save();
    res.status(201).json(budget);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getBudgets = async (req, res) => {
  try {
    const { month } = req.query;
    const query = {};
    if (month) query.month = month;

    const budgets = await Budget.find(query);
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
