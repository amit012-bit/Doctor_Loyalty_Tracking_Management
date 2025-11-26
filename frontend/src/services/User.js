import { ENDPOINT_URL } from '../../urlConfig';
import axios from 'axios';

// Get token from localStorage for authenticated requests
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const loginUser = async (email, password) => {
    return await axios.post(ENDPOINT_URL.LOGIN, { email, password });
}

export const registerUser = async (userData) => {
    return await api.post(ENDPOINT_URL.REGISTER, userData);
}