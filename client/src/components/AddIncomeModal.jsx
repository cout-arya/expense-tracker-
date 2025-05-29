import { useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { toast } from 'react-toastify';
import API from '../utils/api';

export default function AddIncomeModal({ onClose, onIncomeAdded }) {
  const [form, setForm] = useState({ title: '', amount: '', date: '', icon: '' });
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEmojiClick = (emojiData) => {
    setForm({ ...form, icon: emojiData.emoji });
    setShowPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(form);
    try {
      await API.post('/income/add', { ...form, amount: Number(form.amount) });
      toast.success('Income added');
      onIncomeAdded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add income');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20  flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 w-[400px] space-y-5 border border-white/30"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Add Income</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xl text-gray-500 hover:text-red-500 transition"
          >
            ✕
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pick Icon</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPicker(!showPicker)}
              className="text-2xl border p-2 rounded-md hover:bg-gray-100  text-left"
            >
              {form.icon || '😀'}
            </button>
            {showPicker && (
              <div className="absolute top-full mt-2 z-50">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>
        </div>

        <input
          name="title"
          placeholder="Income Source"
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-400 outline-none"
          required
        />
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-400 outline-none"
          required
        />
        <input
          type="date"
          name="date"
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-400 outline-none"
          required
        />
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg w-full transition"
        >
          Add Income
        </button>
      </form>
    </div>
  );
}
