import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Amaravati Admin Panel</h2>
      <nav style={{ marginBottom: '20px' }}>
        <Link to="/dashboard" style={{ marginRight: '15px' }}>Dashboard</Link>
        <Link to="/users" style={{ marginRight: '15px' }}>Users</Link>
        <Link to="/drivers" style={{ marginRight: '15px' }}>Drivers</Link>
        <Link to="/rides" style={{ marginRight: '15px' }}>Rides</Link>
        <button onClick={handleLogout} style={{ marginLeft: '30px' }}>Logout</button>
      </nav>
      {children}
    </div>
  );
};

export default Layout;
