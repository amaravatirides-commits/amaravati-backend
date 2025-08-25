import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import DriveEtaIcon from "@mui/icons-material/DriveEta";
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Manage Users", icon: <PeopleIcon />, path: "/users" },
    { text: "Manage Drivers", icon: <DriveEtaIcon />, path: "/drivers" },
    { text: "Manage Rides", icon: <LocalTaxiIcon />, path: "/rides" },
  ];

  return (
    <Drawer variant="permanent" anchor="left">
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;