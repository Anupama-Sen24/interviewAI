import axios from 'axios';
import { auth } from '../firebase';

const api = axios.create({
<<<<<<< HEAD
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
=======
  baseURL: "https://interviewai-w9rz.onrender.com",
>>>>>>> fd1b1cdbd1e7a93ffc8cc986e3fa460c34d1a71d
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
