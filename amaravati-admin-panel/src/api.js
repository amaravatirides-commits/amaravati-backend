import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create Axios instance with token from localStorage
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Attach token to each request automatically
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Exported functions to call backend routes
export const fetchUsers = () => axiosInstance.get('/admin/users');
export const fetchDrivers = () => axiosInstance.get('/admin/drivers');
export const fetchRides = () => axiosInstance.get('/admin/rides');
