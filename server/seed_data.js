import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Income from './models/Income.js';
import Expense from './models/Expense.js';
import Budget from './models/Budget.js';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding');

        // 1. Create Test User
        const email = 'testuser_localized@example.com';
        await User.deleteOne({ email }); // Clear if exists

        const user = await User.create({
            name: 'Test Project User',
            email,
            password: 'password123'
        });
        console.log(`User created: ${user.email}`);

        const userId = user._id;
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const today = new Date();

        // 2. Add Income (Total: ₹3,35,000)
        const incomes = [
            {
                title: 'Monthly Salary',
                amount: 150000,
                category: 'Salary',
                date: new Date(today.getFullYear(), today.getMonth(), 1), // 1st of this month
                icon: '💵',
                userId
            },
            {
                title: 'Previous Salary',
                amount: 150000,
                category: 'Salary',
                date: new Date(today.getFullYear(), today.getMonth() - 1, 1), // 1st of last month
                icon: '💵',
                userId
            },
            {
                title: 'Freelance Project',
                amount: 25000,
                category: 'Freelance',
                date: new Date(today.getFullYear(), today.getMonth(), 15),
                icon: '💻',
                userId
            },
            {
                title: 'Stock Dividend',
                amount: 10000,
                category: 'Investments',
                date: new Date(today.getFullYear(), today.getMonth(), 20),
                icon: '📈',
                userId
            }
        ];
        await Income.insertMany(incomes);
        console.log('Incomes added');

        // 3. Add Expenses (Total: ~₹1,47,500)
        // Ensure some categories go over budget to test insights
        const expenses = [
            {
                title: 'Monthly Rent',
                amount: 25000,
                category: 'Bills',
                date: new Date(today.getFullYear(), today.getMonth(), 5),
                icon: '🏠',
                userId
            },
            {
                title: 'Electricity Bill',
                amount: 4500,
                category: 'Bills',
                date: new Date(today.getFullYear(), today.getMonth(), 10),
                icon: '⚡',
                userId
            },
            {
                title: 'Weekly Groceries',
                amount: 5000,
                category: 'Food',
                date: new Date(today.getFullYear(), today.getMonth(), 2),
                icon: '🛒',
                userId
            },
            {
                title: 'Bulk Groceries',
                amount: 12000,
                category: 'Food',
                date: new Date(today.getFullYear(), today.getMonth(), 12),
                icon: '🛒',
                userId
            },
            {
                title: 'Fine Dining',
                amount: 8000,
                category: 'Food',
                date: new Date(today.getFullYear(), today.getMonth(), 18),
                icon: '🍽️',
                userId
            },
            {
                title: 'Netflix Subscription',
                amount: 800,
                category: 'Entertainment',
                date: new Date(today.getFullYear(), today.getMonth(), 1),
                icon: '🎬',
                userId
            },
            {
                title: 'Concert Tickets',
                amount: 15000,
                category: 'Entertainment',
                date: new Date(today.getFullYear(), today.getMonth(), 25),
                icon: '🎫',
                userId
            },
            {
                title: 'Gym Membership',
                amount: 12000, // Annual
                category: 'Health',
                date: new Date(today.getFullYear(), today.getMonth(), 8),
                icon: '💪',
                userId
            },
            {
                title: 'New Smartphone',
                amount: 65000,
                category: 'Shopping',
                date: new Date(today.getFullYear(), today.getMonth(), 22),
                icon: '📱',
                userId
            }
        ];
        await Expense.insertMany(expenses);
        console.log('Expenses added');

        // 4. Add Budgets (To trigger alerts)
        // Food spent: 25,000 -> Budget: 20,000 (Over budget)
        // Entertainment spent: 15,800 -> Budget: 10,000 (Over budget)
        const budgets = [
            {
                category: 'Food',
                amount: 20000,
                month: currentMonth,
                userId
            },
            {
                category: 'Entertainment',
                amount: 10000,
                month: currentMonth,
                userId
            },
            {
                category: 'Shopping',
                amount: 100000,
                month: currentMonth,
                userId
            }
        ];
        await Budget.insertMany(budgets);
        console.log('Budgets added');

        console.log('-----------------------------------');
        console.log('DATA SEEDING COMPLETE');
        console.log(`Email: ${email}`);
        console.log('Password: password123');
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
