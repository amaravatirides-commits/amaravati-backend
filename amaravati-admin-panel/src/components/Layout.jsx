// src/components/Layout.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Layout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-blue-600">Admin Panel</h1>
        </div>
        <nav className="mt-4">
          <ul>
            <li>
              <Link
                to="/dashboard"
                className="block py-2 px-6 hover:bg-gray-200 transition"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/users"
                className="block py-2 px-6 hover:bg-gray-200 transition"
              >
                Manage Users
              </Link>
            </li>
            <li>
              <Link
                to="/drivers"
                className="block py-2 px-6 hover:bg-gray-200 transition"
              >
                Manage Drivers
              </Link>
            </li>
            <li>
              <Link
                to="/rides"
                className="block py-2 px-6 hover:bg-gray-200 transition"
              >
                Manage Rides
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 px-6 hover:bg-red-100 text-red-600 transition mt-6"
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}

export default Layout;
