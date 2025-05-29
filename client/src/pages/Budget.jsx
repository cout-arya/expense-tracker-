import { useEffect, useState } from 'react';
import API from '../utils/api';
import AddBudgetModal from '../components/AddBudgetModal';
import { Progress } from '@radix-ui/react-progress';

function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchBudgets = async () => {
    try {
      const res = await API.get('/budget/all');
      setBudgets(res.data);
    } catch (err) {
      console.error('Failed to fetch budgets:', err.message);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await API.get('/expense/all');
      setExpenses(res.data);
    } catch (err) {
      console.error('Failed to fetch expenses:', err.message);
    }
  };

  useEffect(() => {
    fetchBudgets();
    fetchExpenses();
  }, []);

  const getActualSpent = (category) =>
    expenses
      .filter((e) => e.title.toLowerCase() === category.toLowerCase())
      .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-10">
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-700">Monthly Budgets</h2>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm font-semibold text-purple-600 hover:underline"
          >
            + Set Budget
          </button>
        </div>

        {budgets.length > 0 ? (
          <ul className="space-y-6">
            {budgets.map((b) => {
              const spent = getActualSpent(b.category);
              const percent = Math.min((spent / b.amount) * 100, 100);

              return (
                <li key={b._id} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700 capitalize">{b.category}</span>
                    <span
                      className={`font-semibold ${spent > b.amount ? 'text-red-500' : 'text-green-600'}`}
                    >
                      ₹{spent} / ₹{b.amount}
                    </span>
                  </div>
                  <Progress
                    className="h-3 w-full bg-gray-200 rounded-full overflow-hidden"
                    style={{ width: '100%' }}
                    value={percent}
                  >
                    <div
                      className={`h-full ${
                        spent > b.amount ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </Progress>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-400">No budgets set yet.</p>
        )}
      </div>

      {showModal && (
        <AddBudgetModal onClose={() => setShowModal(false)} onBudgetAdded={fetchBudgets} />
      )}
    </div>
  );
}

export default Budget;
