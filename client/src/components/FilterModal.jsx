import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag } from 'lucide-react';

function FilterModal({ onClose, onApplyFilters, initialFilters, availableCategories, type = 'expense' }) {
    const [filters, setFilters] = useState({
        categories: initialFilters?.categories || [],
        dateFrom: initialFilters?.dateFrom || '',
        dateTo: initialFilters?.dateTo || '',
        amountMin: initialFilters?.amountMin || '',
        amountMax: initialFilters?.amountMax || ''
    });

    const handleCategoryToggle = (category) => {
        setFilters(prev => ({
            ...prev,
            categories: prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category]
        }));
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            categories: [],
            dateFrom: '',
            dateTo: '',
            amountMin: '',
            amountMax: ''
        };
        setFilters(clearedFilters);
        onApplyFilters(clearedFilters);
        onClose();
    };

    const handleApply = () => {
        onApplyFilters(filters);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">Filter {type === 'income' ? 'Income' : 'Expenses'}</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Categories */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                            <Tag size={16} />
                            Categories
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {availableCategories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => handleCategoryToggle(category)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filters.categories.includes(category)
                                            ? type === 'income'
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-rose-600 text-white'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                            <Calendar size={16} />
                            Date Range
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">From</label>
                                <input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                                    className="input-field text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">To</label>
                                <input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                                    className="input-field text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Amount Range */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                            <DollarSign size={16} />
                            Amount Range
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Min (₹)</label>
                                <input
                                    type="number"
                                    value={filters.amountMin}
                                    onChange={(e) => setFilters(prev => ({ ...prev, amountMin: e.target.value }))}
                                    placeholder="0"
                                    className="input-field text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Max (₹)</label>
                                <input
                                    type="number"
                                    value={filters.amountMax}
                                    onChange={(e) => setFilters(prev => ({ ...prev, amountMax: e.target.value }))}
                                    placeholder="No limit"
                                    className="input-field text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 flex gap-3">
                    <button
                        onClick={handleClearFilters}
                        className="flex-1 btn btn-secondary"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={handleApply}
                        className={`flex-1 btn ${type === 'income'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'btn-primary'
                            }`}
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FilterModal;
