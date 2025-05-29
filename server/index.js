import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/expenseRoutes.js';
import statsRoutes from './routes/stats.js';
import incomeRoutes from './routes/incomeRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
}));
app.use(express.json());
app.use('/api/income', incomeRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/budget', budgetRoutes);
app.get('/', (req, res) => {
  res.send('API is running...');
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
