import { ENDPOINT_URL, API_URL } from '../../urlConfig';
import axios from 'axios';

// Get token from localStorage for authenticated requests
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
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

export const loginUser = async (username, password) => {
    return await axios.post(ENDPOINT_URL.LOGIN, { username, password });
}

export const registerUser = async (userData) => {
    return await api.post(ENDPOINT_URL.REGISTER, userData);
}

export const getUsers = async () => {
    return await api.get(ENDPOINT_URL.USERS);
}

export const createUser = async (userData) => {
    return await api.post(ENDPOINT_URL.REGISTER, userData);
}

export const updateUserById = async (userId, userData) => {
    return await api.put(`${ENDPOINT_URL.USERS}/${userId}`, userData);
}

export const getUserById = async (userId) => {
    return await api.get(`${ENDPOINT_URL.USERS}/${userId}`);
}

export const getCurrentUser = async () => {
    return await api.get(`${ENDPOINT_URL.USERS}/me`);
}

export const updateCurrentUser = async (userData) => {
    return await api.put(`${ENDPOINT_URL.USERS}/me`, userData);
}