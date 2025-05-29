import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Download } from 'lucide-react';
import API from '../utils/api';
import AddExpenseModal from '../components/AddExpenseModal';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

function Expense() {
  const [expenseData, setExpenseData] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchExpenses = async () => {
    try {
      const res = await API.get('/expense/all'); // assuming your expense API route
      setExpenseData(res.data);
    } catch (err) {
      console.error('Failed to fetch expenses:', err.message);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const lineData = {
    labels: expenseData.map(item =>
      new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    ),
    datasets: [
      {
        label: 'Expense',
        data: expenseData.map(item => item.amount),
        fill: false,
        borderColor: 'rgba(220, 38, 38, 0.8)', 
        backgroundColor: 'rgba(220, 38, 38, 0.5)',
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 2500,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="space-y-10">
      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-red-600">Expense Overview</h2>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm font-semibold text-red-500 hover:underline"
          >
            + Add Expense
          </button>
        </div>
        <p className="text-gray-500 mb-6">Track your spending over time and analyze your expense trends.</p>
        {expenseData.length > 0 ? (
          <Line data={lineData} options={lineOptions} />
        ) : (
          <p className="text-gray-400">No expense data available.</p>
        )}
      </div>

      {/* Expense List */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-red-600">Expense Sources</h3>
          <button className="text-red-500 hover:text-red-700">
            <Download size={20} />
          </button>
        </div>

        <ul className="space-y-4">
          {expenseData.length > 0 ? (
            expenseData.map(item => (
              <li key={item._id} className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{item.icon || '💸'}</span>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-gray-400 text-sm">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="font-semibold text-red-600">-${item.amount}</p>
              </li>
            ))
          ) : (
            <li className="text-gray-400">No expense sources to display.</li>
          )}
        </ul>
      </div>

      {showModal && (
        <AddExpenseModal onClose={() => setShowModal(false)} onExpenseAdded={fetchExpenses} />
      )}
    </div>
  );
}

export default Expense;
