import React from "react";
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import { Link } from "react-router-dom";
import { People } from "@mui/icons-material";

const Sidebar = () => {
    const menuItems = [
        { label: "Dashboard", route: "/dashboard", icon: <DashboardIcon /> },
        { label: "Member", route: "/society", icon: <People /> },
        { label: "Member List", route: "/memberdetail", icon: <AdminPanelSettingsIcon /> },
        { label: "Report", route: "/report", icon: <AssessmentIcon /> },
        { label: "Amenities Booking", route: "/amenities", icon: <EventSeatIcon /> },
        { label: "Settings", route: "/settings", icon: <SettingsIcon /> },
        { label: "Greeting", route: "/greeting", icon: <EventSeatIcon /> },
        { label: "Guarantor", route: "/guarantor", icon: <People /> },
        { label: "Guarantor List", route: "/guarantorList", icon: <People /> },
    ];

    return (
        <Box
            sx={{
                width: 240,
                height: "100vh",
                bgcolor: "#f9fbfd",
                borderRight: "1px solid #e0e0e0",
                p: 2,
            }}
        >
            <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#1a237e", mb: 2, textAlign: "center" }}
            >
                CA Co-Operative Socity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
                {menuItems.map((item) => (
                    <ListItem button
                        key={item.label}
                        component={Link}
                        to={item.route}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default Sidebar;