import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

function DriversPage() {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    const fetchDrivers = async () => {
      const token = localStorage.getItem('adminToken');

      try {
        const res = await axios.get('http://localhost:5000/api/admin/drivers', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDrivers(res.data);
      } catch (err) {
        console.error('Error fetching drivers:', err);
      }
    };

    fetchDrivers();
  }, []);

  return (
    <Layout>
      <h2>Drivers List</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Vehicle</th>
          </tr>
        </thead>
        <tbody>
          {drivers.length === 0 ? (
            <tr><td colSpan="3">No drivers found</td></tr>
          ) : (
            drivers.map((driver) => (
              <tr key={driver._id}>
                <td>{driver.name}</td>
                <td>{driver.phone}</td>
                <td>{driver.vehicle || 'N/A'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Layout>
  );
}

export default DriversPage;
