import { ENDPOINT_URL } from '../../urlConfig';
import axios from 'axios';

// Get auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getTransactions = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      queryParams.append(key, filters[key]);
    }
  });
  
  const url = queryParams.toString() 
    ? `${ENDPOINT_URL.TRANSACTIONS}?${queryParams.toString()}`
    : ENDPOINT_URL.TRANSACTIONS;
    
  return await axios.get(url, {
    headers: getAuthHeaders()
  });
};

export const getTransactionStatistics = async () => {
  return await axios.get(ENDPOINT_URL.TRANSACTIONS_STATISTICS, {
    headers: getAuthHeaders()
  });
};

export const getTransactionById = async (id) => {
  return await axios.get(`${ENDPOINT_URL.TRANSACTIONS}/${id}`, {
    headers: getAuthHeaders()
  });
};

