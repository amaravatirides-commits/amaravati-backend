import axios from "axios";

const API_URL = "http://localhost:5000/api/admin";

export const loginAdmin = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/login`, { email, password });
    if (res.data.token) {
      localStorage.setItem("adminToken", res.data.token);
      return true;
    }
    return false;
  } catch (err) {
    console.error("Login error:", err.response?.data || err.message);
    return false;
  }
};

export const logoutAdmin = () => {
  localStorage.removeItem("adminToken");
};