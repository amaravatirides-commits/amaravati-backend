// src/pages/UsersPage.jsx
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import "./UsersPage.css";

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [search, setSearch] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
        alert("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((user) => user._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  // Open edit modal
  const handleEdit = (user) => {
    setEditingUser(user);
    setEditName(user.name || "");
    setEditEmail(user.email || "");
  };

  // Save edited user
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.put(
        `http://localhost:5000/api/admin/users/${editingUser._id}`,
        { name: editName, email: editEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map((u) => (u._id === res.data._id ? res.data : u)));
      setEditingUser(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update user");
    }
  };

  if (loading) return <p>Loading users...</p>;

  // Filter users by search
  const filteredUsers = users.filter(
    (user) =>
      [user.name, user.email].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  // Pagination calculations
  const indexOfLastUser = currentPage * rowsPerPage;
  const indexOfFirstUser = indexOfLastUser - rowsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  return (
    <Layout>
      <h1>Users Management</h1>

      {/* Search + Rows per page */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "5px", width: "200px" }}
        />
        <div>
          <label>Rows per page: </label>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {currentUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.name || "N/A"}</td>
                <td>{user.email || "N/A"}</td>
                <td>
                  <button onClick={() => handleEdit(user)} className="btn-edit">Edit</button>
                  <button onClick={() => handleDelete(user._id)} className="btn-delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination controls */}
      <div style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
        <span style={{ margin: "0 10px" }}>Page {currentPage} of {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit User</h2>
            <label>Name:</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              style={{ marginBottom: "10px", width: "100%" }}
            />
            <label>Email:</label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              style={{ marginBottom: "10px", width: "100%" }}
            />
            <div className="modal-buttons">
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setEditingUser(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default UsersPage;