import axios from 'axios';

// Use environment variables for all API endpoints
const API_URL = import.meta.env.VITE_BACKEND_URL;
const CRUD_URL = import.meta.env.VITE_BACKEND_2_URL;
const COMPILER_URL = import.meta.env.VITE_BACKEND_3_URL;

// Create axios instances for different services
export const authApi = axios.create({
  baseURL: `${API_URL}/auth`,
});

export const crudApi = axios.create({
  baseURL: `${CRUD_URL}/crud`,
});

export const compilerApi = axios.create({
  baseURL: COMPILER_URL,
});
