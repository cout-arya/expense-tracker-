import { useState } from 'react';
import {
  BrowserRouter as Router,
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
} from 'react-icons/fa';

import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Budget from './pages/Budget';
import Login from './pages/Login';
import Register from './pages/Register';

function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('token');
  const location = useLocation();
  return isAuthenticated ? children : <Navigate to="/login" state={{ from: location }} />;
}

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const hideSidebar = location.pathname === '/login' || location.pathname === '/register';

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {!hideSidebar && (
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-16'
          } bg-purple-700 text-white transition-width duration-300 flex flex-col`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-purple-600">
            <h1 className={`font-bold text-xl ${sidebarOpen ? 'block' : 'hidden'}`}>
              TruBalance
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white focus:outline-none"
              aria-label="Toggle sidebar"
            >
              <FaBars />
            </button>
          </div>

          {/* Navigation Links + Logout */}
<nav className="flex flex-col mt-6 space-y-4 px-3">
  <Link
    to="/dashboard"
    className="flex items-center gap-3 px-3 py-2 rounded transition hover:bg-white hover:text-purple-700"
  >
    <FaHome />
    <span className={`${sidebarOpen ? 'inline' : 'hidden'}`}>Dashboard</span>
  </Link>
  <Link
    to="/income"
    className="flex items-center gap-3 px-3 py-2 rounded transition hover:bg-white hover:text-purple-700"
  >
    <FaDollarSign />
    <span className={`${sidebarOpen ? 'inline' : 'hidden'}`}>Income</span>
  </Link>
  <Link
    to="/expenses"
    className="flex items-center gap-3 px-3 py-2 rounded transition hover:bg-white hover:text-purple-700"
  >
    <FaWallet />
    <span className={`${sidebarOpen ? 'inline' : 'hidden'}`}>Expenses</span>
  </Link>
  <Link
    to="/budget"
    className="flex items-center gap-3 px-3 py-2 rounded transition hover:bg-white hover:text-purple-700"
  >
    <FaChartPie />
    <span className={`${sidebarOpen ? 'inline' : 'hidden'}`}>Budget</span>
  </Link>
  <button
    onClick={handleLogout}
    className="flex items-center gap-3 px-3 py-2 mt-2 rounded transition hover:bg-white hover:text-purple-700"
  >
    <FaSignOutAlt />
    <span className={`${sidebarOpen ? 'inline' : 'hidden'}`}>Logout</span>
  </button>
</nav>

        </aside>
      )}

      {/* Main content */}
      <main className="flex-1  overflow-y-auto">{children}</main>
    </div>
  );
}


function App() {
  return (
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Layout>
  );
}

export default App;
