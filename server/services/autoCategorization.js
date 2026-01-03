// Auto-categorization service using keyword matching

const EXPENSE_KEYWORDS = {
    Food: [
        'restaurant', 'cafe', 'coffee', 'grocery', 'food', 'pizza', 'burger',
        'starbucks', 'mcdonald', 'kfc', 'subway', 'domino', 'market', 'lunch',
        'dinner', 'breakfast', 'meal', 'snack', 'bakery', 'deli', 'buffet'
    ],
    Transport: [
        'uber', 'lyft', 'taxi', 'cab', 'gas', 'fuel', 'metro', 'bus', 'train',
        'parking', 'toll', 'car', 'vehicle', 'auto', 'bike', 'scooter', 'ola'
    ],
    Entertainment: [
        'netflix', 'spotify', 'prime', 'movie', 'cinema', 'theater', 'concert',
        'game', 'ps', 'xbox', 'steam', 'youtube', 'music', 'show', 'ticket',
        'event', 'club', 'bar', 'pub'
    ],
    Bills: [
        'electric', 'electricity', 'water', 'internet', 'wifi', 'phone', 'mobile',
        'rent', 'insurance', 'loan', 'credit', 'utility', 'gas', 'heating', 'cable'
    ],
    Shopping: [
        'amazon', 'flipkart', 'ebay', 'mall', 'store', 'shop', 'purchase', 'buy',
        'clothing', 'clothes', 'fashion', 'shoes', 'accessories', 'electronics'
    ],
    Health: [
        'pharmacy', 'medicine', 'doctor', 'hospital', 'clinic', 'gym', 'fitness',
        'medical', 'health', 'dental', 'dentist', 'therapy', 'wellness', 'yoga'
    ],
    Education: [
        'school', 'college', 'university', 'course', 'class', 'tuition', 'book',
        'study', 'education', 'training', 'workshop', 'seminar', 'udemy', 'coursera'
    ]
};

const INCOME_KEYWORDS = {
    Salary: [
        'salary', 'wage', 'paycheck', 'payment', 'pay', 'income', 'employer', 'work'
    ],
    Freelance: [
        'freelance', 'upwork', 'fiverr', 'contract', 'gig', 'project', 'client'
    ],
    Investments: [
        'dividend', 'interest', 'stock', 'mutual fund', 'investment', 'return',
        'profit', 'capital gain'
    ],
    Business: [
        'business', 'revenue', 'sales', 'profit', 'commission', 'shop', 'store'
    ],
    Gifts: [
        'gift', 'bonus', 'reward', 'prize', 'award'
    ]
};

/**
 * Auto-categorize transaction based on title
 * @param {string} title - Transaction title
 * @param {string} type - 'expense' or 'income'
 * @returns {object} - { category: string, confidence: number }
 */
export const categorizeTransaction = (title, type = 'expense') => {
    if (!title) {
        return { category: 'Other', confidence: 0 };
    }

    const titleLower = title.toLowerCase().trim();
    const keywords = type === 'expense' ? EXPENSE_KEYWORDS : INCOME_KEYWORDS;

    let bestMatch = { category: 'Other', confidence: 0 };

    for (const [category, words] of Object.entries(keywords)) {
        for (const word of words) {
            // Check for exact word match
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            if (regex.test(titleLower)) {
                const confidence = 100;
                if (confidence > bestMatch.confidence) {
                    bestMatch = { category, confidence };
                }
            }
            // Check for partial match
            else if (titleLower.includes(word.toLowerCase())) {
                const confidence = 60;
                if (confidence > bestMatch.confidence) {
                    bestMatch = { category, confidence };
                }
            }
        }
    }

    return bestMatch;
};

/**
 * Learn from user corrections (for future ML implementation)
 * Currently just stores the correction for future use
 */
export const learnFromCorrection = (userId, title, correctCategory, type) => {
    // In a real implementation, this would store user-specific patterns
    // For now, we'll just log it for future ML training
    console.log('Learning opportunity:', {
        userId,
        title,
        correctCategory,
        type,
        suggestedCategory: categorizeTransaction(title, type).category
    });

    // TODO: Store in database for ML training later
};

export default {
    categorizeTransaction,
    learnFromCorrection
};
