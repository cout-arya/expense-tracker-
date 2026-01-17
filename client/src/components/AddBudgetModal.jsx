import { useState } from 'react';
import { toast } from 'react-toastify';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import API from '../utils/api';
import { EXPENSE_CATEGORIES } from '../utils/constants';

export default function AddBudgetModal({ onClose, onBudgetAdded }) {
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [form, setForm] = useState({
    category: '',
    amount: '',
    month: getCurrentMonth(),
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/budget', {
        category: form.category,
        amount: Number(form.amount),
        month: form.month,
      });
      toast.success('Budget set successfully');
      onBudgetAdded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to set budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-start justify-center z-[60] animate-fade-in backdrop-blur-md pt-20">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-fade-in relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <h3 className="text-xl font-bold text-slate-900">Set Budget</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
            disabled={loading}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input-field appearance-none"
              required
              disabled={loading}
            >
              <option value="">Select category</option>
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Monthly Limit
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                min="1"
                step="1"
                className="input-field pl-8"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Month */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Month
            </label>
            <select
              name="month"
              value={form.month}
              onChange={handleChange}
              className="input-field appearance-none"
              required
              disabled={loading}
            >
              <option value="">Select Month</option>
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() + i);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const value = `${year}-${month}`;
                const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Setting...
                </>
              ) : (
                'Set Budget'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
