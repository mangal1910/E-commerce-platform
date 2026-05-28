import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// const API_BASE = process.env.REACT_APP_BACKEND_URL || 'https://your-render-app.onrender.com';

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("velos_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
