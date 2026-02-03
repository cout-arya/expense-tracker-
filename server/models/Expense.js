import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Food',
      'Travel',
      'Transport',
      'Rent',
      'Utilities',
      'Office Supplies',
      'Marketing',
      'Professional Fees',
      'Salaries',
      'Taxes',
      'Insurance',
      'Maintenance',
      'Shopping',
      'Bills',
      'Entertainment',
      'Health',
      'Education',
      'Other'
    ],
    default: 'Other'
  },
  vendor: {
    type: String,
    trim: true,
    maxlength: [100, 'Vendor name cannot exceed 100 characters']
  },
  receipt: {
    type: String, // URL to uploaded receipt file
    trim: true
  },
  gstAmount: {
    type: Number,
    min: [0, 'GST amount cannot be negative'],
    default: 0
  },
  isGstExpense: {
    type: Boolean,
    default: false
  },
  suggestedCategory: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  icon: {
    type: String,
    default: '💰'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  }
}, {
  timestamps: true
});

// Index for faster queries
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });

export default mongoose.model('Expense', expenseSchema);
