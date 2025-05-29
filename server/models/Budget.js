import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  month: { type: String, required: true }, 

}, { timestamps: true });

export default mongoose.model('Budget', budgetSchema);
