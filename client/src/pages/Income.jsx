import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Download } from 'lucide-react';
import API from '../utils/api';
import AddIncomeModal from '../components/AddIncomeModal';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function Income() {
  const [incomeData, setIncomeData] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchIncomes = async () => {
    try {
      const res = await API.get('/income/all');
      setIncomeData(res.data);
    } catch (err) {
      console.error('Failed to fetch income:', err.message);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const barData = {
    labels: incomeData.map(item => new Date(item.date).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short'
    })),
    datasets: [
      {
        label: 'Income',
        data: incomeData.map(item => item.amount),
        backgroundColor: 'rgba(109, 40, 217, 0.7)',
        borderRadius: 8,
        barThickness: 30,
      },
    ],
  };

  const barOptions = {
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
          <h2 className="text-2xl font-bold text-purple-700">Income Overview</h2>
          <button onClick={() => setShowModal(true)} className="text-sm font-semibold text-purple-600 hover:underline">
            + Add Income
          </button>
        </div>
        <p className="text-gray-500 mb-6">Track your earnings over time and analyze your income trends.</p>
        {incomeData.length > 0 ? (
          <Bar data={barData} options={barOptions} />
        ) : (
          <p className="text-gray-400">No income data available.</p>
        )}
      </div>

      {/* Income List */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-purple-700">Income Sources</h3>
          <button className="text-purple-600 hover:text-purple-800">
            <Download size={20} />
          </button>
        </div>

        <ul className="space-y-4">
          {incomeData.length > 0 ? incomeData.map(item => (
            <li key={item._id} className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{item.icon || '💰'}</span>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-gray-400 text-sm">{new Date(item.date).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="font-semibold text-green-600">+${item.amount}</p>
            </li>
          )) : (
            <li className="text-gray-400">No income sources to display.</li>
          )}
        </ul>
      </div>

      {showModal && (
        <AddIncomeModal
          onClose={() => setShowModal(false)}
          onIncomeAdded={fetchIncomes}
        />
      )}
    </div>
  );
}

export default Income;
