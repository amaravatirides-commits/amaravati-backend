// src/pages/RidesPage.jsx
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import axios from "axios";
import "./RidesPage.css";

// Status badge colors
const STATUS_COLORS = {
  requested: "#ff9800",
  accepted: "#2196f3",
  ongoing: "#2196f3",
  completed: "#4caf50",
  cancelled: "#f44336",
};

// Vehicle type icons
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
};

function RidesPage() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRide, setEditingRide] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch rides from backend
  useEffect(() => {
    const fetchRides = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("http://localhost:5000/api/admin/rides", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRides(res.data);
      } catch (error) {
        console.error("Error fetching rides:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  // Total earnings
  const totalEarnings = rides.reduce((sum, ride) => sum + (ride.fare || 0), 0);

  // Delete ride
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ride?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:5000/api/admin/rides/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRides(rides.filter((ride) => ride._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete ride");
    }
  };

  // Edit ride
  const handleEdit = (ride) => {
    setEditingRide(ride);
    setEditStatus(ride.status || "");
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.put(
        `http://localhost:5000/api/admin/rides/${editingRide._id}`,
        { status: editStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRides(rides.map((r) => (r._id === res.data.data._id ? res.data.data : r)));
      setEditingRide(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update ride status");
    }
  };

  if (loading) return <p>Loading rides...</p>;

  // Filter rides
  const filteredRides = rides.filter(
    (ride) =>
      (!vehicleFilter || ride.vehicleType?.toLowerCase() === vehicleFilter) &&
      [ride.user?.email, ride.driver?.email, ride.pickupLocation?.coordinates.join(","), ride.dropLocation?.coordinates.join(","), ride.status]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  // Pagination
  const indexOfLastRide = currentPage * rowsPerPage;
  const indexOfFirstRide = indexOfLastRide - rowsPerPage;
  const currentRides = filteredRides.slice(indexOfFirstRide, indexOfLastRide);
  const totalPages = Math.ceil(filteredRides.length / rowsPerPage);

  return (
    <Layout>
      <h1>Rides Management</h1>

      {/* Total Earnings */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ backgroundColor: "#e8f5e9", padding: "10px 20px", borderRadius: "8px", display: "inline-block" }}>
          <strong>Total Earnings: </strong> ₹{totalEarnings}
        </div>
      </div>

      {/* Search + Filter + Rows per page */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Search rides..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "5px", width: "200px" }}
        />
        <div>
          <label>Vehicle: </label>
          <select value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)}>
            <option value="">All</option>
            {Object.keys(VEHICLE_ICONS).map((v) => (
              <option key={v} value={v}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </option>
            ))}
          </select>
          &nbsp;&nbsp;
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

      {currentRides.length === 0 ? (
        <p>No rides found.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Driver</th>
              <th>Pickup</th>
              <th>Destination</th>
              <th>Vehicle</th>
              <th>Status</th>
              <th>Fare</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRides.map((ride) => (
              <tr key={ride._id}>
                <td>{ride._id}</td>
                <td>{ride.user?.email || "N/A"}</td>
                <td>{ride.driver?.email || "N/A"}</td>
                <td>
                  {ride.pickupLocation
                    ? `${ride.pickupLocation.coordinates[1].toFixed(5)}, ${ride.pickupLocation.coordinates[0].toFixed(5)}`
                    : "N/A"}
                </td>
                <td>
                  {ride.dropLocation
                    ? `${ride.dropLocation.coordinates[1].toFixed(5)}, ${ride.dropLocation.coordinates[0].toFixed(5)}`
                    : "N/A"}
                </td>
                <td>
                  {ride.vehicleType ? (
                    <span title={ride.vehicleType}>
                      {VEHICLE_ICONS[ride.vehicleType.toLowerCase()] || "❓"} {ride.vehicleType}
                    </span>
                  ) : "N/A"}
                </td>
                <td>
                  <span
                    style={{
                      backgroundColor: STATUS_COLORS[ride.status] || "#9e9e9e",
                      color: "#fff",
                      fontWeight: "bold",
                      padding: "3px 8px",
                      borderRadius: "5px",
                    }}
                  >
                    {ride.status}
                  </span>
                </td>
                <td>{ride.fare ? `₹${ride.fare}` : "N/A"}</td>
                <td>
                  <button onClick={() => handleEdit(ride)} className="btn-edit">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(ride._id)} className="btn-delete">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
          Prev
        </button>
        <span style={{ margin: "0 10px" }}>
          Page {currentPage} of {totalPages}
        </span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
          Next
        </button>
      </div>

      {/* Edit Modal */}
      {editingRide && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Ride Status</h2>
            <label>Status:</label>
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
              <option value="requested">Requested</option>
              <option value="accepted">Accepted</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="modal-buttons">
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setEditingRide(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default RidesPage;
