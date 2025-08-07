import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import UsersPage from './pages/UsersPage';
import DriversPage from './pages/DriversPage';
import RidesPage from './pages/RidesPage';

function App() {
  const isLoggedIn = !!localStorage.getItem('adminToken');

  return (
    <Router>
      <Routes>
        <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/users" element={isLoggedIn ? <UsersPage /> : <Navigate to="/" />} />
        <Route path="/drivers" element={isLoggedIn ? <DriversPage /> : <Navigate to="/" />} />
        <Route path="/rides" element={isLoggedIn ? <RidesPage /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
