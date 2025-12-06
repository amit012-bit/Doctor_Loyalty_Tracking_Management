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

export const createTransaction = async (transactionData) => {
  return await axios.post(ENDPOINT_URL.TRANSACTIONS, transactionData, {
    headers: getAuthHeaders()
  });
};

export const createBulkTransactions = async (transactions) => {
  return await axios.post(`${ENDPOINT_URL.TRANSACTIONS}/bulk`, { transactions }, {
    headers: getAuthHeaders()
  });
};

export const assignExecutive = async (transactionId, executiveId) => {
  return await axios.patch(`${ENDPOINT_URL.TRANSACTIONS}/${transactionId}/assign-executive`, 
    { executiveId },
    { headers: getAuthHeaders() }
  );
};

export const updateTransaction = async (transactionId, updateData) => {
  return await axios.put(`${ENDPOINT_URL.TRANSACTIONS}/${transactionId}`, updateData, {
    headers: getAuthHeaders()
  });
};

export const verifyOTP = async (transactionId, otp) => {
  return await axios.patch(`${ENDPOINT_URL.TRANSACTIONS}/${transactionId}/verify-otp`, 
    { otp },
    { headers: getAuthHeaders() }
  );
};

export const resendOTP = async (transactionId) => {
  return await axios.post(`${ENDPOINT_URL.TRANSACTIONS}/${transactionId}/resend-otp`, 
    {},
    { headers: getAuthHeaders() }
  );
};

