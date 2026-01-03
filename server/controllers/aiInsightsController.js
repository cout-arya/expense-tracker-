import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Budget from '../models/Budget.js';
import { categorizeTransaction } from '../services/autoCategorization.js';
import {
    calculateOptimalBudget,
    calculate3MonthAverage,
    calculateEmergencyFund,
    analyzeBudgetPerformance
} from '../services/budgetOptimizer.js';

// Get spending patterns (weekend vs weekday, trends, outliers)
export const getSpendingPatterns = async (req, res) => {
    try {
        const userId = req.user._id;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const expenses = await Expense.find({
            userId,
            date: { $gte: thirtyDaysAgo }
        });

        // Weekend vs Weekday analysis
        const weekendSpending = { total: 0, byCategory: {} };
        const weekdaySpending = { total: 0, byCategory: {} };

        expenses.forEach(expense => {
            const dayOfWeek = new Date(expense.date).getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const category = expense.category || 'Other';

            if (isWeekend) {
                weekendSpending.total += expense.amount;
                weekendSpending.byCategory[category] = (weekendSpending.byCategory[category] || 0) + expense.amount;
            } else {
                weekdaySpending.total += expense.amount;
                weekdaySpending.byCategory[category] = (weekdaySpending.byCategory[category] || 0) + expense.amount;
            }
        });

        // Calculate percentage differences
        const insights = [];
        Object.keys({ ...weekendSpending.byCategory, ...weekdaySpending.byCategory }).forEach(cat => {
            const weekendAvg = (weekendSpending.byCategory[cat] || 0) / 8; // ~8 weekend days in 30 days
            const weekdayAvg = (weekdaySpending.byCategory[cat] || 0) / 22; // ~22 weekdays in 30 days

            if (weekendAvg > 0 && weekdayAvg > 0) {
                const percentDiff = ((weekendAvg - weekdayAvg) / weekdayAvg) * 100;
                if (Math.abs(percentDiff) > 20) { // Only show significant differences
                    insights.push({
                        type: 'weekend_weekday',
                        category: cat,
                        message: `You spend ${Math.abs(Math.round(percentDiff))}% ${percentDiff > 0 ? 'more' : 'less'} on ${cat} during weekends`,
                        weekendAvg: Math.round(weekendAvg),
                        weekdayAvg: Math.round(weekdayAvg)
                    });
                }
            }
        });

        // Trend detection (compare to previous month)
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const previousMonthExpenses = await Expense.find({
            userId,
            date: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
        });

        const currentByCategory = {};
        const previousByCategory = {};

        expenses.forEach(e => {
            const cat = e.category || 'Other';
            currentByCategory[cat] = (currentByCategory[cat] || 0) + e.amount;
        });

        previousMonthExpenses.forEach(e => {
            const cat = e.category || 'Other';
            previousByCategory[cat] = (previousByCategory[cat] || 0) + e.amount;
        });

        Object.keys(currentByCategory).forEach(cat => {
            const current = currentByCategory[cat];
            const previous = previousByCategory[cat] || 0;

            if (previous > 0) {
                const change = ((current - previous) / previous) * 100;
                if (Math.abs(change) > 15) { // Significant change
                    insights.push({
                        type: 'trend',
                        category: cat,
                        message: `Your ${cat} spending ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(Math.round(change))}% this month`,
                        current: Math.round(current),
                        previous: Math.round(previous),
                        change: Math.round(change)
                    });
                }
            }
        });

        // Outlier detection
        const categoryStats = {};
        expenses.forEach(expense => {
            const cat = expense.category || 'Other';
            if (!categoryStats[cat]) {
                categoryStats[cat] = [];
            }
            categoryStats[cat].push(expense.amount);
        });

        Object.keys(categoryStats).forEach(cat => {
            const amounts = categoryStats[cat];
            if (amounts.length >= 3) { // Need at least 3 data points
                const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
                const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
                const stdDev = Math.sqrt(variance);

                amounts.forEach((amount, idx) => {
                    if (amount > mean + (2 * stdDev)) { // More than 2 std deviations
                        insights.push({
                            type: 'outlier',
                            category: cat,
                            message: `Unusual ₹${Math.round(amount)} ${cat} expense detected`,
                            amount: Math.round(amount),
                            average: Math.round(mean)
                        });
                    }
                });
            }
        });

        res.json({
            weekendVsWeekday: {
                weekend: Math.round(weekendSpending.total),
                weekday: Math.round(weekdaySpending.total)
            },
            insights: insights.slice(0, 10) // Limit to top 10 insights
        });
    } catch (err) {
        console.error('Error in getSpendingPatterns:', err);
        res.status(500).json({ error: 'Failed to analyze spending patterns' });
    }
};

// Get smart budget recommendations
export const getBudgetRecommendations = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get last 3 months of expenses
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const [expenses, incomes] = await Promise.all([
            Expense.find({ userId, date: { $gte: threeMonthsAgo } }),
            Income.find({ userId, date: { $gte: threeMonthsAgo } })
        ]);

        // Calculate monthly income
        const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
        const monthlyIncome = totalIncome / 3;

        // Calculate historical spending by category
        const historicalSpending = {};
        expenses.forEach(expense => {
            const cat = expense.category || 'Other';
            historicalSpending[cat] = (historicalSpending[cat] || 0) + expense.amount;
        });

        // Convert to monthly averages
        Object.keys(historicalSpending).forEach(cat => {
            historicalSpending[cat] = historicalSpending[cat] / 3;
        });

        // Get optimal budget using 50/30/20 rule
        const optimal = calculateOptimalBudget(monthlyIncome, historicalSpending);

        // Get 3-month average method
        const averageBased = calculate3MonthAverage(expenses);

        res.json({
            monthlyIncome: Math.round(monthlyIncome),
            recommendations: {
                optimal: optimal.budgets,
                averageBased,
                savings: optimal.savings
            },
            methodology: optimal.methodology,
            historicalAverage: historicalSpending
        });
    } catch (err) {
        console.error('Error in getBudgetRecommendations:', err);
        res.status(500).json({ error: 'Failed to generate budget recommendations' });
    }
};

// Get personalized financial advice
export const getFinancialAdvice = async (req, res) => {
    try {
        const userId = req.user._id;
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const [year, month] = currentMonth.split('-');
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59);

        const [incomes, expenses, budgets] = await Promise.all([
            Income.find({
                userId,
                date: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }
            }),
            Expense.find({
                userId,
                date: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }
            }),
            Budget.find({ userId, month: currentMonth })
        ]);

        const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const balance = totalIncome - totalExpenses;

        const advice = [];

        // Savings rate analysis
        const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
        if (savingsRate < 10) {
            advice.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Low Savings Rate',
                message: `Your savings rate is ${Math.round(savingsRate)}%. Aim for at least 20% to build financial security.`,
                priority: 'high'
            });
        } else if (savingsRate >= 30) {
            advice.push({
                type: 'success',
                icon: '🎉',
                title: 'Excellent Savings!',
                message: `Amazing! You're saving ${Math.round(savingsRate)}% of your income. Keep up the great work!`,
                priority: 'low'
            });
        } else {
            advice.push({
                type: 'info',
                icon: '💡',
                title: 'Good Savings Rate',
                message: `You're saving ${Math.round(savingsRate)}% of your income. Try to increase it to 25-30% for even better financial health.`,
                priority: 'medium'
            });
        }

        // Category-specific advice
        const categorySpending = {};
        expenses.forEach(exp => {
            const cat = exp.category || 'Other';
            categorySpending[cat] = (categorySpending[cat] || 0) + exp.amount;
        });

        // Food spending check
        const foodSpending = categorySpending['Food'] || 0;
        const foodPercent = totalIncome > 0 ? (foodSpending / totalIncome) * 100 : 0;
        if (foodPercent > 15) {
            advice.push({
                type: 'tip',
                icon: '🍔',
                title: 'Food Expenses High',
                message: `Food is ${Math.round(foodPercent)}% of your income (average is 12%). Try meal planning to save 10-15%.`,
                priority: 'medium'
            });
        }

        // Entertainment spending check
        const entertainmentSpending = categorySpending['Entertainment'] || 0;
        const entertainmentPercent = totalIncome > 0 ? (entertainmentSpending / totalIncome) * 100 : 0;
        if (entertainmentPercent > 8) {
            advice.push({
                type: 'tip',
                icon: '🎬',
                title: 'Entertainment Costs',
                message: `Entertainment is ${Math.round(entertainmentPercent)}% of your income. Consider free or low-cost activities.`,
                priority: 'low'
            });
        }

        // 5. Financial Health Score Calculation (Simplified)
        let score = 60; // Base score
        if (savingsRate >= 20) score += 20;
        if (savingsRate >= 10 && savingsRate < 20) score += 10;
        if (totalExpenses < totalIncome) score += 10;
        // Placeholder for budget adherence, assuming a budgetStatus object exists
        // if (Object.keys(budgetStatus.overBudget).length === 0) score += 10;

        // 6. Emergency Fund Recommendation (Indian Context)
        const monthlyExpensesAvg = totalExpenses; // Simplified: usually average of last 3-6 months
        const emergencyFund = {
            current: 0, // Placeholder - would need asset tracking
            recommended: monthlyExpensesAvg * 6,
            message: `Build an emergency fund of ₹${Math.round(monthlyExpensesAvg * 6).toLocaleString('en-IN')} (6 months of expenses).`
        };

        // Budget adherence check (original logic, adapted to use 'insights')
        if (budgets.length > 0) {
            const currentMonthExpenses = expenses.filter(exp => {
                return exp.date.toISOString().slice(0, 7) === currentMonth;
            });

            const actualSpending = {};
            currentMonthExpenses.forEach(exp => {
                const cat = exp.category || 'Other';
                actualSpending[cat] = (actualSpending[cat] || 0) + exp.amount;
            });

            const budgetMap = {};
            budgets.forEach(b => {
                budgetMap[b.category] = b.amount;
            });

            Object.keys(actualSpending).forEach(cat => {
                if (budgetMap[cat] && actualSpending[cat] > budgetMap[cat]) {
                    const overspend = actualSpending[cat] - budgetMap[cat];
                    advice.push({
                        type: 'warning',
                        icon: '📊',
                        title: `${cat} Budget Exceeded`,
                        message: `You've exceeded your ${cat} budget by ₹${Math.round(overspend).toLocaleString('en-IN')}.`,
                        priority: 'high'
                    });
                }
            });
        }

        // Sort by priority (if priorities are added to new insights)
        // const priorityOrder = { high: 1, medium: 2, low: 3 };
        // insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        res.json({
            overview: {
                totalIncome: Math.round(totalIncome),
                totalExpenses: Math.round(totalExpenses),
                savings: Math.round(totalIncome - totalExpenses),
                savingsRate: Math.round(savingsRate),
                score
            },
            insights: advice.slice(0, 8), // Top 8 pieces of advice
            emergencyFund
        });
    } catch (err) {
        console.error('Error generating detailed insights:', err);
        res.status(500).json({ error: 'Failed to generate insights' });
    }
};

// Auto-categorize transaction
export const categorizeSuggestion = async (req, res) => {
    try {
        const { title, type } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const result = categorizeTransaction(title, type || 'expense');
        res.json(result);
    } catch (err) {
        console.error('Error in categorizeSuggestion:', err);
        res.status(500).json({ error: 'Failed to categorize' });
    }
};

// Get comprehensive monthly report
export const getMonthlyReport = async (req, res) => {
    try {
        const userId = req.user._id;
        const { month } = req.query; // YYYY-MM format

        const targetMonth = month || new Date().toISOString().slice(0, 7);
        const monthStart = new Date(targetMonth + '-01');
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const [incomes, expenses, budgets] = await Promise.all([
            Income.find({ userId, date: { $gte: monthStart, $lt: monthEnd } }),
            Expense.find({ userId, date: { $gte: monthStart, $lt: monthEnd } }),
            Budget.find({ userId, month: targetMonth })
        ]);

        const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const savings = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

        // Category breakdown
        const expenseByCategory = {};
        const incomeByCategory = {};

        expenses.forEach(exp => {
            const cat = exp.category || 'Other';
            expenseByCategory[cat] = (expenseByCategory[cat] || 0) + exp.amount;
        });

        incomes.forEach(inc => {
            const cat = inc.category || 'Other';
            incomeByCategory[cat] = (incomeByCategory[cat] || 0) + inc.amount;
        });

        // Top spending categories
        const topSpending = Object.entries(expenseByCategory)
            .map(([cat, amount]) => ({ category: cat, amount: Math.round(amount) }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        // Budget performance
        const budgetMap = {};
        budgets.forEach(b => {
            budgetMap[b.category] = b.amount;
        });

        const performance = analyzeBudgetPerformance(budgetMap, expenseByCategory);

        // Key insights
        const insights = [];
        if (savingsRate >= 20) {
            insights.push(`🎉 Great job! You saved ${Math.round(savingsRate)}% this month.`);
        } else {
            insights.push(`⚠️ Savings rate is low at ${Math.round(savingsRate)}%. Try to reduce expenses.`);
        }

        if (totalExpenses > totalIncome) {
            insights.push(`⚠️ You spent ₹${Math.round(totalExpenses - totalIncome).toLocaleString('en-IN')} more than you earned.`);
        }

        // Find biggest expense category
        if (topSpending.length > 0) {
            insights.push(`📊 ${topSpending[0].category} was your biggest expense at ₹${topSpending[0].amount.toLocaleString('en-IN')}.`);
        }

        res.json({
            month: targetMonth,
            summary: {
                totalIncome: Math.round(totalIncome),
                totalExpenses: Math.round(totalExpenses),
                savings: Math.round(savings),
                savingsRate: Math.round(savingsRate)
            },
            expenseByCategory,
            incomeByCategory,
            topSpending,
            budgetPerformance: performance,
            insights,
            transactionCounts: {
                incomes: incomes.length,
                expenses: expenses.length
            }
        });
    } catch (err) {
        console.error('Error in getMonthlyReport:', err);
        res.status(500).json({ error: 'Failed to generate monthly report' });
    }
};

export default {
    getSpendingPatterns,
    getBudgetRecommendations,
    getFinancialAdvice,
    categorizeSuggestion,
    getMonthlyReport
};
