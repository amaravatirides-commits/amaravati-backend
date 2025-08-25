// src/pages/RidesPage.jsx
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import axios from "axios";

function RidesPage() {
  const [rides, setRides] = useState([]);
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/rides", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRides(res.data.rides); // assuming backend returns { rides: [...] }
      } catch (err) {
        console.error("Error fetching rides:", err);
      }
    };
    fetchRides();
  }, [token]);

  return (
    <Layout>
      <h1>Rides Management</h1>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Driver</th>
            <th>Pickup</th>
            <th>Destination</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rides.map((ride) => (
            <tr key={ride._id}>
              <td>{ride._id}</td>
              <td>{ride.user?.email || "N/A"}</td>
              <td>{ride.driver?.name || "N/A"}</td>
              <td>{ride.pickup || ""}</td>
              <td>{ride.destination || ""}</td>
              <td>{ride.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

export default RidesPage;