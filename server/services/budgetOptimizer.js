// Budget optimization service using financial best practices

/**
 * Calculate optimal budget using 50/30/20 rule
 * 50% Needs, 30% Wants, 20% Savings
 * @param {number} monthlyIncome - User's monthly income
 * @param {array} historicalSpending - Past spending by category
 * @returns {object} - Recommended budgets by category
 */
export const calculateOptimalBudget = (monthlyIncome, historicalSpending = {}) => {
    const needs = monthlyIncome * 0.50;
    const wants = monthlyIncome * 0.30;
    const savings = monthlyIncome * 0.20;

    // Category classifications
    const needsCategories = ['Food', 'Transport', 'Bills', 'Health'];
    const wantsCategories = ['Shopping', 'Entertainment', 'Education'];

    const recommendations = {};

    // Calculate historical ratios for needs categories
    let totalNeedsSpending = 0;
    const needsSpending = {};

    needsCategories.forEach(cat => {
        const spending = historicalSpending[cat] || 0;
        needsSpending[cat] = spending;
        totalNeedsSpending += spending;
    });

    // Distribute needs budget proportionally
    needsCategories.forEach(cat => {
        if (totalNeedsSpending > 0) {
            const ratio = needsSpending[cat] / totalNeedsSpending;
            recommendations[cat] = Math.round(needs * ratio / 10) * 10; // Round to nearest 10
        } else {
            // Default distribution if no history
            recommendations[cat] = Math.round(needs / needsCategories.length / 10) * 10;
        }
    });

    // Calculate historical ratios for wants categories
    let totalWantsSpending = 0;
    const wantsSpending = {};

    wantsCategories.forEach(cat => {
        const spending = historicalSpending[cat] || 0;
        wantsSpending[cat] = spending;
        totalWantsSpending += spending;
    });

    // Distribute wants budget proportionally
    wantsCategories.forEach(cat => {
        if (totalWantsSpending > 0) {
            const ratio = wantsSpending[cat] / totalWantsSpending;
            recommendations[cat] = Math.round(wants * ratio / 10) * 10;
        } else {
            recommendations[cat] = Math.round(wants / wantsCategories.length / 10) * 10;
        }
    });

    // Other category gets remainder
    recommendations['Other'] = Math.round((monthlyIncome - Object.values(recommendations).reduce((a, b) => a + b, 0) - savings) / 10) * 10;

    return {
        budgets: recommendations,
        savings: Math.round(savings),
        totalAllocated: Object.values(recommendations).reduce((a, b) => a + b, 0),
        methodology: '50/30/20 Rule (50% Needs, 30% Wants, 20% Savings)'
    };
};

/**
 * Calculate 3-month average spending per category
 * @param {array} expenses - Past 3 months expenses
 * @returns {object} - Average spending by category
 */
export const calculate3MonthAverage = (expenses) => {
    const categoryTotals = {};
    const categoryCounts = {};

    expenses.forEach(expense => {
        const cat = expense.category || 'Other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + expense.amount;
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const averages = {};
    Object.keys(categoryTotals).forEach(cat => {
        // Add 10% buffer for safety
        const avg = categoryTotals[cat] / 3;
        averages[cat] = Math.round((avg * 1.10) / 10) * 10;
    });

    return averages;
};

/**
 * Generate emergency fund recommendations
 * @param {number} monthlyExpenses - Average monthly expenses
 * @returns {object} - Emergency fund recommendations
 */
export const calculateEmergencyFund = (monthlyExpenses) => {
    return {
        minimum: monthlyExpenses * 3, // 3 months
        recommended: monthlyExpenses * 6, // 6 months
        ideal: monthlyExpenses * 12, // 12 months
        explanation: 'Emergency fund should cover 3-12 months of expenses'
    };
};

/**
 * Analyze budget vs actual spending
 * @param {object} budgets - Current budgets
 * @param {object} actualSpending - Actual spending this month
 * @returns {array} - Analysis with warnings
 */
export const analyzeBudgetPerformance = (budgets, actualSpending) => {
    const analysis = [];

    Object.keys(budgets).forEach(category => {
        const budget = budgets[category];
        const actual = actualSpending[category] || 0;
        const percentUsed = (actual / budget) * 100;

        let status = 'good';
        let message = `${category}: On track`;

        if (percentUsed >= 100) {
            status = 'exceeded';
            message = `${category}: Over budget by $${Math.round(actual - budget)}`;
        } else if (percentUsed >= 80) {
            status = 'warning';
            message = `${category}: ${Math.round(percentUsed)}% used`;
        } else if (percentUsed >= 50) {
            status = 'moderate';
            message = `${category}: ${Math.round(percentUsed)}% used`;
        }

        analysis.push({
            category,
            budget,
            actual,
            remaining: Math.max(0, budget - actual),
            percentUsed: Math.round(percentUsed),
            status,
            message
        });
    });

    return analysis.sort((a, b) => b.percentUsed - a.percentUsed);
};

export default {
    calculateOptimalBudget,
    calculate3MonthAverage,
    calculateEmergencyFund,
    analyzeBudgetPerformance
};
