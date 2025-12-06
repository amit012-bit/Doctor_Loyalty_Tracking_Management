import { ENDPOINT_URL } from '../../urlConfig';
import axios from 'axios';

// Get auth token from localStorage
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getPlatformSettings = async () => {
    return await axios.get(ENDPOINT_URL.PLATFORM_SETTINGS, {
        headers: getAuthHeaders()
    });
};

export const updatePlatformSettings = async (isEnabled) => {
    return await axios.put(ENDPOINT_URL.PLATFORM_SETTINGS, { isEnabled }, {
        headers: getAuthHeaders()
    });
};

