import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema({
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
    enum: ['Salary', 'Freelance', 'Investments', 'Business', 'Gifts', 'Other'],
    default: 'Other'
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  icon: {
    type: String,
    default: '💵'
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
incomeSchema.index({ userId: 1, date: -1 });
incomeSchema.index({ userId: 1, category: 1 });

export default mongoose.model('Income', incomeSchema);
