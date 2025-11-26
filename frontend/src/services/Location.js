import { ENDPOINT_URL } from '../../urlConfig';
import axios from 'axios';

// Get auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getLocations = async () => {
  return await axios.get(ENDPOINT_URL.LOCATIONS, {
    headers: getAuthHeaders()
  });
};

export const getLocationById = async (id) => {
  return await axios.get(`${ENDPOINT_URL.LOCATIONS}/${id}`, {
    headers: getAuthHeaders()
  });
};

