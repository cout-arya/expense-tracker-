import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Income from './models/Income.js';
import Expense from './models/Expense.js';
import Budget from './models/Budget.js';
import BusinessProfile from './models/BusinessProfile.js';
import Client from './models/Client.js';
import Invoice from './models/Invoice.js';
import InvoiceLineItem from './models/InvoiceLineItem.js';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding');

        const email = 'testuser_localized@example.com';

        // Cleanup existing data for this email (to ensure clean slate)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('Cleaning up old data...');
            const uid = existingUser._id;
            await Income.deleteMany({ userId: uid });
            await Expense.deleteMany({ userId: uid });
            await Budget.deleteMany({ userId: uid });
            await BusinessProfile.deleteMany({ userId: uid });
            await Client.deleteMany({ userId: uid });

            const invoices = await Invoice.find({ userId: uid });
            const invoiceIds = invoices.map(i => i._id);
            await InvoiceLineItem.deleteMany({ invoiceId: { $in: invoiceIds } });
            await Invoice.deleteMany({ userId: uid });

            await User.deleteOne({ _id: uid });
            console.log('Cleanup complete');
        }

        // 1. Create Test User
        const user = await User.create({
            name: 'Arya Verma',
            email,
            password: 'password123',
            hasCompletedProfile: true // Set flag to true immediately since we create profile below
        });
        console.log(`User created: ${user.email}`);

        const userId = user._id;
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const today = new Date();

        // 2. Business Profile
        const businessProfile = await BusinessProfile.create({
            userId,
            businessName: "Arya's Design Studio",
            businessType: "Freelancer",
            gstin: "29ABCDE1234F1Z5",
            email: email,
            phone: "9876543210",
            address: {
                street: "123 Creative Lane, Indiranagar",
                city: "Bengaluru",
                state: "Karnataka",
                pincode: "560038"
            }
        });

        // Link profile to user
        await User.findByIdAndUpdate(userId, { businessProfileId: businessProfile._id });

        console.log('Business Profile created');

        // 3. Clients
        const clients = await Client.insertMany([
            {
                userId,
                clientName: "Tech Solutions Pvt Ltd",
                contactPerson: "Rahul Sharma",
                email: "accounts@techsolutions.com",
                phone: "9988776655",
                gstin: "27AAACT1234F1Z5", // Maharashtra (Inter-state)
                address: { street: "45 Tech Park", city: "Pune", state: "Maharashtra", pincode: "411057" }
            },
            {
                userId,
                clientName: "Green Earth NGO",
                contactPerson: "Priya Singh",
                email: "funding@greenearth.org",
                phone: "8877665544",
                // No GSTIN (Unregistered)
                address: { street: "12 Green Way", city: "Bengaluru", state: "Karnataka", pincode: "560001" }
            },
            {
                userId,
                clientName: "StartUp Hub",
                contactPerson: "Amit Patel",
                email: "hello@startuphub.io",
                gstin: "29BBBCD1234F1Z5", // Karnataka (Intra-state)
                address: { street: "99 Innovation Dr", city: "Mysuru", state: "Karnataka", pincode: "570001" }
            }
        ]);
        console.log('Clients created');

        // 4. Invoices & Line Items
        // Invoice 1: Paid (Local - Intra-state)
        const invoice1 = await Invoice.create({
            userId,
            invoiceNumber: "INV-2024-001",
            clientId: clients[2]._id, // StartUp Hub (Karnataka)
            invoiceDate: new Date(today.getFullYear(), today.getMonth() - 1, 15),
            dueDate: new Date(today.getFullYear(), today.getMonth() - 1, 30),
            status: "Paid",
            paymentDate: new Date(today.getFullYear(), today.getMonth() - 1, 28),
            paymentMethod: "Bank Transfer",
            subtotal: 0, totalAmount: 0 // Will be calculated
        });
        await InvoiceLineItem.create({
            invoiceId: invoice1._id,
            itemName: "Logo Design",
            description: "Minimalist logo concepts + 3 revisions",
            quantity: 1,
            rate: 15000,
            gstPercentage: 18
        });
        await invoice1.calculateTotals();
        await invoice1.save();

        // Invoice 2: Overdue (Inter-state)
        const invoice2 = await Invoice.create({
            userId,
            invoiceNumber: "INV-2024-002",
            clientId: clients[0]._id, // Tech Solutions (Maharashtra)
            invoiceDate: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            dueDate: new Date(today.getFullYear(), today.getMonth() - 1, 15),
            status: "Overdue"
        });
        await InvoiceLineItem.insertMany([
            { invoiceId: invoice2._id, itemName: "UX Consulting", description: "40 hours of UI/UX consulting", quantity: 40, rate: 2000, gstPercentage: 18 },
            { invoiceId: invoice2._id, itemName: "Figma License", description: "Annual team license reimbursement", quantity: 1, rate: 12000, gstPercentage: 18 }
        ]);
        await invoice2.calculateTotals();
        await invoice2.save();

        // Invoice 3: Sent (Draft/Sent)
        const invoice3 = await Invoice.create({
            userId,
            invoiceNumber: "INV-2024-003",
            clientId: clients[1]._id, // Green Earth NGO
            invoiceDate: new Date(),
            dueDate: new Date(today.getFullYear(), today.getMonth(), 28),
            status: "Sent"
        });
        await InvoiceLineItem.create({
            invoiceId: invoice3._id,
            itemName: "Website Maintenance",
            quantity: 1,
            rate: 5000,
            gstPercentage: 0 // NGO might be exempt or 0 rate service? Just testing different rate
        });
        await invoice3.calculateTotals();
        await invoice3.save();
        console.log('Invoices created');

        // 5. Incomes (Expanded for AI)
        const incomesData = [
            // Current Month
            { title: 'Monthly Salary', amount: 85000, category: 'Salary', date: new Date(today.getFullYear(), today.getMonth(), 1), userId },
            { title: 'Freelance Project', amount: 25000, category: 'Freelance', date: new Date(today.getFullYear(), today.getMonth(), 15), userId },
            // Last Month
            { title: 'Monthly Salary', amount: 85000, category: 'Salary', date: new Date(today.getFullYear(), today.getMonth() - 1, 1), userId },
            { title: 'Stock Dividend', amount: 4500, category: 'Investments', date: new Date(today.getFullYear(), today.getMonth() - 1, 20), userId },
            // 2 Months Ago
            { title: 'Monthly Salary', amount: 85000, category: 'Salary', date: new Date(today.getFullYear(), today.getMonth() - 2, 1), userId },
            { title: 'Consulting', amount: 15000, category: 'Freelance', date: new Date(today.getFullYear(), today.getMonth() - 2, 10), userId }
        ];
        await Income.insertMany(incomesData);
        console.log('Incomes added');

        // 6. Expenses (Randomized for Insights)
        const expensesData = [];
        const categories = ['Food', 'Transport', 'Bills', 'Entertainment', 'Shopping', 'Health'];

        // Generate random expenses for last 90 days to populate charts
        for (let i = 0; i < 90; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            // Randomly skip days (not spending every day)
            if (Math.random() > 0.6) continue;

            const category = categories[Math.floor(Math.random() * categories.length)];
            let amount = 0;
            let title = '';

            // Logic to create realistic patterns (e.g., weekend spikes for Food)
            switch (category) {
                case 'Food':
                    amount = Math.floor(Math.random() * 800) + 150;
                    title = ['Swiggy', 'Zomato', 'Groceries', 'Pizza Hut', 'Burger King'][Math.floor(Math.random() * 5)];
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    if (isWeekend) {
                        amount *= 1.8; // Spend more on weekends
                        title = 'Weekend Dinner';
                    }
                    break;
                case 'Transport':
                    amount = Math.floor(Math.random() * 400) + 50;
                    title = ['Uber', 'Ola', 'Auto', 'Petrol'][Math.floor(Math.random() * 4)];
                    break;
                case 'Bills':
                    // Specific bills on specific dates
                    if (date.getDate() === 5) {
                        expensesData.push({ title: 'Rent', amount: 22000, category: 'Rent', date, userId }); // Rent is separate category often
                        continue;
                    }
                    if (date.getDate() === 10) {
                        expensesData.push({ title: 'Internet', amount: 999, category: 'Bills', date, userId });
                        continue;
                    }
                    amount = Math.floor(Math.random() * 1000) + 200;
                    title = 'Mobile Recharge';
                    break;
                case 'Entertainment':
                    amount = Math.floor(Math.random() * 2000) + 300;
                    title = ['Movie', 'Netflix', 'Concert', 'Game'][Math.floor(Math.random() * 4)];
                    break;
                case 'Shopping':
                    amount = Math.floor(Math.random() * 5000) + 500;
                    title = ['Amazon', 'Myntra', 'Flipkart', 'Mall'][Math.floor(Math.random() * 4)];
                    break;
                case 'Health':
                    if (Math.random() > 0.9) { // Rare
                        expensesData.push({ title: 'Medicine', amount: 1500, category: 'Health', date, userId });
                    }
                    continue; // Skip if not hitting the rare chance
                default:
                    amount = Math.floor(Math.random() * 2000) + 100;
                    title = category + ' Expense';
            }

            expensesData.push({
                title,
                amount: Math.round(amount),
                category,
                date,
                userId
            });
        }

        // Add a massive outlier to trigger "Unusual Spending" insight
        expensesData.push({
            title: 'New MacBook Pro',
            amount: 185000,
            category: 'Shopping',
            date: new Date(today.getFullYear(), today.getMonth(), 5),
            userId
        });

        await Expense.insertMany(expensesData);
        console.log('Expenses added');

        // 7. Budgets
        await Budget.insertMany([
            { category: 'Food', amount: 12000, month: currentMonth, userId },
            { category: 'Transport', amount: 5000, month: currentMonth, userId },
            { category: 'Bills', amount: 25000, month: currentMonth, userId }, // Rent goes under Bills
            { category: 'Shopping', amount: 8000, month: currentMonth, userId },
            { category: 'Entertainment', amount: 3000, month: currentMonth, userId } // Likely to overspend
        ]);
        console.log('Budgets added');

        console.log('-----------------------------------');
        console.log('SEEDING COMPLETE');
        console.log(`Email: ${email}`);
        console.log('Password: password123');
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', JSON.stringify(error, null, 2));
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`Validation Error on ${key}:`, error.errors[key].message);
            });
        }
        process.exit(1);
    }
};

seedData();
