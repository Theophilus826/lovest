import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://lovest-backend.onrender.com/api",
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Authentication failed.");
    }

    if (error.response?.status === 403) {
      console.error(
        "Access forbidden. User may not have admin permissions."
      );
    }

    return Promise.reject(error);
  }
);

export default API;