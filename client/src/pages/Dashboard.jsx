import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import API from '../utils/api';

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const incomeRes = await API.get('/income/all');
        const expenseRes = await API.get('/expense/all');
        setIncomeData(incomeRes.data);
        setExpenseData(expenseRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  const totalIncome = incomeData.reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = expenseData.reduce((acc, t) => acc + t.amount, 0);
  const totalBalance = totalIncome - totalExpenses;

  const chartData = {
    labels: ['Total Balance', 'Total Expenses', 'Total Income'],
    datasets: [
      {
        data: [totalBalance, totalExpenses, totalIncome],
        backgroundColor: ['#6D28D9', '#DC2626', '#F97316'],
        hoverOffset: 10,
      },
    ],
  };

  const transactions = [
    ...incomeData.map(tx => ({ ...tx, type: 'income' })),
    ...expenseData.map(tx => ({ ...tx, type: 'expense' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const recentIncome = incomeData.slice(0, 5);
  const recentExpenses = expenseData.slice(0, 5);

  return (
    <div className="space-y-10">
      {/* Top Summary Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-purple-600">
          <p className="text-gray-500">Total Balance</p>
          <h2 className="text-2xl font-bold text-purple-700">${totalBalance.toLocaleString()}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-orange-500">
          <p className="text-gray-500">Total Income</p>
          <h2 className="text-2xl font-bold text-orange-600">${totalIncome.toLocaleString()}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-red-600">
          <p className="text-gray-500">Total Expenses</p>
          <h2 className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</h2>
        </div>
      </div>

      {/* First Row: Transactions & Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-purple-800">Recent Transactions</h3>
            <button className="text-sm text-purple-600 hover:underline">See All →</button>
          </div>
          <ul className="space-y-4">
            {transactions.map((tx, idx) => (
              <li key={idx} className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{tx.icon || '💸'}</span>
                  <div>
                    <p className="font-medium">{tx.title}</p>
                    <p className="text-gray-400 text-sm">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className={`font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>{tx.type === 'income' ? '+' : '-'}${tx.amount}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Financial Overview */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold text-purple-800 mb-6">Financial Overview</h3>
          <Doughnut data={chartData} />
        </div>
      </div>

      {/* Second Row: Income & Expense Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Box */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-orange-600">Recent Income</h3>
            <Link to="/income" className="text-sm text-orange-500 hover:underline">See All →</Link>
          </div>
          <ul className="space-y-4">
            {recentIncome.map((tx, idx) => (
              <li key={idx} className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{tx.icon || '💰'}</span>
                  <div>
                    <p className="font-medium">{tx.title}</p>
                    <p className="text-gray-400 text-sm">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="font-semibold text-green-600">+${tx.amount}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Expense Box */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-red-600">Recent Expenses</h3>
            <Link to="/expenses" className="text-sm text-red-500 hover:underline">See All →</Link>
          </div>
          <ul className="space-y-4">
            {recentExpenses.map((tx, idx) => (
              <li key={idx} className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{tx.icon || '💸'}</span>
                  <div>
                    <p className="font-medium">{tx.title}</p>
                    <p className="text-gray-400 text-sm">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="font-semibold text-red-600">-${tx.amount}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
