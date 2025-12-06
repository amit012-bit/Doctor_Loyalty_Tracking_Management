import { ENDPOINT_URL } from '../../urlConfig';
import axios from 'axios';

// Get auth token from localStorage
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getDoctors = async () => {
    return await axios.get(ENDPOINT_URL.DOCTORS, {
        headers: getAuthHeaders()
    });
};

export const getDoctorById = async (id) => {
    return await axios.get(`${ENDPOINT_URL.DOCTORS}/${id}`, {
        headers: getAuthHeaders()
    });
};

export const createDoctor = async (doctorData) => {
    return await axios.post(ENDPOINT_URL.DOCTORS, doctorData, {
        headers: getAuthHeaders()
    });
};

export const updateDoctor = async (id, doctorData) => {
    return await axios.put(`${ENDPOINT_URL.DOCTORS}/${id}`, doctorData, {
        headers: getAuthHeaders()
    });
};

export const deleteDoctor = async (id) => {
    return await axios.delete(`${ENDPOINT_URL.DOCTORS}/${id}`, {
        headers: getAuthHeaders()
    });
};