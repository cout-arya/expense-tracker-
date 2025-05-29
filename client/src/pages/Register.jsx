import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
<div
  className="flex items-center justify-center min-h-screen w-full"
  style={{
    backgroundImage: "url('/bg.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
  <div className="flex w-full max-w-4xl rounded-lg shadow-lg overflow-hidden bg-white/90">
    {/* Registration Form */}
    <div className="w-full md:w-1/2 p-10">
      <h2 className="text-3xl font-bold mb-6 text-purple-800 border-b-2 border-purple-600 pb-2">
        Register
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center border-b border-gray-300 py-2">
          <FaUser className="text-gray-400 mr-3" />
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            className="w-full focus:outline-none bg-transparent"
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex items-center border-b border-gray-300 py-2">
          <FaEnvelope className="text-gray-400 mr-3" />
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            className="w-full focus:outline-none bg-transparent"
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
            className="w-full focus:outline-none bg-transparent"
            onChange={handleChange}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md font-semibold transition"
        >
          Register
        </button>
        <p className="text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-600 hover:underline">
            Login now
          </Link>
        </p>
      </form>
    </div>

    {/* Visual Side Panel */}
    <div
  className="hidden md:flex w-1/2 items-center justify-center text-white p-10 bg-purple-600"

>




      <div className="text-center max-w-sm">
        <h2 className="text-2xl font-bold mb-4">Start your journey with us.</h2>
        <p className="text-sm">It only takes a minute to sign up</p>
      </div>
    </div>
  </div>
</div>

  );
}

export default Register;
