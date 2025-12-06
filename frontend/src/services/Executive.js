import { ENDPOINT_URL } from '../../urlConfig';
import axios from 'axios';

// Get auth token from localStorage
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getExecutives = async () => {
    return await axios.get(ENDPOINT_URL.EXECUTIVES, {
        headers: getAuthHeaders()
    });
};

export const getExecutiveById = async (id) => {
    return await axios.get(`${ENDPOINT_URL.EXECUTIVES}/${id}`, {
        headers: getAuthHeaders()
    });
};

export const createExecutive = async (executiveData) => {
    return await axios.post(ENDPOINT_URL.EXECUTIVES, executiveData, {
        headers: getAuthHeaders()
    });
};

export const updateExecutive = async (id, executiveData) => {
    return await axios.put(`${ENDPOINT_URL.EXECUTIVES}/${id}`, executiveData, {
        headers: getAuthHeaders()
    });
};

export const deleteExecutive = async (id) => {
    return await axios.delete(`${ENDPOINT_URL.EXECUTIVES}/${id}`, {
        headers: getAuthHeaders()
    });
};

