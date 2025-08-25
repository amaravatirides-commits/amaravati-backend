// src/components/PublicRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

export default function PublicRoute() {
  const location = useLocation();
  return isLoggedIn()
    ? <Navigate to="/dashboard" replace state={{ from: location }} />
    : <Outlet />;
}