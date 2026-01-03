import { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    RadialLinearScale,
    ArcElement,
} from 'chart.js';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';
import { FaLightbulb, FaChartLine, FaWallet, FaRobot, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaSpinner, FaArrowUp, FaArrowDown, FaChartPie } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../utils/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    RadialLinearScale,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

function Insights() {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        patterns: null,
        advice: null,
        budgets: null,
        report: null
    });

    useEffect(() => {
        const fetchAllInsights = async () => {
            try {
                setLoading(true);
                const [patternsRes, adviceRes, budgetsRes, reportRes] = await Promise.all([
                    API.get('/ai/insights/spending-patterns'),
                    API.get('/ai/insights/financial-advice'),
                    API.get('/ai/insights/budget-recommendations'),
                    API.get('/ai/insights/monthly-report')
                ]);

                setData({
                    patterns: patternsRes.data,
                    advice: adviceRes.data,
                    budgets: budgetsRes.data,
                    report: reportRes.data
                });
            } catch (err) {
                console.error('Failed to fetch insights:', err);
                toast.error('Failed to load partial insights data');
            } finally {
                setLoading(false);
            }
        };

        fetchAllInsights();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <FaSpinner className="animate-spin text-4xl text-indigo-600 mb-4" />
                <p className="text-slate-500 font-medium">Analyzing your financial data...</p>
                <p className="text-slate-400 text-sm mt-1">Our AI is crunching the numbers</p>
            </div>
        );
    }

    const { patterns, advice, budgets, report } = data;

    // --- Components for Tabs ---

    const OverviewTab = () => (
        <div className="space-y-6 animate-fade-in">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className={`card p-6 border-l-4 border-emerald-500`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm mb-1">Total Income</p>
                            <p className="text-2xl font-bold text-slate-800">₹{report?.summary?.totalIncome?.toLocaleString('en-IN') || 0}</p>
                        </div>
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                            <FaArrowUp />
                        </div>
                    </div>
                </div>

                <div className={`card p-6 border-l-4 border-rose-500`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm mb-1">Total Expenses</p>
                            <p className="text-2xl font-bold text-slate-800">₹{report?.summary?.totalExpenses?.toLocaleString('en-IN') || 0}</p>
                        </div>
                        <div className="p-3 bg-rose-100 text-rose-600 rounded-full">
                            <FaArrowDown />
                        </div>
                    </div>
                </div>

                <div className={`card p-6 border-l-4 border-indigo-500`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm mb-1">Net Savings</p>
                            <p className="text-2xl font-bold text-emerald-600">₹{report?.summary?.savings?.toLocaleString('en-IN') || 0}</p>
                        </div>
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                            <FaWallet />
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Insights */}
                <div className="lg:col-span-2 card p-6">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <FaLightbulb className="text-amber-500" /> Key Insights this Month
                    </h3>
                    <div className="space-y-4">
                        {report?.insights?.length > 0 ? (
                            report.insights.map((insight, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex gap-3 items-start">
                                    <div className="mt-1 text-indigo-600">
                                        <FaInfoCircle />
                                    </div>
                                    <p className="text-slate-700">{insight}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-400 italic">No specific insights generated yet.</p>
                        )}
                    </div>
                </div>

                {/* Financial Health Score (Mock visual) */}
                <div className="card p-6 flex flex-col items-center justify-center text-center">
                    <h3 className="font-bold text-slate-800 mb-2">Financial Health</h3>
                    <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="#E2E8F0"
                                strokeWidth="10"
                                fill="transparent"
                            />
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke={advice?.savingsRate >= 20 ? '#10B981' : advice?.savingsRate >= 10 ? '#F59E0B' : '#EF4444'}
                                strokeWidth="10"
                                fill="transparent"
                                strokeDasharray="440"
                                strokeDashoffset={440 - (440 * (Math.min((advice?.savingsRate || 0) * 2.5 + 20, 100) / 100))} // Rough calc for score
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-slate-800">{Math.min(Math.round((advice?.savingsRate || 0) * 2.5 + 20), 100) || 50}</span>
                            <span className="text-xs text-slate-500">OUT OF 100</span>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500">
                        Based on your savings rate ({advice?.savingsRate}%) and budget adherence.
                    </p>
                </div>
            </div>
        </div>
    );

    const AdvisorTab = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-slate-800">Financial Advisor</h3>
                    <p className="text-slate-500">Personalized tips to improve your financial wellness</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {advice?.advice?.length > 0 ? (
                    advice.advice.map((item, idx) => (
                        <div key={idx} className={`card p-5 border-l-4 ${item.priority === 'high' ? 'border-rose-500' : 'border-indigo-500'
                            }`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{item.icon}</span>
                                    <h4 className="font-bold text-slate-800">{item.title}</h4>
                                </div>
                                {item.priority === 'high' && (
                                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded-full uppercase tracking-wide">
                                        Priority
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-600 mb-3">{item.message}</p>
                            {item.details && (
                                <div className="mt-3 flex justify-between items-center text-sm">
                                    <p>Current: <span className="font-mono text-slate-600">₹{item.details.current?.toLocaleString('en-IN')}</span></p>
                                    <p>Target: <span className="font-mono text-indigo-600">₹{item.details.recommended?.toLocaleString('en-IN')}</span></p>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="col-span-2 p-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        No specific advice generated yet. Keep tracking your expenses!
                    </div>
                )}
            </div>
        </div>
    );

    const TrendsTab = () => {
        // Prepare Radar Data for Weekend vs Weekday
        const weekendWeekdayData = {
            labels: patterns?.insights?.filter(i => i.type === 'weekend_weekday').map(i => i.category) || [],
            datasets: [
                {
                    label: 'Weekend Avg',
                    data: patterns?.insights?.filter(i => i.type === 'weekend_weekday').map(i => i.weekendAvg) || [],
                    backgroundColor: 'rgba(244, 63, 94, 0.2)',
                    borderColor: '#F43F5E',
                    pointBackgroundColor: '#F43F5E',
                },
                {
                    label: 'Weekday Avg',
                    data: patterns?.insights?.filter(i => i.type === 'weekend_weekday').map(i => i.weekdayAvg) || [],
                    backgroundColor: 'rgba(79, 70, 229, 0.2)',
                    borderColor: '#4F46E5',
                    pointBackgroundColor: '#4F46E5',
                },
            ],
        };

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Weekend vs Weekday Card */}
                    <div className="card p-6">
                        <h3 className="font-bold text-slate-800 mb-4">Weekend Spikes</h3>
                        <p className="text-slate-500 text-sm mb-6">
                            Comparing your average daily spending on weekends vs weekdays by category.
                        </p>
                        <div className="h-[300px] flex items-center justify-center">
                            {weekendWeekdayData.labels.length > 0 ? (
                                <Radar data={weekendWeekdayData} options={{ responsive: true, scale: { ticks: { beginAtZero: true } } }} />
                            ) : (
                                <div className="text-center text-slate-400">
                                    Not enough data to analyze weekend patterns yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Anomalies/Outliers List */}
                    <div className="card p-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FaExclamationTriangle className="text-amber-500" /> Unusual Spending
                        </h3>
                        <div className="space-y-4">
                            {patterns?.insights?.filter(i => i.type === 'outlier').length > 0 ? (
                                patterns.insights.filter(i => i.type === 'outlier').map((item, idx) => (
                                    <div key={idx} className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">{item.category}</span>
                                                <p className="text-slate-800 font-medium mt-1">{item.message}</p>
                                            </div>
                                            <span className="font-mono text-amber-700 font-bold">${item.amount}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-[200px] flex flex-col items-center justify-center text-slate-400">
                                    <FaCheckCircle className="text-emerald-500 text-3xl mb-2 opacity-50" />
                                    <p>No unusual spending detected.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const PlanningTab = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-8 text-white shadow-lg">
                <h3 className="text-2xl font-bold mb-2">Smart Budget Planner</h3>
                <p className="text-indigo-100 max-w-2xl">
                    Based on your ${budgets?.monthlyIncome?.toLocaleString()} monthly income and the 50/30/20 rule,
                    here is how our AI recommends optimizing your budget.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Comparison Table */}
                <div className="card overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800">Recommendation Engine</h3>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {budgets?.recommendations?.optimal ? (
                            Object.entries(budgets.recommendations.optimal).map(([category, amount]) => (
                                <div key={category} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                    <span className="font-medium text-slate-700 capitalize">{category}</span>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <span className="block font-bold text-indigo-600">₹{amount.toLocaleString('en-IN')}</span>
                                            <span className="text-xs text-slate-400">Recommended</span>
                                        </div>
                                        {/* Placeholder action to apply */}
                                        <button
                                            onClick={() => toast.info('Auto-apply budget coming in v2')}
                                            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full transition"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-400">
                                Insufficient data to generate recommendations.
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 mb-8">

                    <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                        <FaChartPie /> 50/30/20 Rule Analysis
                    </h3>
                    <p className="text-indigo-700 text-sm mb-4">
                        Based on your ₹{budgets?.monthlyIncome?.toLocaleString('en-IN')} monthly income and the 50/30/20 rule,
                        here is how you should allocate your budget.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Needs */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-slate-700">Needs (50%)</span>
                                <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600">Essential</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold text-indigo-600">
                                    ₹{(budgets?.monthlyIncome * 0.5 || 0).toLocaleString('en-IN')}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Rent, groceries, utilities</p>
                        </div>

                        {/* Wants */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-slate-700">Wants (30%)</span>
                                <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600">Lifestyle</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold text-indigo-600">
                                    ₹{(budgets?.monthlyIncome * 0.3 || 0).toLocaleString('en-IN')}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Dining out, hobbies, entertainment</p>
                        </div>

                        {/* Savings */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-slate-700">Savings (20%)</span>
                                <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600">Future</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold text-emerald-600">
                                    ₹{(budgets?.monthlyIncome * 0.2 || 0).toLocaleString('en-IN')}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Investments, emergency fund</p>
                        </div>
                    </div>
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-4">Detailed Budget Recommendations</h3>
                <div className="space-y-4">
                    {budgets?.recommendations?.optimal ? (
                        Object.entries(budgets.recommendations.optimal).map(([category, amount], idx) => (
                            <div key={idx} className="card p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                    <FaLightbulb />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="text-slate-700 leading-relaxed font-medium">
                                            Limit <strong>{category}</strong> spending to
                                        </p>
                                        <span className="block font-bold text-indigo-600">₹{amount.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                        <div className="bg-indigo-500 h-full rounded-full w-3/4 opacity-50"></div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-slate-500 py-8">No budget recommendations available yet.</div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FaRobot className="text-indigo-600" /> AI Insights
                    </h2>
                    <p className="text-slate-500">Intelligent analysis of your financial health.</p>
                </div>
                <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200">
                    {['overview', 'advisor', 'trends', 'planning'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                } capitalize`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'advisor' && <AdvisorTab />}
                {activeTab === 'trends' && <TrendsTab />}
                {activeTab === 'planning' && <PlanningTab />}
            </div>
        </div>
    );
}

export default Insights;
