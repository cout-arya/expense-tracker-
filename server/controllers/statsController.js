import Expense from '../models/Expense.js';
import Income from '../models/Income.js';

// Get spending summary by category
export const getSpendingSummary = async (req, res) => {
    try {
        const summary = await Expense.aggregate([
            { $match: { userId: req.user._id } },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } }
        ]);

        res.json(summary);
    } catch (err) {
        console.error('Failed to fetch spending summary:', err.message);
        res.status(500).json({ message: 'Failed to fetch summary' });
    }
};

// Get income summary by category
export const getIncomeSummary = async (req, res) => {
    try {
        const summary = await Income.aggregate([
            { $match: { userId: req.user._id } },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } }
        ]);

        res.json(summary);
    } catch (err) {
        console.error('Failed to fetch income summary:', err.message);
        res.status(500).json({ message: 'Failed to fetch income summary' });
    }
};

// Get monthly trends (last 6 months)
export const getMonthlyTrends = async (req, res) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Get monthly expenses
        const expenseTrends = await Expense.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    date: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Get monthly income
        const incomeTrends = await Income.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    date: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json({ expenses: expenseTrends, income: incomeTrends });
    } catch (err) {
        console.error('Failed to fetch monthly trends:', err.message);
        res.status(500).json({ message: 'Failed to fetch trends' });
    }
};

// Get overview statistics
export const getOverview = async (req, res) => {
    try {
        const userId = req.user._id;

        // Calculate totals
        const totalIncome = await Income.aggregate([
            { $match: { userId } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalExpenses = await Expense.aggregate([
            { $match: { userId } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const incomeSum = totalIncome[0]?.total || 0;
        const expenseSum = totalExpenses[0]?.total || 0;
        const balance = incomeSum - expenseSum;

        // Get transaction counts
        const incomeCount = await Income.countDocuments({ userId });
        const expenseCount = await Expense.countDocuments({ userId });

        res.json({
            totalIncome: incomeSum,
            totalExpenses: expenseSum,
            balance,
            incomeCount,
            expenseCount,
            savingsRate: incomeSum > 0 ? ((balance / incomeSum) * 100).toFixed(2) : 0
        });
    } catch (err) {
        console.error('Failed to fetch overview:', err.message);
        res.status(500).json({ message: 'Failed to fetch overview' });
    }
};
