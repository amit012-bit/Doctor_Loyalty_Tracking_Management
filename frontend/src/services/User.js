import { ENDPOINT_URL } from '../../urlConfig';
import axios from 'axios';

export const loginUser = async (email, password) => {
    return await axios.post(ENDPOINT_URL.LOGIN, { email, password });
}