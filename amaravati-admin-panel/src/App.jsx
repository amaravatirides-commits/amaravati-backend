import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import DriversPage from "./pages/DriversPage.jsx";
import RidesPage from "./pages/RidesPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }/>
        <Route path="/users" element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }/>
        <Route path="/drivers" element={
          <ProtectedRoute>
            <DriversPage />
          </ProtectedRoute>
        }/>
        <Route path="/rides" element={
          <ProtectedRoute>
            <RidesPage />
          </ProtectedRoute>
        }/>
      </Routes>
    </Router>
  );
}

export default App;
