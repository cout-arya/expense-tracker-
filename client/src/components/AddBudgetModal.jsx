import { useState } from 'react';
import { toast } from 'react-toastify';
import API from '../utils/api';

export default function AddBudgetModal({ onClose, onBudgetAdded }) {
  const [form, setForm] = useState({
    category: '',
    amount: '',
    month: '',
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting Budget:', form);
    try {
      await API.post('/budget/add', {
        category: form.category.toLowerCase(),
        amount: Number(form.amount),
        month: form.month,
      });
      toast.success('Budget set successfully');
      onBudgetAdded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to set budget');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 w-[400px] space-y-5 border border-white/30"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Set Budget</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xl text-gray-500 hover:text-red-500 transition"
          >
            ✕
          </button>
        </div>

        <input
          name="category"
          placeholder="Category (e.g., groceries, rent)"
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-400 outline-none"
          required
        />

        <input
          type="number"
          name="amount"
          placeholder="Monthly Budget Amount"
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-400 outline-none"
          required
        />

        <select
          name="month"
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-400 outline-none"
          required
        >
          <option value="">Select Month</option>
          {[
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
          ].map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg w-full transition"
        >
          Set Budget
        </button>
      </form>
    </div>
  );
}
