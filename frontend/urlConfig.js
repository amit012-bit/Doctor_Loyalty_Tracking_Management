// Backend URL - update this to your deployed backend URL
export const BASE_URL = process.env.VITE_API_BASE_URL || 'https://doctor-loyalty-tracking-management.onrender.com';
// export const BASE_URL = 'http://localhost:5000';
export const API_URL = `${BASE_URL}/api`;

export const ENDPOINT_URL = {
    LOGIN: `${API_URL}/users/login`,
    REGISTER: `${API_URL}/users/register`,
    USERS: `${API_URL}/users`,
    TRANSACTIONS: `${API_URL}/transactions`,
    TRANSACTIONS_STATISTICS: `${API_URL}/transactions/statistics`,
    LOCATIONS: `${API_URL}/locations`,    
    DOCTORS: `${API_URL}/doctors`,
    EXECUTIVES: `${API_URL}/executives`,
    PLATFORM_SETTINGS: `${API_URL}/platform-settings`,
}
