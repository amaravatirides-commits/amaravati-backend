// src/config.js

// Base URL of your deployed backend (Render)
export const BASE_URL = "https://amaravati-backend-cj4n.onrender.com/api";

// Function to get Authorization headers for axios requests
export const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
};
