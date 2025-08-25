// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import axios from "axios";

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

function DashboardPage() {
  const [stats, setStats] = useState({ users: 0, drivers: 0, rides: 0 });
  const [vehicleStats, setVehicleStats] = useState([]);
  const [dailyRides, setDailyRides] = useState([]);
  const [dailyEarnings, setDailyEarnings] = useState([]);
  const [activeDrivers, setActiveDrivers] = useState([]);
  const [driverStats, setDriverStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const headers = { Authorization: `Bearer ${token}` };

        const [usersRes, driversRes, ridesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/admin/users", { headers }),
          axios.get("http://localhost:5000/api/admin/drivers", { headers }),
          axios.get("http://localhost:5000/api/admin/rides", { headers }),
        ]);

        const rides = ridesRes.data;
        const drivers = driversRes.data;

        // Vehicle type counts
        const vehicleCounts = {};
        rides.forEach((ride) => {
          const type = (ride.vehicleType || "unknown").toLowerCase();
          vehicleCounts[type] = (vehicleCounts[type] || 0) + 1;
        });
        const vehicleData = Object.keys(vehicleCounts).map((key) => ({
          vehicle: `${VEHICLE_ICONS[key] || "❓"} ${key.charAt(0).toUpperCase() + key.slice(1)}`,
          count: vehicleCounts[key],
        }));

        // Last 7 days
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          return d.toISOString().split("T")[0];
        }).reverse();

        // Daily rides & earnings
        const ridesDaily = last7Days.map((date) => ({
          date,
          count: rides.filter((ride) => ride.createdAt?.split("T")[0] === date).length,
        }));

        const earningsDaily = last7Days.map((date) => ({
          date,
          earnings: rides
            .filter((ride) => ride.createdAt?.split("T")[0] === date)
            .reduce((sum, r) => sum + (r.fare || 0), 0),
        }));

        // Active drivers
        const activeDriversData = drivers.map((driver) => ({
          name: driver.name || driver.email,
          online: driver.isOnline ? 1 : 0,
        }));

        // Driver analytics: rides per driver & earnings per driver
        const driverStatsData = drivers.map((driver) => {
          const driverRides = rides.filter((ride) => ride.driver?._id === driver._id);
          const totalEarnings = driverRides.reduce((sum, r) => sum + (r.fare || 0), 0);
          return {
            name: driver.name || driver.email,
            rides: driverRides.length,
            earnings: totalEarnings,
          };
        });

        setStats({
          users: usersRes.data.length,
          drivers: drivers.length,
          rides: rides.length,
        });
        setVehicleStats(vehicleData);
        setDailyRides(ridesDaily);
        setDailyEarnings(earningsDaily);
        setActiveDrivers(activeDriversData);
        setDriverStats(driverStatsData);
      } catch (err) {
        console.error("Error fetching dashboard stats", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: "#e3f2fd" }}>
            <CardContent>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h4">{stats.users}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: "#f1f8e9" }}>
            <CardContent>
              <Typography variant="h6">Total Drivers</Typography>
              <Typography variant="h4">{stats.drivers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: "#fff3e0" }}>
            <CardContent>
              <Typography variant="h6">Total Rides</Typography>
              <Typography variant="h4">{stats.rides}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom style={{ marginTop: "30px" }}>
        Rides by Vehicle Type
      </Typography>
      {vehicleStats.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={vehicleStats}>
            <XAxis dataKey="vehicle" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>
      )}

      <Typography variant="h5" gutterBottom style={{ marginTop: "30px" }}>
        Daily Rides (Last 7 Days)
      </Typography>
      {dailyRides.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyRides} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#ff5722" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      )}

      <Typography variant="h5" gutterBottom style={{ marginTop: "30px" }}>
        Daily Earnings (Last 7 Days)
      </Typography>
      {dailyEarnings.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyEarnings} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="earnings" stroke="#ffc107" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      )}

      <Typography variant="h5" gutterBottom style={{ marginTop: "30px" }}>
        Active Drivers
      </Typography>
      {activeDrivers.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={activeDrivers}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="online" fill="#4caf50" />
          </BarChart>
        </ResponsiveContainer>
      )}

      <Typography variant="h5" gutterBottom style={{ marginTop: "30px" }}>
        Driver Analytics (Rides & Earnings)
      </Typography>
      {driverStats.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={driverStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={150} />
            <Tooltip />
            <Bar dataKey="rides" fill="#2196f3" name="Total Rides" />
            <Bar dataKey="earnings" fill="#ff9800" name="Total Earnings" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Layout>
  );
}

export default DashboardPage;