import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({ baseURL });

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mora_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mora_admin_token');
      localStorage.removeItem('mora_admin_user');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
