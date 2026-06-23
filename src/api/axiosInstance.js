import axios from "axios";

export const API_BASE_URL = "https://api.fresherspot.in/api";
export const OAUTH_BASE_URL = "https://api.fresherspot.in";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// REQUEST: attach token automatically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;