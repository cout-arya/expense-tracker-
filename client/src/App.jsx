import { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  useNavigate
} from 'react-router-dom';
import {
  FaBars,
  FaHome,
  FaDollarSign,
  FaWallet,
  FaChartPie,
  FaSignOutAlt,
  FaLightbulb,
  FaUser,
  FaFileInvoice,
  FaUsers
} from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Budget from './pages/Budget';
import Login from './pages/Login';
import Register from './pages/Register';
import Insights from './pages/Insights';
import LandingPage from './pages/LandingPage';
import BusinessProfileSetup from './pages/BusinessProfileSetup';
import Invoices from './pages/Invoices';
import Clients from './pages/Clients';
import { getInitials } from './utils/helpers';

function PublicRoute({ children }) {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
}

function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('token');
  const location = useLocation();
  return isAuthenticated ? children : <Navigate to="/login" state={{ from: location }} />;
}

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  const hideSidebar = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/';

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { to: '/invoices', icon: FaFileInvoice, label: 'Invoices' },
    { to: '/clients', icon: FaUsers, label: 'Clients' },
    { to: '/income', icon: FaDollarSign, label: 'Income' },
    { to: '/expenses', icon: FaWallet, label: 'Expenses' },
    { to: '/budget', icon: FaChartPie, label: 'Budget' },
    { to: '/insights', icon: FaLightbulb, label: 'AI Insights' }
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {!hideSidebar && (
        <aside
          className={`${sidebarOpen ? 'w-64' : 'w-20'
            } bg-white border-r border-slate-200 transition-all duration-300 flex flex-col fixed h-full z-20`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h1 className={`font-bold text-xl text-indigo-600 tracking-tight ${sidebarOpen ? 'block' : 'hidden'}`}>
              TruBalance
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-indigo-600 focus:outline-none p-1 rounded transition"
              aria-label="Toggle sidebar"
            >
              <FaBars />
            </button>
          </div>

          {/* User Profile */}
          {sidebarOpen && user && (
            <div className="p-6 border-b border-slate-100 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                  {getInitials(user.name)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold text-slate-800 text-sm truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 flex flex-col mt-6 space-y-1 px-3">
            {navLinks.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <Icon className={`text-lg ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span className={`${sidebarOpen ? 'inline' : 'hidden'}`}>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-all text-slate-600 hover:bg-red-50 hover:text-red-600 group"
            >
              <FaSignOutAlt className="text-lg text-slate-400 group-hover:text-red-500" />
              <span className={`${sidebarOpen ? 'inline' : 'hidden'}`}>Logout</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main content */}
      <main className={`flex-1 transition-all duration-300 ${!hideSidebar && (sidebarOpen ? 'ml-64' : 'ml-20')}`}>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="shadow-lg rounded-xl border border-slate-100"
      />
    </div>
  );
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/income/*"
          element={
            <ProtectedRoute>
              <Income />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses/*"
          element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budget/*"
          element={
            <ProtectedRoute>
              <Budget />
            </ProtectedRoute>
          }
        />
        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <Insights />
            </ProtectedRoute>
          }
        />
        <Route path="/business-profile-setup" element={<BusinessProfileSetup />} />
        <Route
          path="/invoices/*"
          element={
            <ProtectedRoute>
              <Invoices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/*"
          element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Layout>
  );
}

export default App;
