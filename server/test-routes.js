import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Test importing routes one by one
console.log('Importing auth routes...');
import authRoutes from './routes/authRoutes.js';
console.log('✅ Auth routes');

console.log('Importing stats routes...');
import statsRoutes from './routes/stats.js';
console.log('✅ Stats routes');

console.log('Importing income routes...');
import incomeRoutes from './routes/incomeRoutes.js';
console.log('✅ Income routes');

console.log('Importing expense routes...');
import expenseRoutes from './routes/expenseRoutes.js';
console.log('✅ Expense routes');

console.log('Importing budget routes...');
import budgetRoutes from './routes/budgetRoutes.js';
console.log('✅ Budget routes');

console.log('Importing AI routes...');
import aiRoutes from './routes/aiRoutes.js';
console.log('✅ AI routes');

console.log('Importing business profile routes...');
import businessProfileRoutes from './routes/businessProfileRoutes.js';
console.log('✅ Business profile routes');

console.log('Importing client routes...');
import clientRoutes from './routes/clientRoutes.js';
console.log('✅ Client routes');

console.log('Importing invoice routes...');
import invoiceRoutes from './routes/invoiceRoutes.js';
console.log('✅ Invoice routes');

console.log('\n✅ All routes imported successfully!');
process.exit(0);
