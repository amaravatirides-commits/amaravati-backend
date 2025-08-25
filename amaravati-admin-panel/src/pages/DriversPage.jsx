// src/pages/DriversPage.jsx
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import "./DriversPage.css";

// Vehicle icons
const VEHICLE_ICONS = {
  bike: "🏍️",
  car: "🚗",
  suv: "🚙",
  auto: "🛺",
  lorry: "🚛",
  van: "🚐",
  ebike: "🛵",
  luxury: "🚘",
  tempo: "🚚",
  unknown: "❓",
};

function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDriver, setEditingDriver] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editVehicle, setEditVehicle] = useState("");
  const [search, setSearch] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("http://localhost:5000/api/admin/drivers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDrivers(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching drivers:", err);
        setLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  // Delete driver
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this driver?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:5000/api/admin/drivers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrivers(drivers.filter((d) => d._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete driver");
    }
  };

  // Open edit modal
  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setEditName(driver.name || "");
    setEditEmail(driver.email || "");
    setEditVehicle(driver.vehicleType || "");
  };

  // Save edited driver
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.put(
        `http://localhost:5000/api/admin/drivers/${editingDriver._id}`,
        { name: editName, email: editEmail, vehicleType: editVehicle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDrivers(drivers.map((d) => (d._id === res.data._id ? res.data : d)));
      setEditingDriver(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update driver");
    }
  };

  if (loading) return <p>Loading drivers...</p>;

  // Filter drivers by search
  const filteredDrivers = drivers.filter(
    (driver) =>
      [
        driver.name,
        driver.email,
        driver.vehicleType,
        driver.isOnline ? "online" : "offline",
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  // Pagination calculations
  const indexOfLastDriver = currentPage * rowsPerPage;
  const indexOfFirstDriver = indexOfLastDriver - rowsPerPage;
  const currentDrivers = filteredDrivers.slice(indexOfFirstDriver, indexOfLastDriver);
  const totalPages = Math.ceil(filteredDrivers.length / rowsPerPage);

  return (
    <Layout>
      <h1>Drivers Management</h1>

      {/* Search + Rows per page */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Search drivers..."
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

      {currentDrivers.length === 0 ? (
        <p>No drivers found.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Vehicle</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentDrivers.map((driver) => (
              <tr key={driver._id}>
                <td>{driver._id}</td>
                <td>{driver.name || "N/A"}</td>
                <td>{driver.email || "N/A"}</td>
                <td>
                  {driver.vehicleType ? (
                    <span title={driver.vehicleType}>
                      {VEHICLE_ICONS[driver.vehicleType.toLowerCase()] || "❓"} {driver.vehicleType}
                    </span>
                  ) : "N/A"}
                </td>
                <td style={{ color: driver.isOnline ? "green" : "red", fontWeight: "bold" }}>
                  {driver.isOnline ? "Online" : "Offline"}
                </td>
                <td>
                  <button onClick={() => handleEdit(driver)} className="btn-edit">Edit</button>
                  <button onClick={() => handleDelete(driver._id)} className="btn-delete">Delete</button>
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
      {editingDriver && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Driver</h2>
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
            <label>Vehicle Type:</label>
            <select
              value={editVehicle}
              onChange={(e) => setEditVehicle(e.target.value)}
              style={{ marginBottom: "10px", width: "100%" }}
            >
              <option value="">Select Vehicle</option>
              <option value="bike">Bike</option>
              <option value="car">Car</option>
              <option value="suv">SUV</option>
              <option value="auto">Auto</option>
              <option value="lorry">Lorry</option>
              <option value="van">Van</option>
              <option value="ebike">E-Bike</option>
              <option value="luxury">Luxury</option>
              <option value="tempo">Tempo</option>
            </select>
            <div className="modal-buttons">
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setEditingDriver(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default DriversPage;