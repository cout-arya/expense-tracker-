import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center h-full"
    style={{
    backgroundImage: "url('/bg.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}>
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Login Form */}
        <div className="w-full md:w-1/2 p-10">
          <h2 className="text-3xl font-bold mb-6 text-purple-800 border-b-2 border-purple-600 pb-2">
            Login
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center border-b border-gray-300 py-2">
              <FaEnvelope className="text-gray-400 mr-3" />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full focus:outline-none"
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center border-b border-gray-300 py-2">
              <FaLock className="text-gray-400 mr-3" />
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                className="w-full focus:outline-none"
                onChange={handleChange}
                required
              />
            </div>
            <div className="text-sm text-right text-purple-600 hover:underline cursor-pointer">
              Forgot password?
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md font-semibold transition"
            >
              Login
            </button>
            <p className="text-center text-sm">
              Don’t have an account?{' '}
              <Link to="/register" className="text-purple-600 hover:underline">
                Signup now
              </Link>
            </p>
          </form>
        </div>

        <div className="hidden md:flex w-1/2 bg-purple-600 items-center justify-center text-white p-10">
          <div className="text-center max-w-sm">
            <h2 className="text-2xl font-bold mb-4">Precision. Clarity. Confidence. That’s TruBalance.</h2>
            <p className="text-sm">Let's get connected</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
