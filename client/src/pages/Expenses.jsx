import { useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Download, Plus, Search, Filter, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import API from '../utils/api';
import AddExpenseModal from '../components/AddExpenseModal';
import FilterModal from '../components/FilterModal';
import { toast } from 'react-toastify';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

function Expense() {
  const [expenseData, setExpenseData] = useState([]);
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

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await API.get('/expense/all');
      setExpenseData(res.data);
    } catch (err) {
      console.error('Failed to fetch expenses:', err.message);
      toast.error('Failed to load expense data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await API.delete(`/expense/${id}`);
        setExpenseData(prev => prev.filter(item => item._id !== id));
        toast.success('Expense deleted successfully');
      } catch (err) {
        toast.error('Failed to delete expense');
      }
    }
  };

  // Get unique categories from expense data
  const availableCategories = useMemo(() => {
    const categories = [...new Set(expenseData.map(item => item.category).filter(Boolean))];
    return categories.length > 0 ? categories : ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Other'];
  }, [expenseData]);

  // Filter and search logic
  const filteredData = useMemo(() => {
    return expenseData.filter(item => {
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
  }, [expenseData, searchQuery, filters]);

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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');

    // Auto-size columns
    const maxWidth = exportData.reduce((w, r) => Math.max(w, r.Title.length), 10);
    worksheet['!cols'] = [
      { wch: 12 }, // Date
      { wch: maxWidth }, // Title
      { wch: 15 }, // Category
      { wch: 12 }, // Amount
      { wch: 30 }  // Description
    ];

    XLSX.writeFile(workbook, `Expenses_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported to Excel successfully');
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const lineData = {
    labels: expenseData.slice(0, 10).reverse().map(item =>
      new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    ),
    datasets: [
      {
        label: 'Expense',
        data: expenseData.slice(0, 10).reverse().map(item => item.amount),
        fill: true,
        borderColor: '#E11D48', // Rose 600
        backgroundColor: 'rgba(225, 29, 72, 0.1)', // Rose 600 with opacity
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#E11D48',
      },
    ],
  };

  const lineOptions = {
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
        intersect: false,
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
          <h2 className="text-2xl font-bold text-slate-900">Expenses</h2>
          <p className="text-slate-500">Track and manage your spending habits.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary bg-rose-600 hover:bg-rose-700 focus:ring-rose-500/20"
        >
          <Plus size={18} /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-bold text-slate-800 mb-6">Spending Trend</h3>
          <div className="h-[300px]">
            {expenseData.length > 0 ? (
              <Line data={lineData} options={lineOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Summary Card */}
        <div className="card p-6 bg-rose-50 border-rose-100">
          <h3 className="font-bold text-rose-800 mb-2">Total Expenses</h3>
          <div className="mt-1">
            <h3 className="text-3xl font-bold text-rose-600">
              ₹{expenseData.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-sm text-slate-500 mt-1">Total Expenses</p>
          </div>
          <p className="text-sm text-rose-700/80">
            Monitor your spending closely. Try to keep your expenses within your budget limits.
          </p>
          <div className="mt-6 pt-6 border-t border-rose-200/50">
            <p className="text-xs font-semibold text-rose-800 uppercase tracking-wider mb-2">Top Categories</p>
            <div className="flex flex-wrap gap-2">
              {/* Placeholder for top categories */}
              <span className="bg-white/50 text-rose-700 px-2 py-1 rounded text-xs">Food</span>
              <span className="bg-white/50 text-rose-700 px-2 py-1 rounded text-xs">Transport</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-800">History</h3>
            {(searchQuery || filters.categories.length > 0 || filters.dateFrom || filters.dateTo || filters.amountMin || filters.amountMax) && (
              <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">
                {filteredData.length} of {expenseData.length} results
              </span>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-9 py-2 text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilterModal(true)}
              className={`btn btn-secondary px-3 ${filters.categories.length > 0 || filters.dateFrom || filters.dateTo || filters.amountMin || filters.amountMax
                ? 'bg-rose-100 text-rose-700 border-rose-200'
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
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-lg">
                    {item.icon || '💸'}
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
                  <span className="font-semibold text-rose-600">-₹{item.amount.toLocaleString('en-IN')}</span>
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
              <p>No expense records found.</p>
              <button onClick={() => setShowModal(true)} className="text-indigo-600 hover:underline mt-2 text-sm">
                Add your first expense
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <AddExpenseModal onClose={() => setShowModal(false)} onExpenseAdded={fetchExpenses} />
      )}

      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          onApplyFilters={handleApplyFilters}
          initialFilters={filters}
          availableCategories={availableCategories}
          type="expense"
        />
      )}
    </div>
  );
}

export default Expense;
