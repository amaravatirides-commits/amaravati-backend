import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

function RidesPage() {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    const fetchRides = async () => {
      const token = localStorage.getItem('adminToken');

      try {
        const res = await axios.get('http://localhost:5000/api/admin/rides', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRides(res.data);
      } catch (err) {
        console.error('Error fetching rides:', err);
      }
    };

    fetchRides();
  }, []);

  return (
    <Layout>
      <h2>Rides List</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>User</th>
            <th>Driver</th>
            <th>Pickup</th>
            <th>Drop</th>
            <th>Status</th>
            <th>Fare</th>
          </tr>
        </thead>
        <tbody>
          {rides.length === 0 ? (
            <tr><td colSpan="6">No rides found</td></tr>
          ) : (
            rides.map((ride) => (
              <tr key={ride._id}>
                <td>{ride.user?.name || 'N/A'}</td>
                <td>{ride.driver?.name || 'N/A'}</td>
                <td>{ride.pickupLocation}</td>
                <td>{ride.dropLocation}</td>
                <td>{ride.status}</td>
                <td>{ride.fare ? `₹${ride.fare}` : 'N/A'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Layout>
  );
}

export default RidesPage;
