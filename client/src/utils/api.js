import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with base configuration
const API = axios.create({
    baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - automatically attach auth token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors globally
API.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle different error scenarios
        if (error.response) {
            const { status, data } = error.response;

            // Handle 401 Unauthorized - redirect to login
            if (status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Only redirect if not already on login/register page
                if (!window.location.pathname.includes('/login') &&
                    !window.location.pathname.includes('/register')) {
                    window.location.href = '/login';
                    toast.error('Session expired. Please login again.');
                }
            }
            // Handle 403 Forbidden
            else if (status === 403) {
                toast.error('Access denied');
            }
            // Handle 404 Not Found
            else if (status === 404) {
                toast.error(data?.error || 'Resource not found');
            }
            // Handle 500 Server Error
            else if (status >= 500) {
                toast.error('Server error. Please try again later.');
            }
            // Handle validation errors (400)
            else if (status === 400) {
                toast.error(data?.error || 'Invalid request');
            }
            // Other errors
            else {
                toast.error(data?.error || data?.message || 'An error occurred');
            }
        } else if (error.request) {
            // Request made but no response received
            toast.error('Network error. Please check your connection.');
        } else {
            // Something else happened
            toast.error('An unexpected error occurred');
        }

        return Promise.reject(error);
    }
);

export default API;
