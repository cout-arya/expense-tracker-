import { useState, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Download, Plus, Search, Filter, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import API from '../utils/api';
import AddIncomeModal from '../components/AddIncomeModal';
import FilterModal from '../components/FilterModal';
import { toast } from 'react-toastify';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function Income() {
  const [incomeData, setIncomeData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    categories: [],
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  });

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const res = await API.get('/income/all');
      setIncomeData(res.data);
    } catch (err) {
      console.error('Failed to fetch income:', err.message);
      toast.error('Failed to load income data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income record?')) {
      try {
        await API.delete(`/income/${id}`);
        setIncomeData(prev => prev.filter(item => item._id !== id));
        toast.success('Income deleted successfully');
      } catch (err) {
        toast.error('Failed to delete income');
      }
    }
  };

  // Get unique categories from income data
  const availableCategories = useMemo(() => {
    const categories = [...new Set(incomeData.map(item => item.category).filter(Boolean))];
    return categories.length > 0 ? categories : ['Salary', 'Freelance', 'Investment', 'Business', 'Other'];
  }, [incomeData]);

  // Filter and search logic
  const filteredData = useMemo(() => {
    return incomeData.filter(item => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory = filters.categories.length === 0 ||
        filters.categories.includes(item.category);

      // Date filter
      const itemDate = new Date(item.date);
      const matchesDateFrom = !filters.dateFrom || itemDate >= new Date(filters.dateFrom);
      const matchesDateTo = !filters.dateTo || itemDate <= new Date(filters.dateTo);

      // Amount filter
      const matchesAmountMin = !filters.amountMin || item.amount >= parseFloat(filters.amountMin);
      const matchesAmountMax = !filters.amountMax || item.amount <= parseFloat(filters.amountMax);

      return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo && matchesAmountMin && matchesAmountMax;
    });
  }, [incomeData, searchQuery, filters]);

  // Excel export function
  const handleExportToExcel = () => {
    if (filteredData.length === 0) {
      toast.error('No data to export');
      return;
    }

    const exportData = filteredData.map(item => ({
      Date: new Date(item.date).toLocaleDateString('en-IN'),
      Title: item.title,
      Category: item.category || 'Uncategorized',
      Amount: item.amount,
      Description: item.description || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Income');

    // Auto-size columns
    const maxWidth = exportData.reduce((w, r) => Math.max(w, r.Title.length), 10);
    worksheet['!cols'] = [
      { wch: 12 }, // Date
      { wch: maxWidth }, // Title
      { wch: 15 }, // Category
      { wch: 12 }, // Amount
      { wch: 30 }  // Description
    ];

    XLSX.writeFile(workbook, `Income_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported to Excel successfully');
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  // Group data by date for chart
  const chartData = {
    labels: incomeData.slice(0, 7).reverse().map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Income',
        data: incomeData.slice(0, 7).reverse().map(item => item.amount),
        backgroundColor: '#10B981',
        borderRadius: 4,
        barThickness: 40,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1E293B',
        padding: 12,
        titleFont: { family: 'Inter', size: 13 },
        bodyFont: { family: 'Inter', size: 13 },
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#F1F5F9' },
        ticks: { font: { family: 'Inter' }, color: '#64748B' }
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter' }, color: '#64748B' }
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Income</h2>
          <p className="text-slate-500">Manage and track your earnings.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Plus size={18} /> Add Income
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-bold text-slate-800 mb-6">Income Trend</h3>
          <div className="h-[300px]">
            {incomeData.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Summary Card (Optional) */}
        <div className="card p-6 bg-emerald-50 border-emerald-100">
          <h3 className="font-bold text-emerald-800 mb-2">Total</h3>
          <div className="mt-1">
            <h3 className="text-3xl font-bold text-emerald-600">
              ₹{incomeData.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-sm text-slate-500 mt-1">Total Income</p>
          </div>
          <p className="text-sm text-emerald-700/80 mt-4">
            Keep up the good work! Tracking your income is the first step to financial freedom.
          </p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-800">History</h3>
            {(searchQuery || filters.categories.length > 0 || filters.dateFrom || filters.dateTo || filters.amountMin || filters.amountMax) && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                {filteredData.length} of {incomeData.length} results
              </span>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search income..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-9 py-2 text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilterModal(true)}
              className={`btn btn-secondary px-3 ${filters.categories.length > 0 || filters.dateFrom || filters.dateTo || filters.amountMin || filters.amountMax
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                : ''
                }`}
              title="Filter"
            >
              <Filter size={16} />
            </button>
            <button
              onClick={handleExportToExcel}
              className="btn btn-secondary px-3"
              title="Download Excel"
            >
              <Download size={16} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading...</div>
          ) : filteredData.length > 0 ? (
            filteredData.map(item => (
              <div key={item._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg">
                    {item.icon || '💰'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{item.category || 'Uncategorized'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-semibold text-emerald-600">+₹{item.amount.toLocaleString('en-IN')}</span>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-400">
              <p>No income records found.</p>
              <button onClick={() => setShowModal(true)} className="text-indigo-600 hover:underline mt-2 text-sm">
                Add your first income
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <AddIncomeModal
          onClose={() => setShowModal(false)}
          onIncomeAdded={fetchIncomes}
        />
      )}

      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          onApplyFilters={handleApplyFilters}
          initialFilters={filters}
          availableCategories={availableCategories}
          type="income"
        />
      )}
    </div>
  );
}

export default Income;
