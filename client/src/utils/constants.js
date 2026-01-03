// Category definitions and constants for the expense tracker

export const EXPENSE_CATEGORIES = [
    { value: 'Food', label: 'Food', icon: '🍔', color: '#FF6B6B' },
    { value: 'Transport', label: 'Transport', icon: '🚗', color: '#4ECDC4' },
    { value: 'Shopping', label: 'Shopping', icon: '🛍️', color: '#95E1D3' },
    { value: 'Bills', label: 'Bills', icon: '📄', color: '#F38181' },
    { value: 'Entertainment', label: 'Entertainment', icon: '🎬', color: '#AA96DA' },
    { value: 'Health', label: 'Health', icon: '⚕️', color: '#FCB  AC6' },
    { value: 'Education', label: 'Education', icon: '📚', color: '#779ECB' },
    { value: 'Other', label: 'Other', icon: '💰', color: '#A8E6CF' }
];

export const INCOME_CATEGORIES = [
    { value: 'Salary', label: 'Salary', icon: '💼', color: '#4CAF50' },
    { value: 'Freelance', label: 'Freelance', icon: '💻', color: '#2196F3' },
    { value: 'Investments', label: 'Investments', icon: '📈', color: '#FF9800' },
    { value: 'Business', label: 'Business', icon: '🏢', color: '#9C27B0' },
    { value: 'Gifts', label: 'Gifts', icon: '🎁', color: '#E91E63' },
    { value: 'Other', label: 'Other', icon: '💵', color: '#00BCD4' }
];

// Chart color schemes
export const CHART_COLORS = {
    primary: ['#7C3AED', '#C084FC', '#A78BFA', '#DDD6FE', '#EDE9FE'],
    income: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'],
    expense: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'],
    mixed: ['#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6']
};

// Month names
export const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Financial health score thresholds
export const HEALTH_SCORE_THRESHOLDS = {
    excellent: 80,
    good: 60,
    fair: 40,
    poor: 0
};

// Budget status colors
export const BUDGET_STATUS_COLORS = {
    good: '#10B981',      // Green
    moderate: '#F59E0B',  // Yellow
    warning: '#F97316',   // Orange
    exceeded: '#EF4444'   // Red
};

// Get category icon by value
export const getCategoryIcon = (category, type = 'expense') => {
    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    const found = categories.find(cat => cat.value === category);
    return found ? found.icon : '💰';
};

// Get category color by value
export const getCategoryColor = (category, type = 'expense') => {
    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    const found = categories.find(cat => cat.value === category);
    return found ? found.color : '#A8E6CF';
};

export default {
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    CHART_COLORS,
    MONTHS,
    HEALTH_SCORE_THRESHOLDS,
    BUDGET_STATUS_COLORS,
    getCategoryIcon,
    getCategoryColor
};
