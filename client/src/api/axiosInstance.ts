import axios from "axios";
// import dotenv from "dotenv";

// dotenv.config();

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");

    // Only add the Authorization header if the token exists and the request is not to the register endpoint
    if (token && !config.url?.includes('/api/register')) {
        config.headers!["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
