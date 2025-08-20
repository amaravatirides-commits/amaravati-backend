// src/utils/auth.js
export const getToken = () => localStorage.getItem("adminToken");
export const setToken = (t) => localStorage.setItem("adminToken", t);
export const removeToken = () => localStorage.removeItem("adminToken");
export const isLoggedIn = () => Boolean(getToken());
