import { useEffect, useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { FaWallet, FaArrowUp, FaArrowDown, FaChartLine, FaPlus, FaMinus, FaLightbulb, FaArrowRight } from 'react-icons/fa';
import API from '../utils/api';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Dashboard() {
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [userName, setUserName] = useState('User');
  const [insightsPreview, setInsightsPreview] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) setUserName(user.name);

    const fetchData = async () => {
      try {
        const [incomeRes, expenseRes, insightsRes] = await Promise.all([
          API.get('/income/all'),
          API.get('/expense/all'),
          API.get('/ai/insights/monthly-report')
        ]);
        setIncomeData(incomeRes.data);
        setExpenseData(expenseRes.data);
        if (insightsRes.data?.insights) {
          setInsightsPreview(insightsRes.data.insights.slice(0, 2));
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  const totalIncome = incomeData.reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = expenseData.reduce((acc, t) => acc + t.amount, 0);
  const totalBalance = totalIncome - totalExpenses;

  // Pie Chart Data (Expenses by Category)
  const expenseCategories = {};
  expenseData.forEach(item => {
    const cat = item.category || 'Uncategorized';
    expenseCategories[cat] = (expenseCategories[cat] || 0) + item.amount;
  });

  const doughnutData = {
    labels: Object.keys(expenseCategories),
    datasets: [
      {
        data: Object.values(expenseCategories),
        backgroundColor: [
          '#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    cutout: '75%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: { family: 'Inter', size: 12 }
        }
      }
    }
  };

  const recentTransactions = [
    ...incomeData.map(tx => ({ ...tx, type: 'income' })),
    ...expenseData.map(tx => ({ ...tx, type: 'expense' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-500">Welcome back, {userName}. Here's your financial overview.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/income" className="btn btn-secondary text-sm">
            <FaPlus className="text-emerald-500" /> Add Income
          </Link>
          <Link to="/expenses" className="btn btn-primary text-sm">
            <FaMinus /> Add Expense
          </Link>
        </div>
      </div>

      {/* Insights Preview Banner - New Feature */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2 mb-2">
              <FaLightbulb className="text-amber-300" /> AI Insights Preview
            </h3>
            <div className="space-y-1">
              {insightsPreview.length > 0 ? (
                insightsPreview.map((insight, idx) => (
                  <p key={idx} className="text-indigo-100 text-sm flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 bg-white rounded-full"></span>
                    {insight}
                  </p>
                ))
              ) : (
                <p className="text-indigo-200 text-sm">Analyzing your spending habits to provide smart tips...</p>
              )}
            </div>
          </div>
          <Link to="/insights" className="bg-white text-indigo-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition flex items-center gap-2 whitespace-nowrap">
            View Full Report <FaArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Balance</p>
            <h3 className="text-2xl font-bold text-slate-900">₹{totalBalance.toLocaleString('en-IN')}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
            <FaWallet />
          </div>
        </div>
        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Income</p>
            <h3 className="text-2xl font-bold text-slate-900 text-emerald-600">+₹{totalIncome.toLocaleString('en-IN')}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            <FaArrowUp />
          </div>
        </div>
        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Expenses</p>
            <h3 className="text-2xl font-bold text-slate-900 text-rose-600">-₹{totalExpenses.toLocaleString('en-IN')}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xl">
            <FaArrowDown />
          </div>
        </div>
      </div>

      {/* Charts & Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Recent Transactions List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Recent Transactions</h3>
              <Link to="/expenses" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                        }`}>
                        {tx.icon || (tx.type === 'income' ? <FaArrowUp /> : <FaChartLine />)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{tx.title || 'Untitled Transaction'}</p>
                        <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500">
                  No transactions yet. Start by adding one!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expense Breakdown Chart */}
        <div className="card p-6 flex flex-col">
          <h3 className="font-bold text-slate-800 mb-6">Expense Breakdown</h3>
          <div className="flex-1 flex items-center justify-center relative min-h-[250px]">
            {Object.keys(expenseCategories).length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className="text-center text-slate-400 text-sm">
                No expense data to display
              </div>
            )}
            {/* Center Text Overlay */}
            {Object.keys(expenseCategories).length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-xs text-slate-400 font-medium">Total</span>
                <span className="text-xl font-bold text-slate-800">₹{totalExpenses.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
