import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import API from '../utils/api';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { formatDateForInput } from '../utils/helpers';
import { toast } from 'react-toastify';

function AddExpenseModal({ onClose, onExpenseAdded }) {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    date: formatDateForInput(new Date()),
    icon: '💰'
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState(null);
  const [budgetWarning, setBudgetWarning] = useState(null);

  // Auto-categorize based on title
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (formData.title.length >= 3) {
        try {
          const res = await API.post('/ai/categorize', {
            title: formData.title,
            type: 'expense'
          });

          if (res.data.confidence > 50) {
            setSuggestedCategory(res.data);
            if (!formData.category) {
              setFormData(prev => ({ ...prev, category: res.data.category }));
            }
          }
        } catch (err) {
          console.error('Failed to auto-categorize:', err);
        }
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [formData.title]);

  // Check budget when amount or category changes
  useEffect(() => {
    const checkBudget = async () => {
      if (formData.category && formData.amount) {
        try {
          const month = formData.date.slice(0, 7); // YYYY-MM
          const res = await API.get(`/budget/${formData.category}/${month}`);

          if (res.data) {
            const budgetAmount = res.data.amount;
            const expenseAmount = parseFloat(formData.amount);

            if (expenseAmount > budgetAmount * 0.8) {
              setBudgetWarning({
                budget: budgetAmount,
                isOver: expenseAmount > budgetAmount,
                percent: Math.round((expenseAmount / budgetAmount) * 100)
              });
            } else {
              setBudgetWarning(null);
            }
          }
        } catch (err) {
          // No budget set for this category
          setBudgetWarning(null);
        }
      }
    };

    checkBudget();
  }, [formData.category, formData.amount, formData.date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmojiClick = (emojiData) => {
    setFormData(prev => ({ ...prev, icon: emojiData.emoji }));
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.amount || !formData.category || !formData.date) {
      toast.error('Please fill in all fields');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      await API.post('/expense', formData);
      toast.success('Expense added successfully!');
      onExpenseAdded();
      onClose();
    } catch (err) {
      console.error('Failed to add expense:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-start justify-center z-[60] animate-fade-in backdrop-blur-md pt-20">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-fade-in relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <h3 className="text-xl font-bold text-slate-900">Add Expense</h3>
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
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Grocery Shopping"
              className="input-field"
              required
              disabled={loading}
            />
            {suggestedCategory && suggestedCategory.confidence > 50 && (
              <p className="mt-1.5 text-xs text-indigo-600 font-medium">
                ✨ Auto-detected as "{suggestedCategory.category}"
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                className="input-field pl-8"
                required
                disabled={loading}
              />
            </div>
            {budgetWarning && (
              <div className={`mt-3 p-3 rounded-lg text-xs font-medium border ${budgetWarning.isOver
                ? 'bg-rose-50 text-rose-700 border-rose-100'
                : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                {budgetWarning.isOver ? (
                  <>⚠️ Exceeds budget by ₹{(parseFloat(formData.amount) - budgetWarning.budget).toLocaleString('en-IN')}</>
                ) : (
                  <>📊 Using {budgetWarning.percent}% of budget</>
                )}
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
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

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="input-field"
              required
              disabled={loading}
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Icon
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-full text-left input-field flex items-center"
                disabled={loading}
              >
                <span className="text-xl mr-2">{formData.icon}</span>
                <span className="text-slate-400 text-sm">Tap to change</span>
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 z-50 mb-2 shadow-2xl rounded-lg border border-slate-100">
                  <EmojiPicker onEmojiClick={handleEmojiClick} width={300} height={350} />
                </div>
              )}
            </div>
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
              className="btn btn-primary bg-rose-600 hover:bg-rose-700 flex-1"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddExpenseModal;
