import dotenv from 'dotenv';
import connectDB from './config/db.js';
import BusinessProfile from './models/BusinessProfile.js';
import Client from './models/Client.js';
import Invoice from './models/Invoice.js';
import InvoiceLineItem from './models/InvoiceLineItem.js';

dotenv.config();

console.log('Testing database models...');

try {
    await connectDB();
    console.log('✅ Database connected');

    console.log('✅ BusinessProfile model loaded');
    console.log('✅ Client model loaded');
    console.log('✅ Invoice model loaded');
    console.log('✅ InvoiceLineItem model loaded');

    console.log('\n✅ All models loaded successfully!');
    process.exit(0);
} catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
}
