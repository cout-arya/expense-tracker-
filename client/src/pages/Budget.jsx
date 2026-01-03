import { useEffect, useState } from 'react';
import API from '../utils/api';
import AddBudgetModal from '../components/AddBudgetModal';
import { Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetRes, expenseRes] = await Promise.all([
        API.get('/budget/all'),
        API.get('/expense/all')
      ]);
      setBudgets(budgetRes.data);
      setExpenses(expenseRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err.message);
      toast.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await API.delete(`/budget/${id}`);
        setBudgets(prev => prev.filter(b => b._id !== id));
        toast.success('Budget deleted successfully');
      } catch (err) {
        toast.error('Failed to delete budget');
      }
    }
  };

  const getActualSpent = (category) => {
    // Basic string matching - effectively this needs improved backend categorization logic
    // For now, matching expense title to category if strictly needed, 
    // but ideally expense should have a 'category' field.
    // Assuming expense.category exists as per new plan.
    return expenses
      .filter((e) => (e.category || e.title).toLowerCase() === category.toLowerCase())
      .reduce((sum, e) => sum + e.amount, 0);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Budgeting</h2>
          <p className="text-slate-500">Set goals and monitor your monthly spending.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Plus size={18} /> Set New Budget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">Loading budgets...</div>
        ) : budgets.length > 0 ? (
          budgets.map((budget) => {
            const spent = getActualSpent(budget.category);
            const percent = Math.min((spent / budget.amount) * 100, 100);
            const isOverBudget = spent > budget.amount;
            const isNearBudget = percent > 80 && !isOverBudget;

            return (
              <div key={budget._id} className="card p-6 flex flex-col justify-between h-full group relative">
                <button
                  onClick={() => handleDelete(budget._id)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-slate-800 capitalize">{budget.category}</h3>
                    {isOverBudget ? (
                      <AlertCircle className="text-rose-500" size={20} />
                    ) : (
                      <CheckCircle className="text-emerald-500" size={20} />
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-slate-500">Spent</span>
                        <span className={`font-semibold ${isOverBudget ? 'text-rose-600' : 'text-slate-700'}`}>
                          ₹{spent.toLocaleString('en-IN')} <span className="text-slate-400 font-normal">/ ₹{budget.amount.toLocaleString('en-IN')}</span>
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ease-out rounded-full ${isOverBudget ? 'bg-rose-500' : isNearBudget ? 'bg-amber-500' : 'bg-indigo-500'
                            }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs mt-2">
                        {isOverBudget ? (
                          <span className="text-rose-600 font-medium">Over budget by ₹{(spent - budget.amount).toLocaleString('en-IN')}</span>
                        ) : (
                          <span>You have <b>₹{(budget.amount - spent).toLocaleString('en-IN')}</b> remaining</span>
                        )}
                        <span className="text-slate-400">{percent}% used</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full card p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <Plus size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No budgets set</h3>
            <p className="text-slate-500 mb-6 max-w-sm">
              Create a budget for categories like Food, Transport, or Shopping to keep your spending in check.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary"
            >
              Create First Budget
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <AddBudgetModal onClose={() => setShowModal(false)} onBudgetAdded={fetchData} />
      )}
    </div>
  );
}

export default Budget;
